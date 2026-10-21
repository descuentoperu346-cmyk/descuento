-- ============================================================================
-- PASO 12 · Garantías y soporte (casos de clientes)
--
-- Requiere haber ejecutado antes el paso 3 (roles) y el paso 6 (ventas y clientes).
-- Es seguro ejecutarlo más de una vez: no borra nada.
--
-- Qué crea:
--   · support_cases → cada reclamo o consulta de un cliente: qué pasó, de qué venta, en qué estado está
--                     (abierto, en proceso, resuelto) y cómo se resolvió.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · ADMIN y DEV  → ven y atienden los casos de TODAS las tiendas.
--   · VENDEDOR     → ve y atiende solo los casos de SU tienda.
--   · COMPRADOR / visitante → no ve nada.
--   · Nadie borra casos: se cierran con «Resuelto» (queda el historial de lo que se hizo).
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

do $$
begin
  if to_regclass('public.sales') is null or to_regclass('public.customers') is null then
    raise exception 'Primero ejecuta supabase/06-ventas-y-clientes.sql (este paso se apoya en las ventas y los clientes).';
  end if;
end $$;

create table if not exists public.support_cases (
  id             uuid primary key default gen_random_uuid(),
  number         bigint generated always as identity,          -- número de caso legible (1, 2, 3…)
  vendor_id      text not null,                                -- tienda que atiende
  sale_id        uuid references public.sales (id) on delete set null,
  customer_id    uuid references public.customers (id) on delete set null,
  customer_name  text not null check (char_length(btrim(customer_name)) between 1 and 120),
  product_title  text check (product_title is null or char_length(product_title) <= 160),
  kind           text not null default 'problem' check (kind in ('problem', 'replacement', 'refund', 'question')),
  status         text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  description    text not null check (char_length(btrim(description)) between 1 and 2000),
  resolution     text check (resolution is null or char_length(resolution) <= 2000),
  warranty_until timestamptz,                                  -- hasta cuándo cubre la garantía (copiado de la venta)
  due_at         timestamptz,                                  -- fecha límite para responder (opcional)
  resolved_at    timestamptz,
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists support_vendor_estado_idx on public.support_cases (vendor_id, status, created_at desc);
create index if not exists support_venta_idx on public.support_cases (sale_id);

-- La fecha de resolución la pone la base (no se puede falsificar desde la web)
create or replace function public.support_cases_resolved_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'resolved' then
    if tg_op = 'UPDATE' then
      if old.status = 'resolved' then new.resolved_at = old.resolved_at; else new.resolved_at = now(); end if;
    else
      new.resolved_at = now();
    end if;
  else
    new.resolved_at = null;
  end if;
  return new;
end;
$$;
drop trigger if exists support_cases_estado on public.support_cases;
create trigger support_cases_estado before insert or update on public.support_cases
  for each row execute function public.support_cases_resolved_at();

alter table public.support_cases enable row level security;
revoke all on public.support_cases from anon, authenticated;
grant select on public.support_cases to authenticated;
grant insert (vendor_id, sale_id, customer_id, customer_name, product_title, kind, status, description, resolution, warranty_until, due_at)
  on public.support_cases to authenticated;
grant update (sale_id, customer_id, customer_name, product_title, kind, status, description, resolution, warranty_until, due_at)
  on public.support_cases to authenticated;

drop policy if exists support_ver on public.support_cases;
create policy support_ver on public.support_cases for select to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());
-- La venta y el cliente elegidos tienen que ser de la misma tienda que el caso
drop policy if exists support_crear on public.support_cases;
create policy support_crear on public.support_cases for insert to authenticated
  with check (
    (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()))
    and (sale_id is null or exists (select 1 from public.sales s where s.id = sale_id and s.vendor_id = support_cases.vendor_id))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.vendor_id = support_cases.vendor_id))
  );
drop policy if exists support_editar on public.support_cases;
create policy support_editar on public.support_cases for update to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id())
  with check (
    (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()))
    and (sale_id is null or exists (select 1 from public.sales s where s.id = sale_id and s.vendor_id = support_cases.vendor_id))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.vendor_id = support_cases.vendor_id))
  );

notify pgrst, 'reload schema';

select count(*) as casos from public.support_cases;
