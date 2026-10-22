import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, LayoutDashboard, Loader2, LogOut, MailCheck, ShieldCheck, X } from 'lucide-react';
import { closeAuth, setAccount, signOutAccount, useAccount, type AccountInfo, type AuthRequest } from '../lib/accountStore';
import { isStaffAdmin, roleLabel } from '../lib/roles';
import { setAdminHint } from '../lib/adminHint';
import { goToPanel } from '../lib/panelRoute';
import { PasswordChange } from './PasswordChange';
import { CaptchaWidget, type CaptchaHandle } from './CaptchaWidget';
import { CAPTCHA_ENABLED } from '../lib/captcha';

type View = 'login' | 'register' | 'confirm' | 'done' | 'account';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{6,20}$/;
const MIN_PASSWORD = 8;

const fieldClass =
  'w-full rounded-2xl border border-zinc-700 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00ff88] placeholder:text-slate-500';
const labelClass = 'mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400';

interface Props {
  request: AuthRequest;
}

/** Ingresar, crear cuenta de comprador y "Mi cuenta". También sirve de entrada para el equipo (usuario + clave). */
export const AuthModal: React.FC<Props> = ({ request }) => {
  const state = useAccount();
  const [view, setView] = useState<View>(() => (state.status === 'in' ? (request.welcome ? 'done' : 'account') : request.mode === 'register' ? 'register' : 'login'));
  const [googleOn, setGoogleOn] = useState(false);
  const [account, setLocalAccount] = useState<AccountInfo | null>(state.account);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  // Verificación "no soy un robot" (solo si hay llave configurada): cada resultado sirve para un solo intento
  const [captcha, setCaptcha] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaHandle>(null);
  // Confirmación del correo con el código de 6 dígitos
  const [confirmEmail, setConfirmEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  // login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // registro / perfil
  const [name, setName] = useState(state.account?.name ?? '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(state.account?.phone ?? '');

  // Si la sesión se confirma mientras el formulario está abierto (otra pestaña, sesión restaurada), pasar a "Mi cuenta".
  useEffect(() => {
    if (state.status === 'in' && state.account && (view === 'login' || view === 'register')) {
      setLocalAccount(state.account);
      setName(state.account.name);
      setPhone(state.account.phone ?? '');
      setView(request.mode === 'account' ? 'account' : 'done');
    }
  }, [state.status, state.account, view, request.mode]);

  // Cerrar con Escape, mantener el foco dentro y devolverlo al cerrar
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuth();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const el = dialogRef.current?.querySelector<HTMLElement>('input');
    el?.focus();
  }, [view]);

  // Se pregunta una vez si Google ya está encendido en Supabase (el botón se ve siempre; si no está encendido, avisa al tocarlo)
  useEffect(() => {
    let off = false;
    void import('../lib/supabaseBrowser')
      .then((m) => m.googleEnabled())
      .then((v) => {
        if (!off) setGoogleOn(v);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  const googleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    setGoogleError('');
    const m = await import('../lib/supabaseBrowser');
    // Si Google aún no está encendido en Supabase, ir a Google mostraría una página de error: se avisa aquí
    if (!googleOn && !(await m.googleEnabled(true).catch(() => false))) {
      setBusy(false);
      setGoogleError('El ingreso con Google todavía no está activado. Por ahora usa tu correo.');
      return;
    }
    setGoogleOn(true);
    const msg = await m.startGoogleSignIn();
    // Si salió bien, el navegador ya se está yendo a Google: el botón se queda ocupado hasta que cambie la página
    if (msg) {
      setBusy(false);
      setGoogleError(msg);
    }
  };

  const switchView = (next: View) => {
    setView(next);
    setError('');
    setGoogleError('');
    setNotice('');
    setPassword('');
    setCode('');
    setCaptcha(null); // la verificación de la vista anterior ya no sirve: cada formulario pide la suya
  };

  // Espera entre un código y el siguiente (evita pedir correos sin parar)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Escribe los 6 dígitos del código.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    const m = await import('../lib/supabaseBrowser');
    const res = await m.buyerVerifyCode(confirmEmail, code);
    setBusy(false);
    if (!res.ok || !res.account) {
      setError(res.error || 'No se pudo confirmar el código. Inténtalo de nuevo.');
      setCode('');
      return;
    }
    finishAuth(res.account);
  };

  const resendCode = async () => {
    if (busy || cooldown > 0) return;
    if (CAPTCHA_ENABLED && !captcha) {
      setError('Completa la verificación de seguridad para pedir otro código.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    const m = await import('../lib/supabaseBrowser');
    const msg = await m.buyerResendCode(confirmEmail, captcha ?? undefined);
    setBusy(false);
    captchaRef.current?.reset(); // cada verificación sirve para un solo envío
    if (msg) {
      setError(msg);
      return;
    }
    setCode('');
    setNotice('Te enviamos un código nuevo. Revisa tu correo y la carpeta de spam.');
    setCooldown(60);
  };

  const finishAuth = (acc: AccountInfo) => {
    setAccount(acc);
    setAdminHint(acc.kind === 'staff' && isStaffAdmin(acc.role));
    setLocalAccount(acc);
    setName(acc.name);
    setPhone(acc.phone ?? '');
    setPassword('');
    setView('done');
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!identifier.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    if (CAPTCHA_ENABLED && !captcha) {
      setError('Completa la verificación de seguridad.');
      return;
    }
    setBusy(true);
    setError('');
    const m = await import('../lib/supabaseBrowser');
    const res = await m.accountSignIn(identifier, password, captcha ?? undefined);
    setBusy(false);
    if (!res.ok) {
      // Cuenta creada pero sin confirmar: se pasa a pedir el código (se puede pedir uno nuevo)
      if (res.needsConfirm && identifier.includes('@')) {
        setConfirmEmail(identifier.trim());
        setCooldown(0);
        switchView('confirm');
        return;
      }
      setError(res.error || 'Algo salió mal. Inténtalo de nuevo.');
      setPassword('');
      captchaRef.current?.reset();
      return;
    }
    if (res.account) finishAuth(res.account);
    else setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (name.trim().length < 2) return setError('Escribe tu nombre.');
    if (!EMAIL_RE.test(email.trim())) return setError('Escribe un correo válido.');
    if (phone.trim() && !PHONE_RE.test(phone.trim())) return setError('El teléfono solo puede tener números, espacios, guiones y un + al inicio.');
    if (password.length < MIN_PASSWORD) return setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
    if (CAPTCHA_ENABLED && !captcha) return setError('Completa la verificación de seguridad.');
    setBusy(true);
    setError('');
    const m = await import('../lib/supabaseBrowser');
    const res = await m.buyerSignUp({ email, password, name, phone }, captcha ?? undefined);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Algo salió mal. Inténtalo de nuevo.');
      captchaRef.current?.reset();
      return;
    }
    if (res.needsConfirm || !res.account) {
      setConfirmEmail(email.trim());
      setCooldown(60); // el código recién salió: se espera un minuto antes de pedir otro
      switchView('confirm');
      return;
    }
    finishAuth(res.account);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (name.trim().length < 2) return setError('Escribe tu nombre.');
    if (phone.trim() && !PHONE_RE.test(phone.trim())) return setError('El teléfono solo puede tener números, espacios, guiones y un + al inicio.');
    setBusy(true);
    setError('');
    setNotice('');
    const m = await import('../lib/supabaseBrowser');
    const msg = await m.buyerSaveProfile(name, phone);
    setBusy(false);
    if (msg) return setError(msg);
    if (account) {
      const updated = { ...account, name: name.trim(), phone: phone.trim() };
      setLocalAccount(updated);
      setAccount(updated);
    }
    setNotice('Datos guardados.');
  };

  const logout = async () => {
    await signOutAccount();
    closeAuth();
  };

  const isStaff = account?.kind === 'staff';
  const title =
    view === 'register' ? 'Crea tu cuenta' : view === 'login' ? 'Ingresar' : view === 'confirm' ? 'Revisa tu correo' : view === 'done' ? '¡Listo!' : 'Mi cuenta';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAuth();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative my-auto w-full max-w-md rounded-3xl border border-zinc-700 bg-[#0c0c0c] p-5 text-slate-100 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={closeAuth}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 rounded-xl border border-zinc-800 bg-black/60 p-2 text-slate-300 transition-colors hover:border-zinc-600 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00ff88]">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Descuentos Perú
        </div>
        <h2 id="auth-title" className="pr-10 text-2xl font-black tracking-tight text-white">
          {title}
        </h2>
        {request.reason && (view === 'login' || view === 'register') && (
          <p className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs leading-relaxed text-emerald-100">{request.reason}</p>
        )}

        {(view === 'login' || view === 'register') && (
          <div role="tablist" aria-label="Acceso" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-zinc-800 bg-black/50 p-1">
            {(['login', 'register'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => switchView(v)}
                className={`rounded-xl py-2 text-xs font-bold transition-colors cursor-pointer ${
                  view === v ? 'bg-[#00ff88] text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {v === 'login' ? 'Ya tengo cuenta' : 'Crear cuenta'}
              </button>
            ))}
          </div>
        )}

        {(view === 'login' || view === 'register') && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => void googleLogin()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-white py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <GoogleMark />}
              Continuar con Google
            </button>
            {googleError && (
              <div className="mt-3">
                <FormError message={googleError} />
              </div>
            )}
            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-400" aria-hidden="true">
              <span className="h-px flex-1 bg-zinc-800" />
              o con tu correo
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={submitLogin} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="auth-id" className={labelClass}>
                Correo
              </label>
              <input
                id="auth-id"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={fieldClass}
              />
            </div>
            <PasswordField id="auth-pass" label="Contraseña" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((v) => !v)} autoComplete="current-password" />
            <CaptchaWidget ref={captchaRef} onToken={setCaptcha} />
            <FormError message={error} />
            <SubmitButton busy={busy} label="Ingresar" busyLabel="Verificando…" disabled={CAPTCHA_ENABLED && !captcha} />
            <p className="text-center text-xs text-slate-400">
              ¿Primera vez?{' '}
              <button type="button" onClick={() => switchView('register')} className="font-bold text-[#00ff88] hover:underline cursor-pointer">
                Crea tu cuenta
              </button>
            </p>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={submitRegister} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="auth-name" className={labelClass}>
                Nombre
              </label>
              <input id="auth-name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="auth-email" className={labelClass}>
                Correo
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="auth-phone" className={labelClass}>
                WhatsApp o teléfono <span className="font-normal normal-case text-slate-500">(opcional)</span>
              </label>
              <input id="auth-phone" type="tel" autoComplete="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
            </div>
            <PasswordField
              id="auth-pass"
              label={`Contraseña (mín. ${MIN_PASSWORD} caracteres)`}
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              autoComplete="new-password"
            />
            <CaptchaWidget ref={captchaRef} onToken={setCaptcha} />
            <FormError message={error} />
            <SubmitButton busy={busy} label="Crear mi cuenta" busyLabel="Creando…" disabled={CAPTCHA_ENABLED && !captcha} />
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              Usamos tus datos solo para atender tus compras. No los compartimos con terceros.
            </p>
          </form>
        )}

        {view === 'confirm' && (
          <form onSubmit={submitCode} className="mt-5 space-y-4 text-center" noValidate>
            <MailCheck className="mx-auto h-12 w-12 text-[#00ff88]" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-300">
              Te enviamos un código de 6 dígitos a <strong className="text-white">{confirmEmail}</strong>. Escríbelo aquí para confirmar tu correo.
            </p>
            <div>
              <label htmlFor="auth-code" className="sr-only">
                Código de 6 dígitos
              </label>
              <input
                id="auth-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`${fieldClass} text-center font-mono text-2xl tracking-[0.5em]`}
              />
            </div>
            {notice && (
              <p role="status" className="flex items-center justify-center gap-1.5 font-mono text-xs text-[#00ff88]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {notice}
              </p>
            )}
            <FormError message={error} />
            <SubmitButton busy={busy} label="Confirmar" busyLabel="Verificando…" disabled={code.length !== 6} />
            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <CaptchaWidget ref={captchaRef} onToken={setCaptcha} />
              <button
                type="button"
                onClick={() => void resendCode()}
                disabled={busy || cooldown > 0 || (CAPTCHA_ENABLED && !captcha)}
                className="text-xs font-bold text-[#00ff88] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {cooldown > 0 ? `Pedir otro código en ${cooldown} s` : 'No me llegó, enviar otro código'}
              </button>
              <p>
                <button type="button" onClick={() => switchView('login')} className="text-xs text-slate-400 hover:text-white hover:underline cursor-pointer">
                  Volver a ingresar
                </button>
              </p>
            </div>
          </form>
        )}

        {view === 'done' && account && (
          <div className="mt-5 space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#00ff88]" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-300">
              {isStaff ? (
                <>
                  Hola, <strong className="text-white">{account.name}</strong>. Entraste como <strong className="text-[#00ff88]">{roleLabel(account.role)}</strong>.
                </>
              ) : (
                <>
                  Hola, <strong className="text-white">{account.name}</strong>. Tu cuenta está lista.
                </>
              )}
            </p>
            {request.onContinue && (
              <button
                type="button"
                onClick={() => {
                  const go = request.onContinue;
                  closeAuth();
                  go?.();
                }}
                className="w-full rounded-2xl bg-[#00ff88] py-3 text-sm font-black text-slate-950 hover:bg-[#00e676] cursor-pointer"
              >
                Continuar con mi compra
              </button>
            )}
            {isStaff && (
              <button
                type="button"
                onClick={() => {
                  closeAuth();
                  goToPanel();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#00ff88]/60 py-3 text-sm font-bold text-[#00ff88] hover:bg-[#00ff88] hover:text-slate-950 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Ir al panel
              </button>
            )}
            <button type="button" onClick={closeAuth} className="w-full rounded-2xl border border-zinc-700 py-2.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer">
              {request.onContinue ? 'Seguir navegando' : 'Cerrar'}
            </button>
          </div>
        )}

        {view === 'account' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm">
              <p className="font-bold text-white">{state.account?.name || account?.name}</p>
              <p className="break-all text-xs text-slate-400">{state.account?.kind === 'staff' ? `@${state.account.username}` : state.account?.email}</p>
              {state.account?.kind === 'staff' && (
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00ff88]">Equipo · {roleLabel(state.account.role)}</p>
              )}
            </div>

            {state.account?.kind === 'buyer' ? (
              <form onSubmit={saveProfile} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="acc-name" className={labelClass}>
                    Nombre
                  </label>
                  <input id="acc-name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="acc-phone" className={labelClass}>
                    WhatsApp o teléfono
                  </label>
                  <input id="acc-phone" type="tel" autoComplete="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
                </div>
                <FormError message={error} />
                {notice && (
                  <p role="status" className="flex items-center gap-2 font-mono text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {notice}
                  </p>
                )}
                <SubmitButton busy={busy} label="Guardar datos" busyLabel="Guardando…" />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeAuth();
                  goToPanel();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#00ff88]/60 py-3 text-sm font-bold text-[#00ff88] hover:bg-[#00ff88] hover:text-slate-950 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Ir al panel
              </button>
            )}

            {state.account?.kind === 'buyer' && (
              <PasswordChange
                minLength={MIN_PASSWORD}
                onDone={(m) => {
                  const good = /^Contraseña actualizada/.test(m);
                  setError(good ? '' : m);
                  setNotice(good ? m : '');
                }}
              />
            )}

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-2.5 text-xs font-bold text-slate-300 hover:border-rose-400/60 hover:text-rose-300 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Logo "G" de Google (los cuatro colores oficiales). */
const GoogleMark: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="flex items-start gap-2 font-mono text-xs text-rose-400">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;

const SubmitButton: React.FC<{ busy: boolean; label: string; busyLabel: string; disabled?: boolean }> = ({ busy, label, busyLabel, disabled }) => (
  <button
    type="submit"
    disabled={busy || disabled}
    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00ff88] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#00e676] disabled:opacity-60 cursor-pointer"
  >
    {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {busy ? busyLabel : label}
  </button>
);

const PasswordField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
}> = ({ id, label, value, onChange, show, onToggle, autoComplete }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} pr-12`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default AuthModal;
