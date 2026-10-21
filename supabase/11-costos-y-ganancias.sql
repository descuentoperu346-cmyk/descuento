-- ============================================================================
-- PASO 11 · Costos de tus productos (para la pantalla «Ganancias»)
--
-- Requiere haber ejecutado antes el paso 3 (roles). Es seguro ejecutarlo más de una vez: no borra nada.
--
-- Qué crea:
--   · product_costs → cuánto TE CUESTA cada producto (o cada plan) en cada tienda.
--
-- Por qué una tabla aparte y no dentro del producto:
--   Los productos se pueden leer públicamente (así los ve la tienda). El costo es un dato PRIVADO:
--   si estuviera dentro del producto, cualquiera podría verlo. Aquí solo lo ve el equipo.
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · ADMIN y DEV  → ven y editan los costos de TODAS las tiendas.
--   · VENDEDOR     → ve y edita solo los costos de SU tienda.
--   · COMPRADOR / visitante → no ve nada.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

create table if not exists public.product_costs (
  vendor_id  text not null,                                  -- tienda que vende (p. ej. 'vendedor-whisky')
  product_id text not null,
  plan       text not null default '' check (char_length(plan) <= 120),   -- '' = vale para todos los planes del producto
  cost       numeric(10, 2) not null check (cost >= 0 and cost <= 100000),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, product_id, plan)
);

drop trigger if exists product_costs_updated_at on public.product_costs;
create trigger product_costs_updated_at before update on public.product_costs for each row execute function public.set_updated_at();

alter table public.product_costs enable row level security;
revoke all on public.product_costs from anon, authenticated;
grant select, delete on public.product_costs to authenticated;
grant insert (vendor_id, product_id, plan, cost) on public.product_costs to authenticated;
grant update (cost) on public.product_costs to authenticated;

drop policy if exists costs_ver on public.product_costs;
create policy costs_ver on public.product_costs for select to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());
drop policy if exists costs_crear on public.product_costs;
create policy costs_crear on public.product_costs for insert to authenticated
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists costs_editar on public.product_costs;
create policy costs_editar on public.product_costs for update to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id())
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists costs_borrar on public.product_costs;
create policy costs_borrar on public.product_costs for delete to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());

notify pgrst, 'reload schema';

select count(*) as costos_guardados from public.product_costs;
