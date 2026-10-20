/**
 * Genera supabase/02-leaks-seed.sql con los leaks que hoy están en src/data/leaksData.ts.
 * Uso:  npm run leaks:seed
 * Solo escribe un archivo SQL: no se conecta a ninguna base de datos.
 */
import fs from 'fs';
import path from 'path';
import { INITIAL_LEAKS_ARTICLES, type LeakArticle } from '../src/data/leaksData';

const MONTHS: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

// El Leak #2 se libera con la cuenta regresiva del sitio (domingo 18 de octubre de 2026, 8 PM hora de Lima).
const LEAK_2_PUBLISH_AT = '2026-10-18T20:00:00-05:00';

/** "14 Octubre, 2026" -> 2026-10-14. Si no se puede leer la fecha, usa la del Leak #2. */
function publishAt(a: LeakArticle): string {
  if (a.leakNumber === 2) return LEAK_2_PUBLISH_AT;
  const m = a.date.match(/(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]+),?\s+(\d{4})/);
  const month = m && MONTHS[m[2].toLowerCase()];
  if (m && month) return `${m[3]}-${month}-${m[1].padStart(2, '0')}T00:00:00-05:00`;
  return LEAK_2_PUBLISH_AT;
}

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;

const lines: string[] = [
  '-- ============================================================================',
  '-- PASO 2 · Carga de los leaks actuales (generado con: npm run leaks:seed)',
  '-- Pégalo en Supabase > SQL Editor > New query > Run, DESPUÉS del paso 1.',
  '-- Es seguro repetirlo: si un leak ya existe, lo actualiza con el contenido de este archivo.',
  '-- (Si ya editaste un leak a mano en Supabase, no lo vuelvas a ejecutar: pisaría tus cambios.)',
  '-- ============================================================================',
  ''
];

INITIAL_LEAKS_ARTICLES.forEach((a, i) => {
  const json = JSON.stringify(a);
  if (json.includes('$dp$')) throw new Error(`El leak ${a.id} contiene la marca $dp$; cambia la etiqueta.`);
  lines.push(
    `-- ${i + 1}. ${a.id}`,
    'insert into public.leaks (id, slug, leak_number, sort_order, status, publish_at, featured, data)',
    'values (',
    `  ${quote(a.id)}, ${quote(a.slug)}, ${a.leakNumber ?? 'null'}, ${i}, 'published',`,
    `  ${quote(publishAt(a))}, ${a.featured ? 'true' : 'false'},`,
    `  $dp$${json}$dp$::jsonb`,
    ')',
    'on conflict (id) do update set',
    '  slug = excluded.slug, leak_number = excluded.leak_number, sort_order = excluded.sort_order,',
    '  status = excluded.status, publish_at = excluded.publish_at, featured = excluded.featured,',
    '  data = excluded.data, updated_at = now();',
    ''
  );
});

lines.push(
  '-- Comprobación: debe devolver ' + INITIAL_LEAKS_ARTICLES.length + ' filas.',
  'select id, leak_number, status, publish_at from public.leaks order by sort_order;',
  ''
);

const out = path.resolve(process.cwd(), 'supabase', '02-leaks-seed.sql');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`Escrito ${out}  (${INITIAL_LEAKS_ARTICLES.length} leaks, ${(fs.statSync(out).size / 1024).toFixed(0)} kB)`);
