/**
 * Único enlace de entrada al panel: https://<dominio>/#ironcat
 * Es discreción, no seguridad: lo que protege el panel es el inicio de sesión en el servidor.
 */
export const PANEL_HASH = '#ironcat';

/** Acepta #ironcat y #/ironcat (con o sin "/" final, mayúsculas o parámetros). */
export const isPanelHash = (hash: string): boolean => /^#\/?ironcat\/?(\?.*)?$/i.test(hash);

export const goToPanel = (): void => {
  window.location.hash = PANEL_HASH;
};
