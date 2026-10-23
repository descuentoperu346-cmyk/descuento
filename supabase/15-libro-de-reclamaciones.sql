-- ============================================================================
-- PASO 15 · Libro de Reclamaciones virtual (Ley N.º 29571, art. 150, y su reglamento D.S. N.º 011-2011-PCM)
--
-- Requiere haber ejecutado antes el paso 3 (roles). Es seguro ejecutarlo más de una vez: no borra nada.
-- Conviene ejecutarlo ANTES de publicar la web con la página «Libro de Reclamaciones»: si la tabla no existe,
-- el formulario avisa que no se pudo registrar y pide escribir al correo (no se pierde el reclamo en silencio).
--
-- Qué crea:
--   · complaints → una fila por cada hoja de reclamación. Guarda lo que pide la hoja oficial:
--       - quién reclama (nombre, documento, domicilio, teléfono, correo; y el padre/madre/representante si es menor)
--       - el bien contratado (producto o servicio, descripción y monto)
--       - si es RECLAMO (disconformidad con el producto o servicio) o QUEJA (malestar en la atención)
--       - el detalle y el pedido concreto de la persona
--       - la conformidad de la persona con lo que escribió (en el libro virtual reemplaza a la firma)
--       - cuándo se presentó (la fecha la pone la base, no se puede falsificar desde la web)
--       - la fecha límite para responder: 15 días hábiles (Ley N.º 31435). No descuenta feriados:
--         es la fecha más temprana, así que respondiendo antes de ella estás siempre dentro del plazo.
--       - la respuesta que diste y cuándo la diste
--   · submit_complaint(jsonb) → la ÚNICA puerta para registrar una hoja desde la web, con o sin cuenta.
--       Valida todo, limita los envíos repetidos (máx. 5 por correo cada 24 horas y 100 por hora en total)
--       y devuelve el número, la fecha y la fecha límite.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · Visitante o comprador → solo puede REGISTRAR una hoja (con submit_complaint). No lee ni cambia ninguna.
--   · ADMIN y DEV           → leen todas y escriben la respuesta (solo «estado» y «respuesta» se pueden cambiar).
--   · VENDEDOR              → no ve nada (el Libro es de la web, no de una tienda).
--   · Nadie borra hojas. Por ley el Libro se conserva: no hay forma de eliminarlas desde la web.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Para ver las hojas: Table Editor → complaints (o el panel: Administración → Libro de reclamaciones).
-- ============================================================================

do $$
begin
  if to_regclass('public.staff') is null then
    raise exception 'Primero ejecuta supabase/03-catalogo-y-panel.sql (este paso se apoya en los roles del paso 3).';
  end if;
end $$;

create table if not exists public.complaints (
  id               uuid primary key default gen_random_uuid(),
  number           bigint generated always as identity,                  -- número de hoja legible (1, 2, 3…)
  created_at       timestamptz not null default now(),
  kind             text not null check (kind in ('reclamo', 'queja')),
  consumer_name    text not null check (char_length(btrim(consumer_name)) between 3 and 150),
  doc_type         text not null check (doc_type in ('DNI', 'CE', 'PASAPORTE', 'OTRO')),
  doc_number       text not null check (char_length(btrim(doc_number)) between 4 and 20),
  address          text not null check (char_length(btrim(address)) between 5 and 200),
  phone            text not null check (char_length(btrim(phone)) between 6 and 20),
  email            text not null check (char_length(email) between 5 and 120 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  is_minor         boolean not null default false,
  guardian_name    text check (guardian_name is null or char_length(btrim(guardian_name)) between 3 and 150),
  guardian_doc     text check (guardian_doc is null or char_length(btrim(guardian_doc)) between 4 and 20),
  good_type        text not null check (good_type in ('producto', 'servicio')),
  good_description text not null check (char_length(btrim(good_description)) between 3 and 300),
  amount           numeric(10, 2) check (amount is null or amount >= 0),
  order_ref        text check (order_ref is null or char_length(order_ref) <= 80),
  detail           text not null check (char_length(btrim(detail)) between 10 and 2000),
  request          text not null check (char_length(btrim(request)) between 5 and 1000),
  reply_via        text not null default 'email' check (reply_via in ('email', 'phone')),
  conformity       boolean not null check (conformity),
  legal_version    text check (legal_version is null or char_length(legal_version) <= 40),
  user_id          uuid references auth.users (id) on delete set null,   -- si tenía sesión; si borra su cuenta, la hoja se conserva
  due_at           timestamptz not null,                                  -- fecha límite de respuesta (15 días hábiles)
  status           text not null default 'pending' check (status in ('pending', 'answered')),
  response         text check (response is null or char_length(response) <= 3000),
  responded_at     timestamptz,
  constraint complaints_minor_guardian check (not is_minor or guardian_name is not null),
  constraint complaints_answered_has_response check (status <> 'answered' or char_length(btrim(coalesce(response, ''))) > 0)
);
create index if not exists complaints_status_idx on public.complaints (status, created_at desc);
create index if not exists complaints_email_idx on public.complaints (lower(email), created_at desc);

-- Suma días hábiles (lunes a viernes, hora de Lima). Función interna: la web no la llama.
create or replace function public.complaints_add_business_days(p_from timestamptz, p_days integer) returns timestamptz
language plpgsql stable set search_path = public as $$
declare
  d date := (p_from at time zone 'America/Lima')::date;
  n integer := 0;
begin
  while n < p_days loop
    d := d + 1;
    if extract(isodow from d) < 6 then n := n + 1; end if;
  end loop;
  -- el último día cuenta completo: vence a las 23:59 de Lima
  return ((d::timestamp + time '23:59') at time zone 'America/Lima');
end;
$$;

-- La fecha de respuesta la pone la base (no se puede falsificar desde la web)
create or replace function public.complaints_answered_at() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'answered' then
    if tg_op = 'UPDATE' then
      if old.status = 'answered' then new.responded_at = old.responded_at; else new.responded_at = now(); end if;
    else
      new.responded_at = now();
    end if;
  else
    new.responded_at = null;
  end if;
  return new;
end;
$$;
drop trigger if exists complaints_respuesta on public.complaints;
create trigger complaints_respuesta before insert or update on public.complaints
  for each row execute function public.complaints_answered_at();

alter table public.complaints enable row level security;
revoke all on public.complaints from anon, authenticated;
-- Con sesión del equipo: leer todo y escribir SOLO la respuesta. Insertar y borrar: nadie (insertar solo con submit_complaint).
grant select on public.complaints to authenticated;
grant update (status, response) on public.complaints to authenticated;

drop policy if exists complaints_ver on public.complaints;
create policy complaints_ver on public.complaints for select to authenticated
  using (public.is_admin());
drop policy if exists complaints_responder on public.complaints;
create policy complaints_responder on public.complaints for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- La única puerta para registrar una hoja ----------
create or replace function public.submit_complaint(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_kind     text := lower(btrim(coalesce(p ->> 'kind', '')));
  v_name     text := btrim(coalesce(p ->> 'consumer_name', ''));
  v_doctype  text := upper(btrim(coalesce(p ->> 'doc_type', '')));
  v_docnum   text := btrim(coalesce(p ->> 'doc_number', ''));
  v_address  text := btrim(coalesce(p ->> 'address', ''));
  v_phone    text := btrim(coalesce(p ->> 'phone', ''));
  v_email    text := lower(btrim(coalesce(p ->> 'email', '')));
  v_minor    boolean := coalesce(p ->> 'is_minor', 'false') = 'true';
  v_gname    text := nullif(btrim(coalesce(p ->> 'guardian_name', '')), '');
  v_gdoc     text := nullif(btrim(coalesce(p ->> 'guardian_doc', '')), '');
  v_goodtype text := lower(btrim(coalesce(p ->> 'good_type', '')));
  v_gooddesc text := btrim(coalesce(p ->> 'good_description', ''));
  v_amount_t text := nullif(btrim(coalesce(p ->> 'amount', '')), '');
  v_amount   numeric(10, 2);
  v_order    text := nullif(btrim(coalesce(p ->> 'order_ref', '')), '');
  v_detail   text := btrim(coalesce(p ->> 'detail', ''));
  v_request  text := btrim(coalesce(p ->> 'request', ''));
  v_reply    text := lower(btrim(coalesce(p ->> 'reply_via', 'email')));
  v_version  text := nullif(left(btrim(coalesce(p ->> 'legal_version', '')), 40), '');
  v_now      timestamptz := now();
  v_due      timestamptz;
  v_id       uuid;
  v_number   bigint;
begin
  if jsonb_typeof(p) is distinct from 'object' then
    raise exception 'invalid:datos' using errcode = '22023';
  end if;
  if v_kind not in ('reclamo', 'queja') then raise exception 'invalid:kind' using errcode = '22023'; end if;
  if char_length(v_name) not between 3 and 150 then raise exception 'invalid:consumer_name' using errcode = '22023'; end if;
  if v_doctype not in ('DNI', 'CE', 'PASAPORTE', 'OTRO') then raise exception 'invalid:doc_type' using errcode = '22023'; end if;
  if char_length(v_docnum) not between 4 and 20 then raise exception 'invalid:doc_number' using errcode = '22023'; end if;
  if v_doctype = 'DNI' and v_docnum !~ '^[0-9]{8}$' then raise exception 'invalid:doc_number' using errcode = '22023'; end if;
  if char_length(v_address) not between 5 and 200 then raise exception 'invalid:address' using errcode = '22023'; end if;
  if char_length(v_phone) not between 6 and 20 then raise exception 'invalid:phone' using errcode = '22023'; end if;
  if char_length(v_email) not between 5 and 120 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid:email' using errcode = '22023';
  end if;
  if v_minor and (v_gname is null or char_length(v_gname) not between 3 and 150) then raise exception 'invalid:guardian_name' using errcode = '22023'; end if;
  if v_gdoc is not null and char_length(v_gdoc) not between 4 and 20 then raise exception 'invalid:guardian_doc' using errcode = '22023'; end if;
  if v_goodtype not in ('producto', 'servicio') then raise exception 'invalid:good_type' using errcode = '22023'; end if;
  if char_length(v_gooddesc) not between 3 and 300 then raise exception 'invalid:good_description' using errcode = '22023'; end if;
  if v_amount_t is not null then
    if v_amount_t !~ '^[0-9]{1,8}([.][0-9]{1,2})?$' then raise exception 'invalid:amount' using errcode = '22023'; end if;
    v_amount := v_amount_t::numeric(10, 2);
  end if;
  if v_order is not null and char_length(v_order) > 80 then raise exception 'invalid:order_ref' using errcode = '22023'; end if;
  if char_length(v_detail) not between 10 and 2000 then raise exception 'invalid:detail' using errcode = '22023'; end if;
  if char_length(v_request) not between 5 and 1000 then raise exception 'invalid:request' using errcode = '22023'; end if;
  if v_reply not in ('email', 'phone') then raise exception 'invalid:reply_via' using errcode = '22023'; end if;
  if coalesce(p ->> 'conformity', 'false') <> 'true' then raise exception 'invalid:conformity' using errcode = '22023'; end if;

  -- Frenos contra el abuso (la clave pública es de todos): por correo y en total
  if (select count(*) from public.complaints where lower(email) = v_email and created_at > v_now - interval '24 hours') >= 5 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;
  if (select count(*) from public.complaints where created_at > v_now - interval '1 hour') >= 100 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;

  v_due := public.complaints_add_business_days(v_now, 15);

  insert into public.complaints (
    kind, consumer_name, doc_type, doc_number, address, phone, email, is_minor, guardian_name, guardian_doc,
    good_type, good_description, amount, order_ref, detail, request, reply_via, conformity, legal_version,
    user_id, due_at, created_at
  ) values (
    v_kind, v_name, v_doctype, v_docnum, v_address, v_phone, v_email, v_minor, case when v_minor then v_gname end, case when v_minor then v_gdoc end,
    v_goodtype, v_gooddesc, v_amount, v_order, v_detail, v_request, v_reply, true, v_version,
    auth.uid(), v_due, v_now
  ) returning id, number into v_id, v_number;

  return jsonb_build_object('id', v_id, 'number', v_number, 'created_at', v_now, 'due_at', v_due);
end;
$$;
revoke all on function public.submit_complaint(jsonb) from public;
grant execute on function public.submit_complaint(jsonb) to anon, authenticated;
-- Interna: nadie la llama desde la web
revoke all on function public.complaints_add_business_days(timestamptz, integer) from public, anon, authenticated;

notify pgrst, 'reload schema';

-- Resultado: cuántas hojas hay hasta ahora y cuántas esperan respuesta
select count(*) as hojas, count(*) filter (where status = 'pending') as sin_responder from public.complaints;
