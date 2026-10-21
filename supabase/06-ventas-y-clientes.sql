-- ============================================================================
-- PASO 6 · Ventas y clientes (gestión del negocio)
--
-- Requiere haber ejecutado antes el paso 3 (crea los roles y las funciones is_admin / my_vendor_id).
-- Es seguro ejecutarlo más de una vez: no borra nada.
--
-- Qué crea:
--   · customers  → clientes de cada tienda (nombre y datos de contacto).
--   · sales      → ventas registradas por el equipo (cliente, producto, monto, pago, estado, vencimiento).
--
-- Quién puede qué (lo exige la base de datos, no solo la web):
--   · ADMIN y DEV  → ven, crean, editan y borran las ventas y clientes de TODAS las tiendas.
--   · VENDEDOR     → ve, crea y edita solo lo de SU tienda (no puede borrar: anula la venta).
--   · COMPRADOR / visitante → no ve nada de estas tablas.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- ============================================================================

-- ---------- 1. Clientes ----------
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  text not null,                       -- tienda a la que pertenece (p. ej. 'vendedor-whisky')
  name       text not null check (char_length(btrim(name)) between 1 and 120),
  telegram   text check (telegram is null or char_length(telegram) <= 80),
  whatsapp   text check (whatsapp is null or char_length(whatsapp) <= 30),
  email      text check (email is null or char_length(email) <= 160),
  notes      text check (notes is null or char_length(notes) <= 1000),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customers_vendor_idx on public.customers (vendor_id, name);

-- ---------- 2. Ventas ----------
create table if not exists public.sales (
  id             uuid primary key default gen_random_uuid(),
  number         bigint generated always as identity,      -- número de venta legible (1, 2, 3…)
  vendor_id      text not null,
  customer_id    uuid references public.customers (id) on delete set null,
  customer_name  text not null check (char_length(btrim(customer_name)) between 1 and 120),  -- copia del nombre al vender
  product_id     text,
  product_title  text not null check (char_length(btrim(product_title)) between 1 and 160),  -- copia del producto al vender
  plan           text check (plan is null or char_length(plan) <= 120),
  amount         numeric(10, 2) not null check (amount >= 0 and amount <= 100000),
  payment_method text check (payment_method is null or char_length(payment_method) <= 60),
  status         text not null default 'paid' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  sold_at        timestamptz not null default now(),
  duration_days  integer check (duration_days is null or duration_days between 1 and 3650),
  expires_at     timestamptz,
  notes          text check (notes is null or char_length(notes) <= 1000),
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists sales_vendor_fecha_idx on public.sales (vendor_id, sold_at desc);
create index if not exists sales_fecha_idx        on public.sales (sold_at desc);
create index if not exists sales_vence_idx        on public.sales (expires_at) where status = 'paid' and expires_at is not null;
create index if not exists sales_cliente_idx      on public.sales (customer_id);

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
drop trigger if exists sales_updated_at on public.sales;
create trigger sales_updated_at before update on public.sales for each row execute function public.set_updated_at();

-- ---------- 3. Permisos de tabla (qué columnas se pueden escribir) ----------
alter table public.customers enable row level security;
alter table public.sales     enable row level security;

revoke all on public.customers from anon, authenticated;
revoke all on public.sales     from anon, authenticated;

grant select on public.customers to authenticated;
grant insert (vendor_id, name, telegram, whatsapp, email, notes) on public.customers to authenticated;
grant update (vendor_id, name, telegram, whatsapp, email, notes) on public.customers to authenticated;
grant delete on public.customers to authenticated;

grant select on public.sales to authenticated;
grant insert (vendor_id, customer_id, customer_name, product_id, product_title, plan, amount, payment_method, status, sold_at, duration_days, expires_at, notes)
  on public.sales to authenticated;
grant update (vendor_id, customer_id, customer_name, product_id, product_title, plan, amount, payment_method, status, sold_at, duration_days, expires_at, notes)
  on public.sales to authenticated;
grant delete on public.sales to authenticated;

-- ---------- 4. Reglas por fila ----------
-- customers
drop policy if exists customers_ver on public.customers;
create policy customers_ver on public.customers for select to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());
drop policy if exists customers_crear on public.customers;
create policy customers_crear on public.customers for insert to authenticated
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists customers_editar on public.customers;
create policy customers_editar on public.customers for update to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id())
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists customers_borrar on public.customers;
create policy customers_borrar on public.customers for delete to authenticated
  using (public.is_admin());

-- sales: el cliente elegido tiene que ser de la misma tienda que la venta
drop policy if exists sales_ver on public.sales;
create policy sales_ver on public.sales for select to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());
drop policy if exists sales_crear on public.sales;
create policy sales_crear on public.sales for insert to authenticated
  with check (
    (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.vendor_id = sales.vendor_id))
  );
drop policy if exists sales_editar on public.sales;
create policy sales_editar on public.sales for update to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id())
  with check (
    (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()))
    and (customer_id is null or exists (select 1 from public.customers c where c.id = customer_id and c.vendor_id = sales.vendor_id))
  );
drop policy if exists sales_borrar on public.sales;
create policy sales_borrar on public.sales for delete to authenticated
  using (public.is_admin());

-- Avisa a la API de Supabase que hay tablas nuevas (así aparecen al instante)
notify pgrst, 'reload schema';

-- ---------- 5. Comprobación ----------
select
  (select count(*) from public.customers) as clientes,
  (select count(*) from public.sales)     as ventas;
