-- ============================================================================
-- PASO 8 · Papelera de reciclaje
--
-- Requiere haber ejecutado antes el paso 3 (roles) y, si usas ventas, el paso 6.
-- Es seguro ejecutarlo más de una vez: no borra nada de lo que ya tienes.
--
-- Qué hace:
--   Cada vez que se borra un producto, vendedor, método de pago, artículo, cliente o venta,
--   la base guarda una copia en la tabla "trash" durante 30 DÍAS. Desde el panel se puede
--   restaurar con un clic. Pasados los 30 días la copia se elimina sola.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · ADMIN y DEV → ven y restauran todo lo borrado.
--   · VENDEDOR    → ve y restaura solo los PRODUCTOS borrados de SU tienda.
--   · Compradores y visitantes → no ven nada.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

create table if not exists public.trash (
  id              bigint generated always as identity primary key,
  source_table    text not null check (source_table in ('products', 'vendors', 'payment_methods', 'leaks', 'customers', 'sales')),
  row_id          text not null,
  vendor_id       text,                                -- tienda dueña (null = solo admin)
  label           text not null,                       -- nombre legible, p. ej. el título del producto
  row_data        jsonb not null,                      -- la fila completa, tal como estaba
  deleted_at      timestamptz not null default now(),
  deleted_by      uuid default auth.uid(),
  deleted_by_name text
);
create index if not exists trash_fecha_idx on public.trash (deleted_at desc);
create index if not exists trash_vendor_idx on public.trash (vendor_id);

alter table public.trash enable row level security;
revoke all on public.trash from anon, authenticated;
-- La lista no incluye "row_data" (el contenido completo): solo se usa para restaurar dentro de la base.
grant select (id, source_table, row_id, vendor_id, label, deleted_at, deleted_by_name) on public.trash to authenticated;

drop policy if exists trash_ver on public.trash;
create policy trash_ver on public.trash for select to authenticated
  using (
    deleted_at > now() - interval '30 days'
    and (public.is_admin() or (source_table = 'products' and vendor_id is not null and vendor_id = public.my_vendor_id()))
  );

-- ---------- 1. Guardar una copia al borrar ----------
create or replace function public.trash_capture() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  j   jsonb := to_jsonb(old);
  lbl text;
  vid text;
  who text;
begin
  case tg_table_name
    when 'products'        then lbl := coalesce(j -> 'data' ->> 'title', j ->> 'id');                vid := j ->> 'vendor_id';
    when 'vendors'         then lbl := coalesce(j -> 'data' ->> 'name', j ->> 'username', j ->> 'id'); vid := j ->> 'id';
    when 'payment_methods' then lbl := coalesce(j -> 'data' ->> 'name', j ->> 'id');                vid := null;
    when 'leaks'           then lbl := coalesce(j -> 'data' ->> 'title', j ->> 'id');               vid := null;
    when 'customers'       then lbl := coalesce(j ->> 'name', j ->> 'id');                          vid := j ->> 'vendor_id';
    when 'sales'           then lbl := 'Venta #' || coalesce(j ->> 'number', '?') || ' · ' || coalesce(j ->> 'customer_name', '');
                                vid := j ->> 'vendor_id';
    else lbl := j ->> 'id'; vid := null;
  end case;

  select coalesce(nullif(s.username, ''), s.display_name) into who from public.staff s where s.user_id = auth.uid();

  insert into public.trash (source_table, row_id, vendor_id, label, row_data, deleted_by_name)
  values (tg_table_name, j ->> 'id', vid, left(coalesce(lbl, '(sin nombre)'), 160), j, coalesce(who, case when auth.uid() is null then 'Sistema' else null end));

  -- Limpieza: lo que lleva más de 30 días en la papelera se elimina
  delete from public.trash where deleted_at < now() - interval '30 days';
  return old;
end;
$$;
revoke all on function public.trash_capture() from public;

do $$
declare t text;
begin
  foreach t in array array['products', 'vendors', 'payment_methods', 'leaks', 'customers', 'sales'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists %I on public.%I', t || '_a_papelera', t);
      execute format('create trigger %I before delete on public.%I for each row execute function public.trash_capture()', t || '_a_papelera', t);
    end if;
  end loop;
end $$;

-- ---------- 2. Restaurar ----------
create or replace function public.restore_from_trash(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t  public.trash;
  ok boolean;
  fixed jsonb;
begin
  select * into t from public.trash where id = p_id for update;
  if not found then
    raise exception 'Ese elemento ya no está en la papelera.' using errcode = 'P0002';
  end if;
  if t.deleted_at < now() - interval '30 days' then
    raise exception 'Ese elemento ya venció (la papelera guarda 30 días).' using errcode = 'P0002';
  end if;

  if t.source_table = 'products' then
    ok := coalesce(public.is_admin() or (t.vendor_id is not null and t.vendor_id = public.my_vendor_id()), false);
  else
    ok := coalesce(public.is_admin(), false);
  end if;
  if not ok then
    raise exception 'No tienes permiso para restaurar esto.' using errcode = '42501';
  end if;

  begin
    case t.source_table
      when 'products'        then insert into public.products select * from jsonb_populate_record(null::public.products, t.row_data);
      when 'vendors'         then insert into public.vendors select * from jsonb_populate_record(null::public.vendors, t.row_data);
      when 'payment_methods' then insert into public.payment_methods select * from jsonb_populate_record(null::public.payment_methods, t.row_data);
      when 'leaks'           then insert into public.leaks select * from jsonb_populate_record(null::public.leaks, t.row_data);
      when 'customers'       then insert into public.customers select * from jsonb_populate_record(null::public.customers, t.row_data);
      when 'sales' then
        -- Si el cliente de esa venta también fue borrado, la venta vuelve sin cliente enlazado (conserva su nombre)
        fixed := t.row_data;
        if fixed ->> 'customer_id' is not null and not exists (select 1 from public.customers c where c.id::text = fixed ->> 'customer_id') then
          fixed := jsonb_set(fixed, '{customer_id}', 'null'::jsonb);
        end if;
        insert into public.sales overriding system value select * from jsonb_populate_record(null::public.sales, fixed);
    end case;
  exception when unique_violation then
    raise exception 'Ya existe otro elemento con el mismo identificador o nombre. Cámbiale el nombre al que existe y vuelve a intentarlo.' using errcode = '23505';
  end;

  delete from public.trash where id = p_id;
  return jsonb_build_object('table', t.source_table, 'id', t.row_id, 'label', t.label);
end;
$$;

-- ---------- 3. Borrar para siempre ----------
create or replace function public.trash_delete_forever(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
declare
  t  public.trash;
  ok boolean;
begin
  select * into t from public.trash where id = p_id;
  if not found then return; end if;
  if t.source_table = 'products' then
    ok := coalesce(public.is_admin() or (t.vendor_id is not null and t.vendor_id = public.my_vendor_id()), false);
  else
    ok := coalesce(public.is_admin(), false);
  end if;
  if not ok then
    raise exception 'No tienes permiso para borrar esto definitivamente.' using errcode = '42501';
  end if;
  delete from public.trash where id = p_id;
end;
$$;

revoke all on function public.restore_from_trash(bigint) from public, anon;
revoke all on function public.trash_delete_forever(bigint) from public, anon;
grant execute on function public.restore_from_trash(bigint) to authenticated;
grant execute on function public.trash_delete_forever(bigint) to authenticated;

notify pgrst, 'reload schema';

-- ---------- 4. Comprobación ----------
select count(*) as elementos_en_la_papelera from public.trash;
