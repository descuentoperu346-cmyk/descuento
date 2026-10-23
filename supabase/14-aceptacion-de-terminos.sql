-- ============================================================================
-- PASO 14 · Constancia de que cada persona aceptó los Términos y la Política
--
-- Requiere haber ejecutado antes el paso 3 (roles). Es seguro ejecutarlo más de una vez: no borra nada.
-- Conviene ejecutarlo ANTES de publicar la web que marca las dos casillas: la web guarda la constancia
-- sola, y si esta tabla aún no existe simplemente no la guarda (no impide entrar a nadie).
--
-- Qué crea:
--   · consent_log → una fila cada vez que una persona marca las dos casillas y entra a la web:
--       - user_id          → de quién es la cuenta
--       - accepted_at      → cuándo (la fecha la pone la base, no se puede falsificar desde la web)
--       - version          → versión de los textos que aceptó (la fecha de «Última actualización», p. ej. 2026-10-22)
--       - context          → cómo entró: signup (cuenta nueva), login (correo y contraseña),
--                            code (código por correo) o google
--       - terms_accepted   → casilla 1: Términos y Condiciones y Política de Privacidad
--       - secrecy_accepted → casilla 2: no divulgación del contenido de la venta
--     Es un registro que solo crece: cada vez que alguien marca y entra se agrega una fila.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · Cada persona con sesión → agrega SUS constancias y ve solo las suyas.
--   · ADMIN y DEV              → ven las de todos (para responder «¿aceptó esta persona?»).
--   · Visitante sin sesión     → no ve ni escribe nada.
--   · Nadie edita ni borra constancias. Solo desaparecen si se elimina la cuenta de la persona
--     (para respetar el derecho de cancelación de la Ley N.º 29733).
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Para ver las constancias: Table Editor → consent_log (o la consulta de ejemplo al final).
-- ============================================================================

do $$
begin
  if to_regclass('public.staff') is null then
    raise exception 'Primero ejecuta supabase/03-catalogo-y-panel.sql (este paso se apoya en los roles del paso 3).';
  end if;
end $$;

create table if not exists public.consent_log (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  accepted_at      timestamptz not null default now(),
  version          text not null check (char_length(btrim(version)) between 1 and 40),
  context          text not null check (context in ('signup', 'login', 'code', 'google')),
  terms_accepted   boolean not null check (terms_accepted),
  secrecy_accepted boolean not null check (secrecy_accepted)
);
create index if not exists consent_log_user_idx on public.consent_log (user_id, accepted_at desc);

alter table public.consent_log enable row level security;
-- Se parte de cero y se da solo lo necesario. «accepted_at» y «id» NO se pueden enviar desde la web: los pone la base.
revoke all on public.consent_log from anon, authenticated;
grant select on public.consent_log to authenticated;
grant insert (user_id, version, context, terms_accepted, secrecy_accepted) on public.consent_log to authenticated;

drop policy if exists consent_ver on public.consent_log;
create policy consent_ver on public.consent_log for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Cada persona solo puede dejar constancia a nombre de su propia cuenta
drop policy if exists consent_crear on public.consent_log;
create policy consent_crear on public.consent_log for insert to authenticated
  with check (user_id = (select auth.uid()));

notify pgrst, 'reload schema';

-- Resultado: cuántas constancias hay hasta ahora
select count(*) as constancias from public.consent_log;

-- ----------------------------------------------------------------------------
-- Consulta de ejemplo (solo lectura): última aceptación de cada comprador
--
--   select b.email, b.display_name, c.accepted_at, c.version, c.context
--   from public.buyers b
--   left join lateral (
--     select * from public.consent_log l where l.user_id = b.user_id order by l.accepted_at desc limit 1
--   ) c on true
--   order by c.accepted_at desc nulls last;
-- ----------------------------------------------------------------------------
