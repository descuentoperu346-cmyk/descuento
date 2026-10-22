import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuthUser } from './api';
import { CONTENT_KEY, CONTENT_URL } from './contentEnv';
import type { ServiceItem } from '../data/servicesData';
import type { Vendor } from '../data/vendorsData';
import type { PaymentMethodItem } from '../data/paymentsData';
import type { LeakArticle } from '../data/leaksData';
import { mapLeaks, mapPaymentMethods, mapProducts, mapVendors, type Row } from './leaksDb';
import { UserFacingError } from './remoteStatus';
import { isStaffAdmin, staffLoginEmail, type StaffRole } from './roles';
import { AUTH_STORAGE_KEY, type AccountInfo } from './accountStore';

/**
 * Escritura y sesión del panel contra Supabase (se carga solo cuando alguien entra al panel).
 * - Inicio de sesión: Supabase Authentication (correo + contraseña).
 * - Permisos: los decide la base (RLS) según la tabla "staff"; aquí solo se intenta guardar.
 * - Imágenes: cualquier imagen pegada como "data:image/..." se sube a Storage y se guarda su enlace.
 */
let client: SupabaseClient | null = null;

export function sb(): SupabaseClient {
  if (!client) {
    client = createClient(CONTENT_URL, CONTENT_KEY, {
      // PKCE: al volver de Google el código llega como ?code=… (no en el "#", que la web usa para sus rutas)
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: AUTH_STORAGE_KEY, flowType: 'pkce' }
    });
  }
  return client;
}

// ---------------------------------------------------------------- sesión
// Cuenta con la que se está trabajando (para enviar solo lo que esa cuenta puede guardar).
let me: AuthUser | null | undefined;
async function getMe(): Promise<AuthUser | null> {
  if (me === undefined) me = await panelGetUser();
  return me;
}

async function loadStaffUser(userId: string, email: string): Promise<AuthUser | null> {
  const { data, error } = await sb()
    .from('staff')
    .select('role, vendor_id, display_name, username, active')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data || data.active === false) return null;
  const role: StaffRole = data.role === 'dev' ? 'dev' : data.role === 'admin' ? 'admin' : 'vendor';
  return {
    id: data.vendor_id || 'admin-master',
    name: data.display_name,
    username: data.username || (email || '').split('@')[0] || data.display_name,
    role,
    allowedCategories: ['streaming', 'investigacion', 'educacion', 'leaks']
  };
}

/** Mensaje en español para los errores de Supabase Authentication. */
function authErrorMessage(error: { message?: string; status?: number; code?: string; reasons?: string[] } | null, fallback: string): string {
  const code = error?.code || '';
  const msg = error?.message || '';
  if (error?.status === 429 || /rate_limit/i.test(code)) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (/user_already_exists|email_exists/i.test(code) || /already registered/i.test(msg)) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (/weak_password/i.test(code)) {
    // Supabase dice por qué la rechaza: muy corta, le faltan tipos de caracteres o salió en filtraciones conocidas
    const reasons = error?.reasons || [];
    const parts: string[] = [];
    if (reasons.includes('length')) {
      const min = msg.match(/at least (\d+) characters/i)?.[1];
      parts.push(min ? `Debe tener al menos ${min} caracteres.` : 'Es muy corta.');
    }
    if (reasons.includes('characters')) parts.push('Combina mayúsculas, minúsculas, números y símbolos (por ejemplo ! o #).');
    if (reasons.includes('pwned')) parts.push('Esa contraseña apareció en filtraciones de datos: elige otra distinta.');
    return parts.length ? `Contraseña no aceptada. ${parts.join(' ')}` : 'La contraseña es muy fácil de adivinar. Usa otra más larga o con más variedad.';
  }
  if (/email_address_invalid|validation_failed/i.test(code) || /invalid.*email|email.*invalid/i.test(msg)) return 'No se aceptó ese correo. Usa uno real que puedas abrir (por ejemplo de Gmail u Outlook).';
  if (/signup_disabled/i.test(code)) return 'El registro de cuentas está desactivado por ahora.';
  if (/email_provider_disabled/i.test(code)) return 'El acceso con correo está desactivado en este momento. Avisa al administrador de la web.';
  if (/email_not_confirmed/i.test(code)) return 'Falta confirmar tu correo. Revisa tu bandeja de entrada.';
  if (/captcha/i.test(code) || /captcha/i.test(msg)) return 'No se pudo comprobar la verificación de seguridad. Inténtalo de nuevo.';
  if (/same_password/i.test(code)) return 'La contraseña nueva debe ser distinta de la actual.';
  if (/reauthentication_needed/i.test(code)) return 'Por seguridad, hay que confirmar que eres tú con un código.';
  if (/reauthentication_not_valid/i.test(code)) return 'El código de seguridad es incorrecto o ya venció. Pide uno nuevo.';
  if (/otp_expired|otp_disabled/i.test(code) || /token has expired|token.*invalid|invalid.*token/i.test(msg)) return 'El código es incorrecto o ya venció. Revisa los 6 dígitos o pide uno nuevo.';
  if (/invalid_credentials/i.test(code) || error?.status === 400 || error?.status === 401 || /invalid login/i.test(msg)) {
    return 'Usuario o contraseña incorrectos.';
  }
  return fallback;
}

/** Inicio de sesión del equipo: acepta el usuario (p. ej. "@Tin9o") o un correo. */
export async function panelSignIn(identifier: string, password: string, captchaToken?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const email = staffLoginEmail(identifier);
    const { data, error } = await sb().auth.signInWithPassword({ email, password, options: captchaToken ? { captchaToken } : undefined });
    if (error || !data?.user) {
      return { success: false, error: authErrorMessage(error, 'No se pudo iniciar sesión. Inténtalo de nuevo.') };
    }
    const user = await loadStaffUser(data.user.id, data.user.email || email);
    if (!user) {
      await sb().auth.signOut();
      return { success: false, error: 'Tu cuenta no tiene acceso al panel. Pide al administrador que te dé de alta.' };
    }
    me = user;
    return { success: true, user };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor de acceso.' };
  }
}

export async function panelGetUser(): Promise<AuthUser | null> {
  try {
    const { data } = await sb().auth.getSession();
    if (!data.session) return null;
    return await loadStaffUser(data.session.user.id, data.session.user.email || '');
  } catch {
    return null;
  }
}

/**
 * Cambia la contraseña de la cuenta con sesión iniciada.
 * Si Supabase pide confirmar la identidad ("Secure password change" con la sesión vieja) devuelve `needsReauth`:
 * se pide el código con `panelRequestReauth` y se vuelve a llamar con ese código en `nonce`.
 */
export async function panelChangePassword(password: string, nonce?: string): Promise<{ error: string | null; needsReauth?: boolean }> {
  try {
    const { error } = await sb().auth.updateUser(nonce ? { password, nonce } : { password });
    if (!error) return { error: null };
    if (error.code === 'reauthentication_needed') return { error: authErrorMessage(error, error.message), needsReauth: true };
    return { error: authErrorMessage(error, error.message) };
  } catch {
    return { error: 'No se pudo conectar con el servidor de acceso.' };
  }
}

/** Envía al correo de la cuenta un código de seguridad (correo «Reauthentication»). Devuelve un mensaje de error o null. */
export async function panelRequestReauth(): Promise<string | null> {
  try {
    const { data } = await sb().auth.getSession();
    if (!data.session) return 'Tu sesión venció. Vuelve a iniciar sesión.';
    // Las cuentas del equipo tienen un correo interno que no recibe mensajes: ahí el código nunca llegaría
    if ((data.session.user.email || '').endsWith('.invalid')) return 'Por seguridad, cierra sesión, vuelve a entrar y cambia la contraseña enseguida.';
    const { error } = await sb().auth.reauthenticate();
    return error ? authErrorMessage(error, 'No se pudo enviar el código. Inténtalo de nuevo en un momento.') : null;
  } catch {
    return 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
  }
}

export async function panelSignOut(): Promise<void> {
  me = undefined;
  try {
    await sb().auth.signOut();
  } catch {
    // ignorar
  }
}

// ---------------------------------------------------------------- cuentas de la web (compradores y equipo)
interface AccountResult {
  ok: boolean;
  account?: AccountInfo | null;
  needsConfirm?: boolean;
  error?: string;
}

/** Quién tiene sesión: miembro del equipo (si está en staff y activo) o comprador. */
export async function accountGet(): Promise<AccountInfo | null> {
  try {
    const { data } = await sb().auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const email = user.email || '';
    const staff = await loadStaffUser(user.id, email);
    if (staff) {
      return { kind: 'staff', id: user.id, email, name: staff.name, username: staff.username, role: staff.role };
    }
    const { data: row } = await sb().from('buyers').select('display_name, phone').eq('user_id', user.id).maybeSingle();
    // Con el formulario de la web el nombre viene en "display_name"; con Google, en "full_name" o "name"
    const meta = (user.user_metadata || {}) as { display_name?: string; full_name?: string; name?: string; phone?: string };
    const metaName = (meta.display_name || meta.full_name || meta.name || '').trim().slice(0, 80);
    if (!row) {
      // La ficha la crea el sistema al registrarse; si faltara, la persona la crea con los datos de su registro.
      const created = { user_id: user.id, display_name: metaName || null, phone: meta.phone || null };
      await sb().from('buyers').upsert(created, { onConflict: 'user_id', ignoreDuplicates: true });
    } else if (!row.display_name && metaName) {
      // La ficha automática no conoce el nombre de Google: se completa una vez para que no quede vacía
      await sb().from('buyers').update({ display_name: metaName }).eq('user_id', user.id);
    }
    const name = (row?.display_name as string | null) || metaName || email.split('@')[0] || 'Comprador';
    return { kind: 'buyer', id: user.id, email, name, phone: ((row?.phone as string | null) ?? meta.phone) || '' };
  } catch {
    return null;
  }
}

export async function buyerSignUp(input: { email: string; password: string; name: string; phone: string }, captchaToken?: string): Promise<AccountResult> {
  try {
    me = undefined;
    const { data, error } = await sb().auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { display_name: input.name.trim(), phone: input.phone.trim() }, ...(captchaToken ? { captchaToken } : {}) }
    });
    if (error) return { ok: false, error: authErrorMessage(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.') };
    // Con "confirmar correo" activado, un correo ya registrado vuelve sin error pero sin identidades.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, error: 'Ese correo ya tiene una cuenta. Inicia sesión.' };
    }
    if (!data.session) return { ok: true, account: null, needsConfirm: true };
    return { ok: true, account: await accountGet() };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' };
  }
}

export async function accountSignIn(identifier: string, password: string, captchaToken?: string): Promise<AccountResult> {
  try {
    me = undefined;
    const email = staffLoginEmail(identifier);
    const { data, error } = await sb().auth.signInWithPassword({ email, password, options: captchaToken ? { captchaToken } : undefined });
    if (error || !data?.user) {
      // Cuenta creada pero sin confirmar: la web pasa a pedir el código del correo
      if (error?.code === 'email_not_confirmed') return { ok: false, needsConfirm: true, error: authErrorMessage(error, 'Falta confirmar tu correo.') };
      return { ok: false, error: authErrorMessage(error, 'No se pudo iniciar sesión. Inténtalo de nuevo.') };
    }
    return { ok: true, account: await accountGet() };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' };
  }
}

/**
 * Comprueba el código de 6 dígitos que llegó por correo y deja la sesión iniciada.
 * `signup`: confirmar el correo al crear la cuenta. `email`: ingresar con un código, sin contraseña.
 */
export async function buyerVerifyCode(email: string, code: string, type: 'signup' | 'email' = 'signup'): Promise<AccountResult> {
  try {
    me = undefined;
    const { data, error } = await sb().auth.verifyOtp({ email: email.trim(), token: code.trim(), type });
    if (error || !data?.session) {
      return { ok: false, error: authErrorMessage(error, 'No se pudo confirmar el código. Inténtalo de nuevo.') };
    }
    return { ok: true, account: await accountGet() };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' };
  }
}

/** Pide un código nuevo para confirmar el correo. Devuelve un mensaje de error o null si salió bien. */
export async function buyerResendCode(email: string, captchaToken?: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.resend({ type: 'signup', email: email.trim(), options: captchaToken ? { captchaToken } : undefined });
    return error ? authErrorMessage(error, 'No se pudo enviar el código. Inténtalo de nuevo en un momento.') : null;
  } catch {
    return 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
  }
}

// ---------------------------------------------------------------- olvidé mi contraseña, ingresar con código y cambiar correo
const NO_CONNECTION = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
const CODE_NOT_SENT = 'No se pudo enviar el código. Inténtalo de nuevo en un momento.';

/** Pide el código de 6 dígitos para elegir una contraseña nueva. Si el correo no tiene cuenta, Supabase responde igual: no se revela quién tiene cuenta. */
export async function buyerRequestPasswordReset(email: string, captchaToken?: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.resetPasswordForEmail(email.trim(), captchaToken ? { captchaToken } : undefined);
    return error ? authErrorMessage(error, CODE_NOT_SENT) : null;
  } catch {
    return NO_CONNECTION;
  }
}

/** Comprueba el código de recuperación. Si es correcto queda una sesión abierta, con la que se elige la contraseña nueva. */
export async function buyerVerifyRecoveryCode(email: string, code: string): Promise<string | null> {
  try {
    me = undefined;
    const { data, error } = await sb().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
    return error || !data?.session ? authErrorMessage(error, 'No se pudo confirmar el código. Inténtalo de nuevo.') : null;
  } catch {
    return NO_CONNECTION;
  }
}

/** Guarda la contraseña nueva (después de comprobar el código de recuperación) y deja a la persona dentro. */
export async function buyerSetNewPassword(password: string): Promise<AccountResult> {
  try {
    const { error } = await sb().auth.updateUser({ password });
    if (error) {
      // Sin sesión válida, Supabase responde 401: no es "usuario o contraseña incorrectos"
      if (error.status === 401 || /session_not_found|bad_jwt|no_authorization/i.test(error.code || '')) return { ok: false, error: 'Tu sesión venció. Pide un código nuevo.' };
      return { ok: false, error: authErrorMessage(error, 'No se pudo guardar la contraseña. Inténtalo de nuevo.') };
    }
    me = undefined;
    return { ok: true, account: await accountGet() };
  } catch {
    return { ok: false, error: NO_CONNECTION };
  }
}

/**
 * Pide un código de 6 dígitos para ingresar sin contraseña. No crea cuentas: para eso está el registro.
 * Un correo sin cuenta responde "otp_disabled"; se trata como enviado para no revelar quién tiene cuenta.
 */
export async function buyerRequestLoginCode(email: string, captchaToken?: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, ...(captchaToken ? { captchaToken } : {}) } });
    if (error && !/otp_disabled/i.test(error.code || '')) return authErrorMessage(error, CODE_NOT_SENT);
    return null;
  } catch {
    return NO_CONNECTION;
  }
}

/** Pide el cambio de correo de la cuenta con sesión. Supabase manda un código al correo nuevo (y, con "Secure email change", otro al actual). */
export async function buyerRequestEmailChange(newEmail: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.updateUser({ email: newEmail.trim() });
    if (!error) return null;
    if (/email_exists/i.test(error.code || '')) return 'Ese correo ya está en uso en otra cuenta.';
    return authErrorMessage(error, CODE_NOT_SENT);
  } catch {
    return NO_CONNECTION;
  }
}

/**
 * Confirma el cambio de correo con los códigos recibidos (el del correo actual y el del nuevo; basta el que llegó).
 * Lo que cuenta es el estado final de la cuenta: `email` si ya cambió, `pending` si falta el otro código.
 */
export async function buyerConfirmEmailChange(
  currentEmail: string,
  newEmail: string,
  codeCurrent: string,
  codeNew: string
): Promise<{ email?: string; pending?: boolean; error?: string }> {
  try {
    const target = newEmail.trim().toLowerCase();
    const pairs: Array<[string, string]> = [];
    if (codeCurrent.trim()) pairs.push([currentEmail.trim(), codeCurrent.trim()]);
    if (codeNew.trim()) pairs.push([target, codeNew.trim()]);
    let problem = '';
    for (const [email, token] of pairs) {
      const { error } = await sb().auth.verifyOtp({ email, token, type: 'email_change' });
      if (error && !problem) problem = authErrorMessage(error, 'No se pudo confirmar el código. Inténtalo de nuevo.');
    }
    const { data } = await sb().auth.getUser();
    const user = data.user;
    if (user && (user.email || '').toLowerCase() === target && !user.new_email) {
      me = undefined;
      return { email: user.email };
    }
    if (problem) return { error: problem };
    return { pending: true };
  } catch {
    return { error: NO_CONNECTION };
  }
}

// ---------------------------------------------------------------- ingresar con Google (redirección)
const OAUTH_RETURN_KEY = 'dp_oauth_return';
let googleOn: Promise<boolean> | null = null;

/** true si Google está encendido en Supabase. Con `fresh` se vuelve a preguntar (sin usar la respuesta guardada). */
export function googleEnabled(fresh = false): Promise<boolean> {
  if (fresh) googleOn = null;
  if (!googleOn) {
    googleOn = fetch(`${CONTENT_URL}/auth/v1/settings`, { headers: { apikey: CONTENT_KEY } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.external?.google === true)
      .catch(() => {
        googleOn = null; // sin internet: se vuelve a preguntar la próxima vez
        return false;
      });
  }
  return googleOn;
}

/** Abre Google para elegir cuenta. Si todo sale bien el navegador se va a Google y esta función no vuelve. */
export async function startGoogleSignIn(): Promise<string | null> {
  try {
    try {
      sessionStorage.setItem(OAUTH_RETURN_KEY, window.location.hash || '');
    } catch {
      // sin sessionStorage: al volver se queda en el inicio
    }
    me = undefined;
    const { error } = await sb().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/`, queryParams: { prompt: 'select_account' } }
    });
    return error ? 'No se pudo abrir Google. Inténtalo de nuevo.' : null;
  } catch {
    return 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
  }
}

/** Dónde estaba la persona antes de ir a Google (para volver ahí). */
export function takeOAuthReturn(): string {
  try {
    const v = sessionStorage.getItem(OAUTH_RETURN_KEY) || '';
    sessionStorage.removeItem(OAUTH_RETURN_KEY);
    return v;
  } catch {
    return '';
  }
}

/** Termina el ingreso con Google: Supabase vuelve a la web con ?code=… y aquí se cambia por una sesión. */
export async function finishOAuthRedirect(): Promise<{ account?: AccountInfo | null; error?: string } | null> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const problem = ['error', 'error_code', 'error_description'].map((k) => url.searchParams.get(k)).filter(Boolean).join(' ');
  if (!code && !problem) return null;
  // La dirección se limpia enseguida: el código no debe quedarse a la vista ni en el historial
  for (const k of ['code', 'error', 'error_code', 'error_description']) url.searchParams.delete(k);
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  if (!code) return { error: /access_denied|denied|cancel/i.test(problem) ? 'Cancelaste el ingreso con Google.' : 'No se pudo entrar con Google. Inténtalo de nuevo.' };
  try {
    const { error } = await sb().auth.exchangeCodeForSession(code);
    if (error) return { error: 'No se pudo entrar con Google. Inténtalo de nuevo.' };
    me = undefined;
    return { account: await accountGet() };
  } catch {
    return { error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' };
  }
}

/** Guarda nombre y teléfono del comprador con sesión. Devuelve un mensaje de error o null si salió bien. */
export async function buyerSaveProfile(name: string, phone: string): Promise<string | null> {
  try {
    const { data } = await sb().auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) return 'Tu sesión venció. Vuelve a iniciar sesión.';
    const patch = { display_name: name.trim() || null, phone: phone.trim() || null };
    const { error } = await sb().from('buyers').update(patch).eq('user_id', uid);
    return error ? 'No se pudo guardar. Inténtalo de nuevo.' : null;
  } catch {
    return 'No se pudo conectar con el servidor.';
  }
}

// ---------------------------------------------------------------- vista del DEV: equipo y compradores
export interface TeamMember {
  userId: string;
  username: string;
  role: StaffRole;
  vendorId: string;
  name: string;
  active: boolean;
}
export interface BuyerRecord {
  userId: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

/** Solo el rol DEV recibe datos de otras personas: para los demás la base devuelve a lo sumo su propia fila. */
export async function readTeamAndBuyers(): Promise<{ team: TeamMember[]; buyers: BuyerRecord[]; error: string | null }> {
  try {
    const c = sb();
    const [s, b] = await Promise.all([
      c.from('staff').select('user_id, username, role, vendor_id, display_name, active, created_at').order('created_at'),
      c.from('buyers').select('user_id, email, display_name, phone, created_at').order('created_at', { ascending: false }).limit(500)
    ]);
    if (s.error || b.error) return { team: [], buyers: [], error: 'No se pudo leer el equipo o los compradores.' };
    return {
      team: (s.data || []).map((r) => ({
        userId: r.user_id as string,
        username: (r.username as string | null) || (r.display_name as string),
        role: (r.role as StaffRole) || 'vendor',
        vendorId: (r.vendor_id as string | null) || '',
        name: r.display_name as string,
        active: r.active !== false
      })),
      buyers: (b.data || []).map((r) => ({
        userId: r.user_id as string,
        email: (r.email as string | null) || '',
        name: (r.display_name as string | null) || '',
        phone: (r.phone as string | null) || '',
        createdAt: r.created_at as string
      })),
      error: null
    };
  } catch {
    return { team: [], buyers: [], error: 'No se pudo conectar con el servidor.' };
  }
}
// ---------------------------------------------------------------- lectura con la cuenta del panel
/** Lo que ve el staff: incluye productos ocultos y (para admin) leaks en borrador. */
export async function readStaffContent() {
  const c = sb();
  const [p, v, pm, l] = await Promise.all([
    c.from('products').select('id,active,data').order('sort_order'),
    c.from('vendors').select('id,active,data').order('sort_order'),
    c.from('payment_methods').select('id,active,data').order('sort_order'),
    c.from('leaks').select('id,data').order('sort_order')
  ]);
  return {
    products: p.error ? null : mapProducts(p.data as Row<ServiceItem>[]),
    vendors: v.error ? null : mapVendors(v.data as Row<Vendor>[]),
    payments: pm.error ? null : mapPaymentMethods(pm.data as Row<PaymentMethodItem>[]),
    leaks: l.error ? null : mapLeaks(l.data as Row<LeakArticle>[])
  };
}

// ---------------------------------------------------------------- imágenes
const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const safeFolder = (s: string) => (s || 'general').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);

async function uploadDataUrl(dataUrl: string, bucket: string, folder: string): Promise<string> {
  const m = DATA_URL.exec(dataUrl);
  if (!m) return dataUrl;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const path = `${safeFolder(folder)}/${crypto.randomUUID()}.${EXT[m[1]]}`;
  const { error } = await sb().storage.from(bucket).upload(path, new Blob([bytes], { type: m[1] }), {
    contentType: m[1],
    cacheControl: '31536000',
    upsert: false
  });
  if (error) throw error;
  return sb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Recorre el objeto y sube a Storage toda imagen "data:image/..."; devuelve una copia con los enlaces. */
async function externalizeImages<T>(value: T, bucket: string, folder: string, cache = new Map<string, string>()): Promise<T> {
  if (typeof value === 'string') {
    if (!value.startsWith('data:image/')) return value;
    if (!cache.has(value)) cache.set(value, await uploadDataUrl(value, bucket, folder));
    return cache.get(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const v of value) out.push(await externalizeImages(v, bucket, folder, cache));
    return out as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = await externalizeImages(v, bucket, folder, cache);
    return out as T;
  }
  return value;
}

// ---------------------------------------------------------------- guardado (solo lo que cambió)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const fail = (error: { message: string } | null) => {
  if (error) throw error;
};

interface Diff<T extends { id: string }> {
  changed: { item: T; index: number; isNew: boolean }[];
  removed: string[];
}

function diff<T extends { id: string }>(prev: T[], next: T[]): Diff<T> {
  const prevMap = new Map(prev.map((p) => [p.id, p]));
  const nextIds = new Set(next.map((n) => n.id));
  const changed = next
    .map((item, index) => ({ item, index, isNew: !prevMap.has(item.id) }))
    .filter((c) => c.isNew || !same(prevMap.get(c.item.id), c.item));
  const removed = prev.filter((p) => !nextIds.has(p.id)).map((p) => p.id);
  return { changed, removed };
}

const replaceChanged = <T extends { id: string }>(next: T[], updated: Map<string, T>): T[] => next.map((n) => updated.get(n.id) ?? n);

export async function syncProducts(prev: ServiceItem[], next: ServiceItem[], ownFolder: string): Promise<ServiceItem[]> {
  const who = await getMe();
  const isAdmin = isStaffAdmin(who?.role);
  const diffed = diff(prev, next);
  // Un vendedor solo guarda SUS productos (la base rechazaría el resto y se perdería todo el guardado).
  const mine = (id: string, vendorId?: string) => isAdmin || (!!who && vendorId === who.id);
  const prevMap = new Map(prev.map((p) => [p.id, p]));
  const changed = diffed.changed.filter((c) => mine(c.item.id, c.item.vendorId));
  const removed = diffed.removed.filter((id) => mine(id, prevMap.get(id)?.vendorId));
  const updated = new Map<string, ServiceItem>();
  const rows = [];
  for (const { item, index } of changed) {
    const clean = await externalizeImages(item, 'catalog-media', item.vendorId || (isAdmin ? ownFolder : who?.id || ownFolder));
    updated.set(item.id, clean);
    rows.push({ id: clean.id, vendor_id: clean.vendorId ?? null, active: clean.active !== false, sort_order: index, data: clean });
  }
  if (rows.length) fail((await sb().from('products').upsert(rows, { onConflict: 'id' })).error);
  if (removed.length) fail((await sb().from('products').delete().in('id', removed)).error);
  return replaceChanged(next, updated);
}

export async function syncVendors(prev: Vendor[], next: Vendor[]): Promise<Vendor[]> {
  const who = await getMe();
  const isAdmin = isStaffAdmin(who?.role);
  const diffed = diff(prev, next);
  // Un vendedor solo guarda SU ficha; crear o borrar vendedores es cosa del administrador.
  const changed = diffed.changed.filter((c) => isAdmin || (!!who && c.item.id === who.id && !c.isNew));
  const removed = isAdmin ? diffed.removed : [];
  const updated = new Map<string, Vendor>();
  const rows = [];
  for (const { item, index } of changed) {
    const clean = await externalizeImages(item, 'catalog-media', item.id);
    updated.set(item.id, clean);
    const { pin: _pin, ...publicData } = clean; // el PIN nunca se guarda en la base
    rows.push({ id: clean.id, username: clean.username, active: clean.active !== false, sort_order: index, data: publicData });
  }
  if (rows.length) fail((await sb().from('vendors').upsert(rows, { onConflict: 'id' })).error);
  if (removed.length) fail((await sb().from('vendors').delete().in('id', removed)).error);
  return replaceChanged(next, updated);
}

export async function syncPaymentMethods(prev: PaymentMethodItem[], next: PaymentMethodItem[]): Promise<PaymentMethodItem[]> {
  const who = await getMe();
  if (!isStaffAdmin(who?.role)) {
    // Los métodos de pago generales los administra solo el administrador: no se envía nada.
    return next;
  }
  const { changed, removed } = diff(prev, next);
  const updated = new Map<string, PaymentMethodItem>();
  const rows = [];
  for (const { item, index } of changed) {
    const clean = await externalizeImages(item, 'catalog-media', 'pagos');
    updated.set(item.id, clean);
    rows.push({ id: clean.id, active: clean.active !== false, sort_order: index, data: clean });
  }
  if (rows.length) fail((await sb().from('payment_methods').upsert(rows, { onConflict: 'id' })).error);
  if (removed.length) fail((await sb().from('payment_methods').delete().in('id', removed)).error);
  return replaceChanged(next, updated);
}

export async function syncLeaks(prev: LeakArticle[], next: LeakArticle[]): Promise<LeakArticle[]> {
  const who = await getMe();
  if (!isStaffAdmin(who?.role)) throw new UserFacingError('Solo un administrador puede guardar cambios en los leaks.');
  const { changed, removed } = diff(prev, next);
  const updated = new Map<string, LeakArticle>();
  const edits = [];
  const created = [];
  for (const { item, index, isNew } of changed) {
    const clean = await externalizeImages(item, 'leaks-media', item.id);
    updated.set(item.id, clean);
    const base = {
      id: clean.id,
      slug: clean.slug,
      leak_number: clean.leakNumber ?? null,
      sort_order: index,
      featured: !!clean.featured,
      data: clean
    };
    // Un leak nuevo creado desde el panel sale publicado; en los existentes NO se toca estado ni fecha.
    if (isNew) created.push({ ...base, status: 'published', publish_at: new Date().toISOString() });
    else edits.push(base);
  }
  if (edits.length) fail((await sb().from('leaks').upsert(edits, { onConflict: 'id' })).error);
  if (created.length) fail((await sb().from('leaks').insert(created)).error);
  if (removed.length) fail((await sb().from('leaks').delete().in('id', removed)).error);
  return replaceChanged(next, updated);
}
