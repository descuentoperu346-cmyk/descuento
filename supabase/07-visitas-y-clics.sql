-- ============================================================================
-- PASO 7 · Visitas y clics reales (analítica de la web)
--
-- Requiere haber ejecutado antes el paso 3 (crea los roles y las funciones is_admin / my_vendor_id).
-- Es seguro ejecutarlo más de una vez: no borra nada.
--
-- Qué hace:
--   · Guarda un registro por cada visita, cada vez que alguien abre un producto y cada clic
--     en los botones de Telegram / WhatsApp de un vendedor.
--   · NO guarda IP, nombre, correo ni teléfono. Solo un código al azar por navegador
--     (para contar visitantes distintos) y qué pasó.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · Cualquier visitante  → solo puede ENVIAR un registro (función track_event). No puede leer nada.
--   · ADMIN y DEV          → ven las cifras de toda la web o de la tienda que elijan.
--   · VENDEDOR             → ve solo las vistas y clics de SU tienda.
--   · COMPRADOR            → no ve nada.
--
-- Protección contra abuso (la función track_event ignora el exceso, sin dar error):
--   · máximo 60 registros por visitante por hora,
--   · máximo 600 registros por minuto en total,
--   · el mismo registro repetido en menos de 3 segundos cuenta una sola vez.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
--
-- Mantenimiento (opcional): si algún día la tabla crece demasiado, se puede borrar lo antiguo con
--   delete from public.events where created_at < now() - interval '180 days';
-- ============================================================================

-- ---------- 1. Tabla de registros ----------
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('visit', 'product_view', 'contact_click')),
  vendor_id  text check (vendor_id is null or char_length(vendor_id) <= 60),
  item_id    text check (item_id is null or char_length(item_id) <= 80),      -- id del producto
  channel    text check (channel is null or channel in ('telegram', 'whatsapp')),
  source     text check (source is null or char_length(source) <= 60),         -- desde qué botón o producto
  visitor    text not null check (visitor ~ '^[A-Za-z0-9_-]{8,40}$')           -- código al azar del navegador
);
create index if not exists events_fecha_idx    on public.events (created_at desc);
create index if not exists events_tienda_idx   on public.events (vendor_id, created_at desc);
create index if not exists events_visitante_idx on public.events (visitor, created_at desc);

-- Nadie toca la tabla directamente: solo las funciones de abajo.
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;

-- ---------- 2. Enviar un registro (lo puede llamar cualquier visitante) ----------
create or replace function public.track_event(
  p_kind    text,
  p_visitor text,
  p_vendor  text default null,
  p_item    text default null,
  p_channel text default null,
  p_source  text default null
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_vendor  text := left(nullif(btrim(p_vendor), ''), 60);
  v_item    text := left(nullif(btrim(p_item), ''), 80);
  v_source  text := left(nullif(btrim(p_source), ''), 60);
  v_channel text := p_channel;
begin
  if p_kind is null or p_kind not in ('visit', 'product_view', 'contact_click') then return; end if;
  if p_visitor is null or p_visitor !~ '^[A-Za-z0-9_-]{8,40}$' then return; end if;
  if v_channel is not null and v_channel not in ('telegram', 'whatsapp') then v_channel := null; end if;
  if p_kind = 'contact_click' and v_channel is null then return; end if;
  -- Solo se aceptan tiendas que existen
  if v_vendor is not null and not exists (select 1 from public.vendors v where v.id = v_vendor) then v_vendor := null; end if;

  -- Frenos contra abuso
  if (select count(*) from public.events e where e.created_at > now() - interval '1 minute') >= 600 then return; end if;
  if (select count(*) from public.events e where e.visitor = p_visitor and e.created_at > now() - interval '1 hour') >= 60 then return; end if;
  if exists (
    select 1 from public.events e
    where e.visitor = p_visitor and e.kind = p_kind
      and e.vendor_id is not distinct from v_vendor
      and e.item_id is not distinct from v_item
      and e.channel is not distinct from v_channel
      and e.created_at > now() - interval '3 seconds'
  ) then return; end if;

  insert into public.events (kind, vendor_id, item_id, channel, source, visitor)
  values (p_kind, v_vendor, v_item, v_channel, v_source, p_visitor);
end;
$$;
revoke all on function public.track_event(text, text, text, text, text, text) from public;
grant execute on function public.track_event(text, text, text, text, text, text) to anon, authenticated;

-- ---------- 3. Informe para el panel (solo equipo) ----------
-- p_days: cuántos días mirar (1 a 365, hora de Lima). p_vendor: solo para admin/dev, filtra una tienda.
-- Devuelve el período actual, el anterior (para comparar), y los desgloses ya sumados.
create or replace function public.traffic_report(p_days int default 30, p_vendor text default null)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_days      int  := least(greatest(coalesce(p_days, 30), 1), 365);
  v_vendor    text;
  v_today     date := (now() at time zone 'America/Lima')::date;
  v_from      date;
  v_prev_from date;
  v_since     timestamptz;
  result      jsonb;
begin
  if public.is_admin() then
    v_vendor := nullif(btrim(p_vendor), '');
  elsif public.my_vendor_id() is not null then
    v_vendor := public.my_vendor_id();
  else
    raise exception 'No tienes permiso para ver estas cifras.' using errcode = '42501';
  end if;

  v_from      := v_today - (v_days - 1);
  v_prev_from := v_from - v_days;
  v_since     := (v_prev_from::timestamp at time zone 'America/Lima');

  with ev as (
    select (e.created_at at time zone 'America/Lima')::date as day,
           extract(hour from e.created_at at time zone 'America/Lima')::int as hour,
           e.kind, e.vendor_id, e.item_id, e.channel, e.source, e.visitor
    from public.events e
    where e.created_at >= v_since and (v_vendor is null or e.vendor_id = v_vendor)
  ),
  cur  as (select * from ev where day >= v_from),
  prev as (select * from ev where day < v_from)
  select jsonb_build_object(
    'from', v_from,
    'to', v_today,
    'days', v_days,
    'vendor', v_vendor,
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day', d::date, 'visits', coalesce(x.visits, 0), 'views', coalesce(x.views, 0),
               'clicks', coalesce(x.clicks, 0), 'visitors', coalesce(x.visitors, 0)) order by d), '[]'::jsonb)
      from generate_series(v_from, v_today, interval '1 day') d
      left join (
        select day,
               count(*) filter (where kind = 'visit')         as visits,
               count(*) filter (where kind = 'product_view')  as views,
               count(*) filter (where kind = 'contact_click') as clicks,
               count(distinct visitor)                        as visitors
        from cur group by day
      ) x on x.day = d::date
    ),
    'totals', (
      select jsonb_build_object(
        'visits',   count(*) filter (where kind = 'visit'),
        'views',    count(*) filter (where kind = 'product_view'),
        'clicks',   count(*) filter (where kind = 'contact_click'),
        'telegram', count(*) filter (where kind = 'contact_click' and channel = 'telegram'),
        'whatsapp', count(*) filter (where kind = 'contact_click' and channel = 'whatsapp'),
        'visitors', count(distinct visitor))
      from cur
    ),
    'previous', (
      select jsonb_build_object(
        'visits',   count(*) filter (where kind = 'visit'),
        'views',    count(*) filter (where kind = 'product_view'),
        'clicks',   count(*) filter (where kind = 'contact_click'),
        'visitors', count(distinct visitor))
      from prev
    ),
    'products', (
      select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from (
        select item_id,
               count(*) filter (where kind = 'product_view')  as views,
               count(*) filter (where kind = 'contact_click') as clicks
        from cur where item_id is not null
        group by item_id order by count(*) desc, item_id limit 15
      ) p
    ),
    'vendors', (
      case when v_vendor is null then (
        select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from (
          select vendor_id,
                 count(*) filter (where kind = 'product_view')  as views,
                 count(*) filter (where kind = 'contact_click') as clicks,
                 count(*) filter (where kind = 'contact_click' and channel = 'telegram') as telegram,
                 count(*) filter (where kind = 'contact_click' and channel = 'whatsapp') as whatsapp
          from cur where vendor_id is not null
          group by vendor_id order by count(*) desc, vendor_id limit 20
        ) p
      ) else '[]'::jsonb end
    ),
    'sources', (
      select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from (
        select source, count(*) as clicks
        from cur where kind = 'contact_click' and source is not null
        group by source order by count(*) desc, source limit 8
      ) p
    ),
    'hours', (
      select jsonb_agg(coalesce(x.n, 0) order by h)
      from generate_series(0, 23) h
      left join (select hour, count(*) as n from cur group by hour) x on x.hour = h
    )
  ) into result;

  return result;
end;
$$;
revoke all on function public.traffic_report(int, text) from public, anon;
grant execute on function public.traffic_report(int, text) to authenticated;

-- Avisa a la API de Supabase que hay funciones nuevas (así aparecen al instante)
notify pgrst, 'reload schema';

-- ---------- 4. Comprobación ----------
select (select count(*) from public.events) as registros;
