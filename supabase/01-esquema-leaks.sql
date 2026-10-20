-- ============================================================================
-- PASO 1 · Esquema de los leaks (Descuentos Perú)
-- Pégalo en Supabase > SQL Editor > New query > Run.
--
-- Qué hace (solo AGREGA cosas nuevas, no borra ni cambia nada existente):
--   1. Crea la tabla  public.leaks  (una fila por leak, con todo su contenido en la columna "data").
--   2. Activa la seguridad por filas (RLS): el público solo puede LEER leaks publicados.
--      Nadie puede escribir con la clave pública. Los cambios se hacen desde este panel de Supabase.
--   3. Crea el contenedor de archivos  leaks-media  (fotos, videos y PDF) con lectura pública.
--
-- Úsalo en un proyecto SOLO para contenido público de los leaks (ver supabase/LEEME.md).
-- ============================================================================

create table if not exists public.leaks (
  id          text primary key,                    -- p. ej. 'leak-congreso-america-tv'
  slug        text unique not null,
  leak_number int,
  sort_order  int  not null default 0,             -- orden en la lista (0 = primero)
  status      text not null default 'draft'
              check (status in ('draft', 'reviewed', 'published')),
  publish_at  timestamptz not null default now(),  -- no se entrega antes de esta fecha (embargo)
  featured    boolean not null default false,
  data        jsonb not null,                      -- el leak completo: textos, cifras, imágenes, videos...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists leaks_publicos_idx on public.leaks (status, publish_at, sort_order);

alter table public.leaks enable row level security;

-- Lectura pública SOLO de lo publicado y cuya fecha de publicación ya llegó.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'leaks' and policyname = 'leaks_lectura_publica'
  ) then
    create policy leaks_lectura_publica on public.leaks
      for select to anon, authenticated
      using (status = 'published' and publish_at <= now());
  end if;
end
$$;

-- No hay políticas de insert/update/delete: con la clave pública no se puede escribir.
-- Refuerzo: se quitan también los permisos de escritura a los roles públicos.
revoke insert, update, delete, truncate on public.leaks from anon, authenticated;

-- Contenedor de archivos (fotos, videos, PDF). Lectura pública por enlace; no se puede listar ni subir con la clave pública.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'leaks-media', 'leaks-media', true, 52428800,   -- 50 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do nothing;
