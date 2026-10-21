-- ============================================================================
-- PASO 3 · Roles (DEV, ADMIN, COMPRADOR), catálogo, vendedores, métodos de pago y permisos de escritura
-- Pégalo en Supabase > SQL Editor > New query > Run.  Requiere haber ejecutado antes el paso 1.
--
-- Qué hace:
--   1. Crea las tablas  staff (equipo), buyers (compradores), products, vendors, payment_methods  (todas NUEVAS).
--   2. Define los 3 ROLES y QUIÉN puede escribir:
--        · dev       -> todo lo del admin + ve el equipo y a los compradores registrados.
--        · admin     -> productos de todos, vendedores, métodos de pago, leaks y archivos.
--        · comprador -> se registra solo desde la web; ve y edita únicamente SUS datos. No toca nada más.
--        · (vendor   -> rol opcional y limitado: solo SUS productos, SU ficha y SUS archivos.)
--      El público (sin cuenta) solo puede LEER lo activo/publicado.
--   3. Crea el contenedor de archivos catalog-media (fotos de productos, avatares, QR).
--   4. Da permiso de escritura a los admins sobre leaks y leaks-media.
--
-- Importante: el equipo (dev/admin) se da de alta en la tabla staff (paso 5). Registrarse en la web NO da permisos:
-- una cuenta sin fila en staff es "comprador" y solo puede leer lo público y editar sus propios datos.
-- Seguridad: los PIN nunca se guardan aquí (la tabla vendors RECHAZA cualquier fila con "pin").
-- Se puede ejecutar más de una vez: no borra ni modifica datos existentes.
-- ============================================================================

-- ---------- 1. Cuentas del equipo (dev / admin / vendor) ----------
create table if not exists public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null check (role in ('dev', 'admin', 'vendor')),
  vendor_id    text,                         -- id de su tienda (p. ej. 'vendedor-whisky')
  display_name text not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.staff add column if not exists username text;   -- nombre visible, p. ej. 'Tin9o'
create unique index if not exists staff_username_idx on public.staff (lower(username)) where username is not null;
alter table public.staff enable row level security;

-- Si la tabla ya existía con solo admin/vendor, se actualiza la regla para aceptar también 'dev'.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.staff'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%role%'
  loop
    execute format('alter table public.staff drop constraint %I', c.conname);
  end loop;
  alter table public.staff add constraint staff_role_check check (role in ('dev', 'admin', 'vendor'));
end $$;

-- ---------- 2. Funciones de ayuda (leen staff aunque quien pregunta no pueda verla) ----------
-- is_admin(): true para dev y admin (los dos pueden editar el contenido).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and s.role in ('admin', 'dev') and s.active
  );
$$;

-- is_dev(): solo el desarrollador.
create or replace function public.is_dev() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and s.role = 'dev' and s.active
  );
$$;

create or replace function public.my_vendor_id() returns text
language sql stable security definer set search_path = public as $$
  select s.vendor_id from public.staff s where s.user_id = auth.uid() and s.active;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_dev() from public;
revoke all on function public.my_vendor_id() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_dev() to anon, authenticated;
grant execute on function public.my_vendor_id() to anon, authenticated;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 3. Tablas de contenido (cada fila guarda el objeto completo en "data") ----------
create table if not exists public.products (
  id         text primary key,
  vendor_id  text,
  active     boolean not null default true,
  sort_order int not null default 0,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists products_publicos_idx on public.products (active, sort_order);
create index if not exists products_vendor_idx on public.products (vendor_id);

create table if not exists public.vendors (
  id         text primary key,
  username   text not null,
  active     boolean not null default true,
  sort_order int not null default 0,
  data       jsonb not null check (not (data ? 'pin')),   -- los PIN no entran en esta tabla
  updated_at timestamptz not null default now()
);
create unique index if not exists vendors_username_idx on public.vendors (lower(username));

create table if not exists public.payment_methods (
  id         text primary key,
  active     boolean not null default true,
  sort_order int not null default 0,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists vendors_updated_at on public.vendors;
create trigger vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
drop trigger if exists payment_methods_updated_at on public.payment_methods;
create trigger payment_methods_updated_at before update on public.payment_methods for each row execute function public.set_updated_at();
drop trigger if exists leaks_updated_at on public.leaks;
create trigger leaks_updated_at before update on public.leaks for each row execute function public.set_updated_at();

alter table public.products        enable row level security;
alter table public.vendors         enable row level security;
alter table public.payment_methods enable row level security;

-- ---------- 3b. Compradores (se registran solos desde la web) ----------
create table if not exists public.buyers (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  phone        text check (phone is null or char_length(phone) <= 30),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.buyers enable row level security;

drop trigger if exists buyers_updated_at on public.buyers;
create trigger buyers_updated_at before update on public.buyers for each row execute function public.set_updated_at();

-- Al registrarse alguien en Authentication se crea su ficha de comprador (nombre y teléfono vienen del formulario).
-- Si algo fallara aquí, el registro NO se bloquea: la web vuelve a crear la ficha al iniciar sesión.
create or replace function public.handle_new_buyer() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.buyers (user_id, email, display_name, phone)
  values (
    new.id,
    new.email,
    nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 80), ''),
    nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), 30), '')
  )
  on conflict (user_id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.handle_new_buyer() from public;

drop trigger if exists on_auth_user_created_buyer on auth.users;
create trigger on_auth_user_created_buyer after insert on auth.users
  for each row execute function public.handle_new_buyer();

-- El público no escribe nunca. (Refuerzo a nivel de permisos, además de las reglas de abajo.)
revoke insert, update, delete, truncate on public.products, public.vendors, public.payment_methods, public.staff from anon;
grant  insert, update, delete on public.products, public.vendors, public.payment_methods to authenticated;
revoke insert, update, delete, truncate on public.staff from authenticated;
-- buyers: solo con sesión; el comprador escribe únicamente nombre y teléfono (el correo lo pone el sistema).
revoke all on public.buyers from anon, authenticated;
grant select on public.buyers to authenticated;
grant insert (user_id, display_name, phone) on public.buyers to authenticated;
grant update (display_name, phone) on public.buyers to authenticated;
-- leaks (creada en el paso 1): ahora los admins autenticados pueden escribir; las reglas de abajo los limitan.
grant insert, update, delete on public.leaks to authenticated;

-- ---------- 4. Reglas de seguridad (RLS) ----------
-- staff: cada cuenta ve solo su propia fila (el dev ve todo el equipo). Nadie escribe por la API:
-- el equipo se administra desde este SQL Editor (paso 5).
drop policy if exists staff_ver_propio on public.staff;
create policy staff_ver_propio on public.staff for select to authenticated using (user_id = auth.uid());
drop policy if exists staff_ver_dev on public.staff;
create policy staff_ver_dev on public.staff for select to authenticated using (public.is_dev());

-- buyers: cada comprador ve y edita SOLO su ficha; el dev ve a todos (para dar soporte). El admin no ve datos de compradores.
drop policy if exists buyers_ver_propio on public.buyers;
create policy buyers_ver_propio on public.buyers for select to authenticated using (user_id = auth.uid());
drop policy if exists buyers_ver_dev on public.buyers;
create policy buyers_ver_dev on public.buyers for select to authenticated using (public.is_dev());
drop policy if exists buyers_crear_propio on public.buyers;
create policy buyers_crear_propio on public.buyers for insert to authenticated with check (user_id = auth.uid());
drop policy if exists buyers_editar_propio on public.buyers;
create policy buyers_editar_propio on public.buyers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- products
drop policy if exists products_lectura_publica on public.products;
create policy products_lectura_publica on public.products for select to anon, authenticated using (active);
drop policy if exists products_lectura_staff on public.products;
create policy products_lectura_staff on public.products for select to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());
drop policy if exists products_insertar on public.products;
create policy products_insertar on public.products for insert to authenticated
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists products_actualizar on public.products;
create policy products_actualizar on public.products for update to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id())
  with check (public.is_admin() or (vendor_id is not null and vendor_id = public.my_vendor_id()));
drop policy if exists products_borrar on public.products;
create policy products_borrar on public.products for delete to authenticated
  using (public.is_admin() or vendor_id = public.my_vendor_id());

-- vendors (ficha pública del vendedor, sin PIN)
drop policy if exists vendors_lectura_publica on public.vendors;
create policy vendors_lectura_publica on public.vendors for select to anon, authenticated using (active);
drop policy if exists vendors_lectura_staff on public.vendors;
create policy vendors_lectura_staff on public.vendors for select to authenticated
  using (public.is_admin() or id = public.my_vendor_id());
drop policy if exists vendors_insertar on public.vendors;
-- (Un vendedor puede "insertar" solo su propia fila: así funciona el guardado "insertar o actualizar" de su ficha.)
create policy vendors_insertar on public.vendors for insert to authenticated
  with check (public.is_admin() or id = public.my_vendor_id());
drop policy if exists vendors_actualizar on public.vendors;
create policy vendors_actualizar on public.vendors for update to authenticated
  using (public.is_admin() or id = public.my_vendor_id())
  with check (public.is_admin() or id = public.my_vendor_id());
drop policy if exists vendors_borrar on public.vendors;
create policy vendors_borrar on public.vendors for delete to authenticated using (public.is_admin());

-- payment_methods
drop policy if exists payment_methods_lectura_publica on public.payment_methods;
create policy payment_methods_lectura_publica on public.payment_methods for select to anon, authenticated using (active);
drop policy if exists payment_methods_lectura_admin on public.payment_methods;
create policy payment_methods_lectura_admin on public.payment_methods for select to authenticated using (public.is_admin());
drop policy if exists payment_methods_escribir on public.payment_methods;
create policy payment_methods_escribir on public.payment_methods for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- leaks: los admins ven también borradores y pueden escribir
drop policy if exists leaks_lectura_admin on public.leaks;
create policy leaks_lectura_admin on public.leaks for select to authenticated using (public.is_admin());
drop policy if exists leaks_escribir_admin on public.leaks;
create policy leaks_escribir_admin on public.leaks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- 5. Archivos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-media', 'catalog-media', true, 10485760,   -- 10 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- leaks-media: solo admins suben, cambian o borran. Todos pueden VER por enlace público.
drop policy if exists leaks_media_ver_admin on storage.objects;
create policy leaks_media_ver_admin on storage.objects for select to authenticated
  using (bucket_id = 'leaks-media' and public.is_admin());
drop policy if exists leaks_media_subir_admin on storage.objects;
create policy leaks_media_subir_admin on storage.objects for insert to authenticated
  with check (bucket_id = 'leaks-media' and public.is_admin());
drop policy if exists leaks_media_cambiar_admin on storage.objects;
create policy leaks_media_cambiar_admin on storage.objects for update to authenticated
  using (bucket_id = 'leaks-media' and public.is_admin()) with check (bucket_id = 'leaks-media' and public.is_admin());
drop policy if exists leaks_media_borrar_admin on storage.objects;
create policy leaks_media_borrar_admin on storage.objects for delete to authenticated
  using (bucket_id = 'leaks-media' and public.is_admin());

-- catalog-media: ruta  <id-del-vendedor>/<archivo>. Un vendedor solo escribe en SU carpeta; el admin, en cualquiera.
drop policy if exists catalog_media_ver_staff on storage.objects;
create policy catalog_media_ver_staff on storage.objects for select to authenticated
  using (bucket_id = 'catalog-media' and (public.is_admin() or (storage.foldername(name))[1] = public.my_vendor_id()));
drop policy if exists catalog_media_subir_staff on storage.objects;
create policy catalog_media_subir_staff on storage.objects for insert to authenticated
  with check (bucket_id = 'catalog-media' and (public.is_admin() or (storage.foldername(name))[1] = public.my_vendor_id()));
drop policy if exists catalog_media_cambiar_staff on storage.objects;
create policy catalog_media_cambiar_staff on storage.objects for update to authenticated
  using (bucket_id = 'catalog-media' and (public.is_admin() or (storage.foldername(name))[1] = public.my_vendor_id()))
  with check (bucket_id = 'catalog-media' and (public.is_admin() or (storage.foldername(name))[1] = public.my_vendor_id()));
drop policy if exists catalog_media_borrar_staff on storage.objects;
create policy catalog_media_borrar_staff on storage.objects for delete to authenticated
  using (bucket_id = 'catalog-media' and (public.is_admin() or (storage.foldername(name))[1] = public.my_vendor_id()));
