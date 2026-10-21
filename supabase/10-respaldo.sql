-- ============================================================================
-- PASO 10 · Copia de seguridad de la base de datos (solo para el DEV)
--
-- Requiere haber ejecutado antes el paso 3 (roles). Es seguro ejecutarlo más de una vez: no cambia datos.
--
-- Qué crea (dos funciones, ambas SOLO para el DEV):
--   · export_backup()          → devuelve TODO el contenido en un archivo JSON: productos, vendedores,
--                                métodos de pago, artículos, clientes y ventas.
--   · restore_backup(copia)    → vuelve a poner lo que FALTE. Es seguro: nunca cambia ni borra lo que ya existe,
--                                solo agrega lo que ya no está (p. ej. algo borrado hace más de 30 días).
--
-- No incluye: contraseñas ni cuentas (viven en Authentication), compradores registrados ni visitas/clics.
-- El archivo contiene datos de clientes: guárdalo en un lugar privado.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

create or replace function public.export_backup() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t jsonb := '{}'::jsonb;
  n text;
  rows jsonb;
begin
  if not public.is_dev() then
    raise exception 'Solo el desarrollador puede descargar la copia.' using errcode = '42501';
  end if;
  foreach n in array array['products', 'vendors', 'payment_methods', 'leaks', 'customers', 'sales'] loop
    if to_regclass('public.' || n) is not null then
      execute format('select coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) from public.%I x', n) into rows;
      t := t || jsonb_build_object(n, rows);
    end if;
  end loop;
  return jsonb_build_object('format', 'descuentos-peru-db', 'version', 1, 'created_at', now(), 'tables', t);
end;
$$;

create or replace function public.restore_backup(p_backup jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  tb      jsonb;
  res     jsonb := '{}'::jsonb;
  n       int;
  fixed   jsonb;
begin
  if not public.is_dev() then
    raise exception 'Solo el desarrollador puede recuperar una copia.' using errcode = '42501';
  end if;
  if p_backup is null or p_backup ->> 'format' is distinct from 'descuentos-peru-db' or jsonb_typeof(p_backup -> 'tables') is distinct from 'object' then
    raise exception 'Ese archivo no es una copia de Descuentos Perú.' using errcode = '22023';
  end if;
  tb := p_backup -> 'tables';

  -- Solo se agregan filas que NO existen (por su identificador o su nombre único); lo que ya está no se toca.
  if jsonb_typeof(tb -> 'vendors') = 'array' then
    insert into public.vendors select * from jsonb_populate_recordset(null::public.vendors, tb -> 'vendors') on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('vendors', n);
  end if;
  if jsonb_typeof(tb -> 'products') = 'array' then
    insert into public.products select * from jsonb_populate_recordset(null::public.products, tb -> 'products') on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('products', n);
  end if;
  if jsonb_typeof(tb -> 'payment_methods') = 'array' then
    insert into public.payment_methods select * from jsonb_populate_recordset(null::public.payment_methods, tb -> 'payment_methods') on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('payment_methods', n);
  end if;
  if jsonb_typeof(tb -> 'leaks') = 'array' then
    insert into public.leaks select * from jsonb_populate_recordset(null::public.leaks, tb -> 'leaks') on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('leaks', n);
  end if;
  if to_regclass('public.customers') is not null and jsonb_typeof(tb -> 'customers') = 'array' then
    insert into public.customers select * from jsonb_populate_recordset(null::public.customers, tb -> 'customers') on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('customers', n);
  end if;
  if to_regclass('public.sales') is not null and jsonb_typeof(tb -> 'sales') = 'array' then
    -- Una venta cuyo cliente ya no existe vuelve sin cliente enlazado (conserva su nombre)
    select jsonb_agg(
             case when s ->> 'customer_id' is not null and not exists (select 1 from public.customers c where c.id::text = s ->> 'customer_id')
                  then jsonb_set(s, '{customer_id}', 'null'::jsonb) else s end)
      into fixed
      from jsonb_array_elements(tb -> 'sales') s;
    insert into public.sales overriding system value
      select * from jsonb_populate_recordset(null::public.sales, coalesce(fixed, '[]'::jsonb)) on conflict do nothing;
    get diagnostics n = row_count; res := res || jsonb_build_object('sales', n);
  end if;
  return res;
end;
$$;

revoke all on function public.export_backup() from public, anon;
revoke all on function public.restore_backup(jsonb) from public, anon;
grant execute on function public.export_backup() to authenticated;
grant execute on function public.restore_backup(jsonb) to authenticated;

notify pgrst, 'reload schema';

select 'listo: las funciones export_backup y restore_backup quedaron creadas' as resultado;
