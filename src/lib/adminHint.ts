/**
 * Marca local ("hay un admin con sesión en este navegador") para mostrar el botón "Volver al panel"
 * sin consultar al servidor a todos los visitantes. Es solo una pista de interfaz: quien manda
 * es la cookie de sesión del servidor, que se vuelve a comprobar antes de mostrar el botón.
 */
const KEY = 'dp_admin_hint';

export const hasAdminHint = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const setAdminHint = (active: boolean): void => {
  try {
    if (active) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // sin almacenamiento: el botón simplemente no aparece
  }
};
