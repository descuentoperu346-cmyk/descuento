/**
 * Genera supabase/04-catalogo-seed.sql con el catálogo, los vendedores (SIN PIN) y los métodos de pago
 * que hoy están en el código (servicesData, vendorsData, paymentsData).
 * Uso:  npm run catalog:seed
 * Solo escribe un archivo SQL: no se conecta a ninguna base de datos.
 */
import fs from 'fs';
import path from 'path';
import { SERVICES_DATA } from '../src/data/servicesData';
import { INITIAL_VENDORS } from '../src/data/vendorsData';
import { INITIAL_PAYMENT_METHODS } from '../src/data/paymentsData';

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;
const json = (o: unknown) => {
  const j = JSON.stringify(o);
  if (j.includes('$dp$')) throw new Error('El contenido contiene la marca $dp$; cambia la etiqueta.');
  return `$dp$${j}$dp$::jsonb`;
};

const out: string[] = [
  '-- ============================================================================',
  '-- PASO 4 · Carga del catálogo, vendedores y métodos de pago (generado con: npm run catalog:seed)',
  '-- Pégalo en Supabase > SQL Editor > New query > Run, DESPUÉS del paso 3.',
  '-- Los vendedores se cargan SIN PIN (las contraseñas viven en Supabase Authentication).',
  '-- Si ya editaste datos desde el panel, no lo vuelvas a ejecutar: pisaría tus cambios.',
  '-- REVISA antes: los números de cuenta/teléfono que salgan aquí son los que hoy hay en el código.',
  '-- ============================================================================',
  ''
];

out.push('-- ---------- Vendedores ----------');
INITIAL_VENDORS.forEach((v, i) => {
  const { pin: _pin, ...publicData } = v;
  out.push(
    'insert into public.vendors (id, username, active, sort_order, data)',
    `values (${quote(v.id)}, ${quote(v.username)}, ${v.active !== false}, ${i}, ${json(publicData)})`,
    'on conflict (id) do update set username = excluded.username, active = excluded.active,',
    '  sort_order = excluded.sort_order, data = excluded.data;',
    ''
  );
});

out.push('-- ---------- Productos ----------');
SERVICES_DATA.forEach((s, i) => {
  out.push(
    'insert into public.products (id, vendor_id, active, sort_order, data)',
    `values (${quote(s.id)}, ${s.vendorId ? quote(s.vendorId) : 'null'}, ${s.active !== false}, ${i}, ${json(s)})`,
    'on conflict (id) do update set vendor_id = excluded.vendor_id, active = excluded.active,',
    '  sort_order = excluded.sort_order, data = excluded.data;',
    ''
  );
});

out.push('-- ---------- Métodos de pago ----------');
INITIAL_PAYMENT_METHODS.forEach((m, i) => {
  out.push(
    'insert into public.payment_methods (id, active, sort_order, data)',
    `values (${quote(m.id)}, ${m.active !== false}, ${i}, ${json(m)})`,
    'on conflict (id) do update set active = excluded.active, sort_order = excluded.sort_order, data = excluded.data;',
    ''
  );
});

out.push(
  '-- Comprobación: vendedores, productos y métodos de pago cargados.',
  `select (select count(*) from public.vendors) as vendedores,  -- esperado ${INITIAL_VENDORS.length}`,
  `       (select count(*) from public.products) as productos,  -- esperado ${SERVICES_DATA.length}`,
  `       (select count(*) from public.payment_methods) as pagos; -- esperado ${INITIAL_PAYMENT_METHODS.length}`,
  ''
);

const file = path.resolve(process.cwd(), 'supabase', '04-catalogo-seed.sql');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log(
  `Escrito ${file}  (${INITIAL_VENDORS.length} vendedores, ${SERVICES_DATA.length} productos, ${INITIAL_PAYMENT_METHODS.length} métodos de pago, ${(fs.statSync(file).size / 1024).toFixed(0)} kB)`
);
