// Optimiza en sitio las imagenes de public/imagenes (mismas rutas y formatos, menos peso).
// Los originales completos se conservan en /imagenes (fuera de public) y en el historial de git.
// Idempotente: omite archivos ya ligeros (<350KB) para no recomprimir dos veces.
// Uso: node scripts/optimize-images.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = 'public/imagenes';
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

// Dimension maxima (lado mayor) segun el uso real en la interfaz
function maxDim(rel) {
  const r = rel.replace(/\\/g, '/').toLowerCase();
  if (r.startsWith('caso-chinapolo/') || r.startsWith('caso-congreso/')) return null; // ya ligeras
  if (r.startsWith('iconos-pago/')) return 160;
  if (r.startsWith('perfiles/')) return 320;
  if (/^(badge-|telegram-icon|favicon|monograma|icono-|iconos\/)/.test(r)) return 256;
  if (r.startsWith('banner-pesta')) return 400;
  if (/^(empty-search|page-404|coming-soon)/.test(r)) return 512;
  if (r.startsWith('hero-circle')) return 512;
  if (r.startsWith('llama')) return 800;
  if (r.includes('hero-bg-wide') || r.startsWith('banner') || r.startsWith('circuit')) return 1400;
  return 1000;
}

let before = 0, after = 0;
for (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) continue;
  const rel = path.relative(ROOT, file);
  const max = maxDim(rel);
  const size = fs.statSync(file).size;
  if (max === null || size < 350 * 1024) { before += size; after += size; continue; }

  const animated = ext === '.gif';
  const input = fs.readFileSync(file); // buffer: evita que sharp bloquee el archivo en Windows
  let img = sharp(input, { animated }).rotate();
  const meta = await sharp(input, { animated }).metadata();
  const w = meta.width, h = meta.pageHeight || meta.height;
  if (Math.max(w, h) > max) img = img.resize({ width: w >= h ? max : undefined, height: h > w ? max : undefined, withoutEnlargement: true });

  let buf;
  if (ext === '.png') buf = await img.png({ palette: true, quality: 80, effort: 10, compressionLevel: 9 }).toBuffer();
  else if (animated) buf = await img.gif({ effort: 10, colours: 128 }).toBuffer();
  else buf = await img.jpeg({ quality: 72, mozjpeg: true }).toBuffer();

  before += size;
  if (buf.length < size) { fs.writeFileSync(file, buf); after += buf.length; console.log(`${(size/1024)|0}KB -> ${(buf.length/1024)|0}KB  ${rel}`); }
  else after += size;
}
console.log(`TOTAL ${(before/1048576).toFixed(1)}MB -> ${(after/1048576).toFixed(1)}MB`);

