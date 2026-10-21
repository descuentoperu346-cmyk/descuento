/**
 * Roles de la web:
 *  - dev     : desarrollador. Todo lo del admin + ve el equipo y a los compradores registrados.
 *  - admin   : gestiona el contenido (productos, vendedores, métodos de pago, leaks y archivos).
 *  - vendor  : rol limitado y opcional (solo SUS productos y SU ficha).
 *  - comprador: se registra solo en la web (no está en la tabla staff).
 * Los permisos reales los decide la base de datos (RLS); esto solo adapta lo que muestra la pantalla.
 */
export type StaffRole = 'dev' | 'admin' | 'vendor';

/**
 * Dominio interno de los correos del equipo: @Tin9o inicia sesión como tin9o@<dominio>.
 * ".invalid" está reservado y nunca recibe correo. Debe coincidir con supabase/05-crear-cuentas.sql.
 */
export const STAFF_EMAIL_DOMAIN = 'equipo.descuentos-peru.invalid';

/** true para quien puede editar todo el contenido (dev y admin). */
export const isStaffAdmin = (role?: string | null): boolean => role === 'dev' || role === 'admin';

export const roleLabel = (role?: string | null): string =>
  role === 'dev' ? 'DEV' : role === 'admin' ? 'ADMIN' : 'VENDEDOR';

/**
 * Convierte lo que escribe el equipo en el correo de acceso:
 *  "@Tin9o" o "tin9o"     -> tin9o@equipo.descuentos-peru.invalid
 *  "alguien@correo.com"   -> tal cual
 */
export function staffLoginEmail(identifier: string): string {
  const v = identifier.trim();
  if (v.includes('@') && !v.startsWith('@')) return v;
  const handle = v.replace(/^@+/, '').toLowerCase();
  return `${handle}@${STAFF_EMAIL_DOMAIN}`;
}
