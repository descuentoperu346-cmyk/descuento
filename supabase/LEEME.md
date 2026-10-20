# Conectar la base de datos de los leaks (Supabase)

Cuando termines, la web leerá los leaks (textos, cifras, imágenes y videos) desde tu base de datos.
Si la base no responde, la web sigue mostrando la copia que ya trae en el código: nunca queda vacía.

## Antes de empezar: usa un proyecto de Supabase NUEVO solo para los leaks

La clave pública de Supabase queda dentro de la web (es normal y es segura **si la base solo tiene contenido público**).
Tu proyecto actual guarda vendedores con PIN, así que no conviene mezclarlos. Un proyecto nuevo es gratis.

## Paso a paso

1. **Crear el proyecto.** supabase.com → *New project* → nombre `descuentos-leaks` → región *South America (São Paulo)* → *Create*.
2. **Crear las tablas.** Menú *SQL Editor* → *New query* → pega todo el contenido de `supabase/01-esquema-leaks.sql` → *Run*.
   Debe decir *Success. No rows returned*.
3. **Cargar los leaks que ya existen.** Otra *New query* → pega todo `supabase/02-leaks-seed.sql` → *Run*.
   Al final muestra una tabla con 9 filas. (Si cambias textos en `leaksData.ts`, regenéralo con `npm run leaks:seed`.)
4. **Comprobar la seguridad.** Otra *New query*, ejecuta esto (cada línea debe dar lo que dice el comentario):
   ```sql
   set role anon;
   select count(*) from public.leaks;                                  -- debe dar 9
   insert into public.leaks (id, slug, data) values ('x', 'x', '{}');  -- debe FALLAR: permission denied
   reset role;
   ```
5. **Copiar las claves.** *Project Settings* → *API*:
   - copia **Project URL**;
   - copia la clave **anon public** (o **publishable**).
   - ❌ **No copies** la `service_role` ni la `secret`: dan control total de la base.
6. **Ponerlas en la web.**
   - En tu PC: en `.env` agrega
     ```
     VITE_LEAKS_SUPABASE_URL="https://xxxx.supabase.co"
     VITE_LEAKS_SUPABASE_ANON_KEY="la-clave-publica"
     ```
     y reinicia `npm run dev`.
   - En Vercel: *Project → Settings → Environment Variables* → agrega esas dos → *Redeploy* (las variables se aplican al construir).
7. **Probar.** Abre Leaks, pulsa F12 → pestaña *Network* y recarga: debe verse una petición `leaks?select=…` a tu `supabase.co` con estado 200.

> Si por error pones una clave de administrador, la web se niega a usarla (avisa en la consola) y muestra la copia del código.

## Fotos, videos y PDF

El paso 2 ya creó el contenedor **`leaks-media`** (lectura pública, hasta 50 MB por archivo).

1. *Storage* → `leaks-media` → *Upload file* (puedes arrastrar carpetas).
2. Haz clic en el archivo → *Get URL* → copia el enlace público. Tiene esta forma:
   `https://xxxx.supabase.co/storage/v1/object/public/leaks-media/carpeta/archivo.webp`
3. Pega ese enlace dentro del leak (ver abajo).

Recomendado: imágenes en **WebP** (pesan 5–10 veces menos que JPG/PNG) y videos **MP4** cortos.

## Editar o agregar un leak

*Table Editor* → tabla `leaks`. Cada fila es un leak:

| Columna | Qué es |
|---|---|
| `status` | `draft` (borrador), `reviewed` (revisado), `published` (visible). Solo se ve lo `published`. |
| `publish_at` | Fecha y hora desde la que se ve. Antes de esa fecha **no se entrega a nadie** (embargo real). |
| `sort_order` | Orden en la lista (0 = primero). |
| `data` | El leak completo en JSON: título, textos, cifras, imágenes… |

Un video dentro de `data` se escribe así (se muestra como "Material audiovisual" en los leaks de formato revista):

```json
"videos": [
  {
    "src": "https://xxxx.supabase.co/storage/v1/object/public/leaks-media/caso/video.mp4",
    "poster": "https://xxxx.supabase.co/storage/v1/object/public/leaks-media/caso/portada.webp",
    "title": "Título del video",
    "caption": "Qué muestra, con su fuente."
  }
]
```

Editar un texto largo dentro de ese campo JSON es incómodo. Lo práctico: envíame el texto y las imágenes y genero el SQL del leak nuevo para que lo pegues y ejecutes.

## Lo que todavía NO hace

- El panel `#ironcat` **no escribe** en esta base: lo que edites en "Artículos Leaks" solo se guarda en tu navegador.
  Publicar desde el panel es la siguiente fase y necesita un inicio de sesión real con Supabase.
- Las fotos y los dos videos del caso China Polo siguen dentro de la web (`/public`). Funcionan igual; se pueden mover a Storage cuando quieras.
- Antes de publicar un leak con nombres de personas, revisa que cada una tenga imputación formal o condena citada (ver el criterio editorial del proyecto).
