import { CONTENT_DB_ENABLED } from './contentEnv';
import { loginApi, logoutApi, checkSessionApi } from './api';
import type { AuthUser } from './api';
import { refreshAccount, setAccount } from './accountStore';

/**
 * Acceso al panel. Dos modos:
 *  - 'supabase': hay base de datos de contenido configurada -> correo + contraseña de Supabase Authentication.
 *  - 'server'  : sin base configurada -> servidor propio (usuario + clave), pensado para desarrollo local.
 */
export const PANEL_AUTH_MODE: 'supabase' | 'server' = CONTENT_DB_ENABLED ? 'supabase' : 'server';

type LoginResult = { success: boolean; user?: AuthUser; error?: string };

export async function panelLogin(identifier: string, secret: string, captchaToken?: string): Promise<LoginResult> {
  if (PANEL_AUTH_MODE === 'supabase') {
    const m = await import('./supabaseBrowser');
    const result = await m.panelSignIn(identifier, secret, captchaToken);
    if (result.success) void refreshAccount(); // la barra de la tienda pasa a mostrar la cuenta
    return result;
  }
  return loginApi(identifier, secret);
}

export async function panelCheckSession(): Promise<AuthUser | null> {
  if (PANEL_AUTH_MODE === 'supabase') {
    const m = await import('./supabaseBrowser');
    return m.panelGetUser();
  }
  return checkSessionApi();
}

export async function panelLogout(): Promise<void> {
  if (PANEL_AUTH_MODE === 'supabase') {
    const m = await import('./supabaseBrowser');
    await m.panelSignOut();
    setAccount(null);
    return;
  }
  await logoutApi();
}
