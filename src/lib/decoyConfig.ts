/**
 * Pide /config.json una vez por sesión, cuando el navegador está libre.
 * Es un archivo de cebo (todo falso): su único fin es que aparezca en la pestaña Network.
 * Pesa menos de 1 kB y se cachea, así que no afecta la carga.
 */
export function scheduleDecoyConfig(): void {
  try {
    if (sessionStorage.getItem('dp_cfg')) return;
    sessionStorage.setItem('dp_cfg', '1');
  } catch {
    // sin sessionStorage: se pide igualmente
  }
  const run = () => {
    fetch('/config.json', { credentials: 'omit' }).catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(run, { timeout: 8000 });
  } else {
    setTimeout(run, 4000);
  }
}
