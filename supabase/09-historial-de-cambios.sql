-- ============================================================================
-- PASO 9 · Historial de cambios (solo para el DEV)
--
-- Requiere haber ejecutado antes el paso 3 (roles). Si ya ejecutaste 06, también registra ventas y clientes.
-- Es seguro ejecutarlo más de una vez: no borra nada.
--
-- Qué hace:
--   Anota quién cambió qué y cuándo en: productos, vendedores, métodos de pago, artículos,
--   clientes, ventas y el equipo (tabla staff). En los cambios guarda el valor de ANTES y el de DESPUÉS
--   de cada dato que cambió (no copia filas completas, así que ocupa poco). Se conserva 12 meses.
--
-- Quién puede verlo: SOLO el DEV. Ni los admins ni los vendedores ven esta tabla.
-- No guarda contraseñas (esas viven en Authentication, nunca en estas tablas).
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  changed_at timestamptz not null default now(),
  actor_id   uuid,
  actor_name text,                       -- usuario del equipo (p. ej. "Tin9o") o "Sistema" si fue desde el SQL Editor
  action     text not null check (action in ('insert', 'update', 'delete')),
  table_name text not null,
  row_id     text,
  label      text,                       -- nombre legible del elemento
  vendor_id  text,
  changes    jsonb                       -- solo en "update": { "campo": { "antes": …, "despues": … } }
);
create index if not exists audit_fecha_idx on public.audit_log (changed_at desc);
create index if not exists audit_tabla_idx on public.audit_log (table_name, changed_at desc);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

drop policy if exists audit_ver_dev on public.audit_log;
create policy audit_ver_dev on public.audit_log for select to authenticated using (public.is_dev());

-- ---------- 1. Funciones de apoyo ----------
-- Recorta valores largos: las fotos pegadas no se copian y los textos largos se cortan.
create or replace function public.audit_trim(v jsonb) returns jsonb
language plpgsql immutable as $$
declare s text;
begin
  if v is null then return null; end if;
  if jsonb_typeof(v) = 'string' then
    s := v #>> '{}';
    if s like 'data:image/%' then return to_jsonb('[imagen]'::text); end if;
    if char_length(s) > 200 then return to_jsonb(left(s, 200) || '…'); end if;
    return v;
  end if;
  if jsonb_typeof(v) in ('object', 'array') and char_length(v::text) > 1000 then
    return to_jsonb('[contenido largo: ' || char_length(v::text) || ' caracteres]');
  end if;
  return v;
end;
$$;

-- Diferencias entre dos objetos JSON (entra hasta 3 niveles dentro de "data"): { "ruta": { "antes": …, "despues": … } }
create or replace function public.audit_diff(o jsonb, n jsonb, depth int default 0) returns jsonb
language plpgsql immutable as $$
declare
  res jsonb := '{}'::jsonb;
  k   text;
  sub jsonb;
  s   record;
begin
  if o is null or jsonb_typeof(o) <> 'object' then o := '{}'::jsonb; end if;
  if n is null or jsonb_typeof(n) <> 'object' then n := '{}'::jsonb; end if;
  for k in select jsonb_object_keys(o) union select jsonb_object_keys(n) loop
    continue when k = 'updated_at';
    continue when (o -> k) is not distinct from (n -> k);
    if depth < 2 and jsonb_typeof(o -> k) = 'object' and jsonb_typeof(n -> k) = 'object' then
      sub := public.audit_diff(o -> k, n -> k, depth + 1);
      for s in select key, value from jsonb_each(sub) loop
        res := res || jsonb_build_object(k || '.' || s.key, s.value);
      end loop;
    else
      res := res || jsonb_build_object(k, jsonb_build_object('antes', public.audit_trim(o -> k), 'despues', public.audit_trim(n -> k)));
    end if;
  end loop;
  return res;
end;
$$;

-- Borra lo que lleva más de 12 meses (se llama sola de vez en cuando)
create or replace function public.audit_purge() returns void
language sql security definer set search_path = public as $$
  delete from public.audit_log where changed_at < now() - interval '12 months';
$$;
revoke all on function public.audit_purge() from public, anon, authenticated;

-- ---------- 2. El disparador que anota cada cambio ----------
create or replace function public.audit_capture() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  o    jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  n    jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  cur  jsonb := coalesce(n, o);
  diff jsonb := null;
  lbl  text;
  vid  text;
  who  text;
begin
  case tg_table_name
    when 'products'        then lbl := cur -> 'data' ->> 'title';  vid := cur ->> 'vendor_id';
    when 'vendors'         then lbl := cur -> 'data' ->> 'name';   vid := cur ->> 'id';
    when 'payment_methods' then lbl := cur -> 'data' ->> 'name';
    when 'leaks'           then lbl := cur -> 'data' ->> 'title';
    when 'customers'       then lbl := cur ->> 'name';             vid := cur ->> 'vendor_id';
    when 'sales'           then lbl := 'Venta #' || coalesce(cur ->> 'number', '?') || ' · ' || coalesce(cur ->> 'customer_name', ''); vid := cur ->> 'vendor_id';
    when 'staff'           then lbl := coalesce(cur ->> 'username', cur ->> 'display_name'); vid := cur ->> 'vendor_id';
    else lbl := null;
  end case;

  if tg_op = 'UPDATE' then
    diff := public.audit_diff(o, n);
    if diff = '{}'::jsonb then return null; end if;        -- no cambió nada real (solo la hora de modificación)
    if char_length(diff::text) > 8000 then
      diff := (select jsonb_object_agg(key, '"[cambio muy largo]"'::jsonb) from jsonb_object_keys(diff) as key);
    end if;
  end if;

  select coalesce(nullif(s.username, ''), s.display_name) into who from public.staff s where s.user_id = auth.uid();

  insert into public.audit_log (actor_id, actor_name, action, table_name, row_id, label, vendor_id, changes)
  values (
    auth.uid(),
    coalesce(who, case when auth.uid() is null then 'Sistema' else 'Cuenta sin equipo' end),
    lower(tg_op), tg_table_name, coalesce(cur ->> 'id', cur ->> 'user_id'), left(coalesce(lbl, ''), 160), vid, diff
  );

  if random() < 0.02 then perform public.audit_purge(); end if;
  return null;
end;
$$;
revoke all on function public.audit_capture() from public;

do $$
declare t text;
begin
  foreach t in array array['products', 'vendors', 'payment_methods', 'leaks', 'customers', 'sales', 'staff'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists %I on public.%I', t || '_historial', t);
      execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_capture()', t || '_historial', t);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';

-- ---------- 3. Comprobación ----------
select count(*) as cambios_anotados from public.audit_log;
