/**
 * Prepara una foto elegida en el panel antes de guardarla: la reduce y la comprime.
 * Una foto de celular pesa varios MB; así se sube a Storage una imagen liviana y la tienda carga rápido.
 */
export interface ImageResult {
  ok: boolean;
  dataUrl?: string;
  error?: string;
}

export interface OptimizeOptions {
  /** Lado más largo permitido, en píxeles */
  maxSide: number;
  quality?: number;
  /** Mantiene PNG (útil para códigos QR, que deben verse nítidos) */
  png?: boolean;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED = /^image\/(png|jpe?g|webp|gif)$/i;

export async function optimizeImage(file: File, { maxSide, quality = 0.86, png = false }: OptimizeOptions): Promise<ImageResult> {
  if (!ACCEPTED.test(file.type)) return { ok: false, error: 'Usa una imagen PNG, JPG, WebP o GIF.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'La imagen pesa más de 10 MB. Elige una más liviana.' };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Tu navegador no pudo procesar la imagen.' };
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    let dataUrl = png ? canvas.toDataURL('image/png') : canvas.toDataURL('image/webp', quality);
    // Algunos navegadores no saben escribir WebP y devuelven PNG (mucho más pesado): se usa JPG
    if (!png && !dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/jpeg', quality);
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: 'No se pudo leer esa imagen. Prueba con otra.' };
  }
}

/** Tamaño aproximado de una imagen en data URL, en KB. */
export const dataUrlKb = (dataUrl: string) => Math.round(((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 3) / 4 / 1024);
