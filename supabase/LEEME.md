# Conectar la base de datos (Supabase) — guía paso a paso

Cuando termines:

- La web leerá de tu base de datos los **leaks, el catálogo, los vendedores y los métodos de pago**.
- El panel podrá llevar tus **ventas, clientes y renovaciones** (Parte C, opcional).
- El panel podrá mostrar las **visitas y clics reales** de la web (Parte D, opcional).
- Lo que se borre irá a una **papelera** 30 días, el DEV tendrá un **historial de cambios** y una **copia de seguridad** (Parte E, opcional).
- Los compradores podrán entrar con un botón **«Continuar con Google»** (Parte F, opcional).
- El panel tendrá **Ganancias**, **Garantías y soporte** y **Mensajes listos** (Parte G, opcional).
- Las **fotos** se guardan en Supabase (Storage) y en la base queda solo su enlace.
- Hay **3 roles**: **DEV**, **ADMIN** y **COMPRADOR** (ver la tabla más abajo).
- El equipo entra al panel (`/#ironcat`) con **usuario + clave**; los compradores se **registran solos** en la web.
- Si la base no responde, la web sigue mostrando la copia que trae en el código: nunca queda vacía.

> **Importante:** usa un proyecto de Supabase **nuevo**, solo para contenido público. La clave pública queda dentro de la web
> (es normal y es segura si la base solo tiene contenido público). Tu proyecto actual guarda vendedores con PIN: no lo mezcles.

## Los 3 roles

| Rol | Quién es | Qué puede hacer |
|---|---|---|
| **DEV** | `@Tin9o` | Todo lo del admin **+** ve el equipo y la lista de compradores (pestaña *Equipo & Compradores* del panel). |
| **ADMIN** | `@whiskyper`, `@AbbysPeru`, `@elnanovip` | Productos de todas las tiendas, vendedores, métodos de pago, leaks (incluye borradores) y archivos. **No** ve datos de compradores ni cambia roles. |
| **COMPRADOR** | cualquier persona que se registre en la web | Ve el catálogo, **compra** (el botón *Comprar* pide cuenta) y edita **solo sus datos** (nombre, teléfono, contraseña). No entra al panel ni escribe nada de la web. |
| *Público* | visitante sin cuenta | Solo lee lo activo y publicado. |

*(Existe además un rol `vendor`, opcional y limitado: solo SUS productos, SU ficha y SUS fotos. No se usa en las cuentas de abajo.)*

Registrarse en la web **nunca** da permisos de equipo: los permisos salen de la tabla `staff`, que solo se escribe desde el SQL Editor.

## Parte A — Preparar la base (se hace una sola vez)

1. **Crear el proyecto.** supabase.com → *New project* → nombre `descuentos-web` → región *South America (São Paulo)* → *Create*.
2. **Crear las tablas de leaks.** Menú *SQL Editor* → *New query* → pega todo `supabase/01-esquema-leaks.sql` → *Run*.
3. **Crear roles, catálogo, compradores y archivos.** Otra *New query* → pega todo `supabase/03-catalogo-y-panel.sql` → *Run*.
   (Si ya lo habías ejecutado antes, vuelve a ejecutarlo: se actualiza solo y no borra nada.)
4. **Cargar lo que ya existe.** Dos consultas más, una por archivo (cada una con *Run*):
   - `supabase/02-leaks-seed.sql` → al final muestra 9 filas.
   - `supabase/04-catalogo-seed.sql` → al final muestra vendedores 5, productos 8, pagos 11.

   ⚠️ Antes de ejecutar el 04, revisa en el archivo los **números de cuenta, teléfonos y QR de pago**: son los que hoy están en el código
   (varios parecen de ejemplo). Después puedes corregirlos desde el panel.
5. **Crear las cuentas del equipo (DEV y ADMIN).**
   - Abre `supabase/05-crear-cuentas.local.sql` (ya tiene las 4 cuentas con sus claves), pégalo en una *New query* → *Run*.
     Al final lista las 4 cuentas con su rol.
   - Ese archivo **no se sube a git** (los `*.local.sql` están ignorados), porque lleva claves. El archivo `05-crear-cuentas.sql` es la plantilla
     sin claves; para añadir a alguien, agrégalo a la lista de cualquiera de los dos y vuelve a ejecutarlo.
   - Las claves se guardan **cifradas** en Supabase. Cada persona puede cambiar la suya desde el panel (*Mi Perfil & Datos → Nueva contraseña*, mín. 10 caracteres).
   - Entrar: `https://tu-web/#ironcat` → usuario `@Tin9o` (o `Tin9o`) y su clave. La web arma sola el correo interno
     (`tin9o@equipo.descuentos-peru.invalid`); ese correo **no recibe mensajes**, así que el equipo no usa «olvidé mi contraseña»:
     si alguien pierde su clave, se restablece con `restablecer := true` en el SQL (o en *Authentication → Users*).
6. **Dejar el registro de compradores abierto.** *Authentication → Sign In / Providers → Email*:
   - **Enable Email provider**: tiene que estar **ACTIVADO**. Si está apagado, NADIE puede entrar (ni el equipo ni los compradores) y la base responde `email_provider_disabled`.
   - **Allow new users to sign up**: déjalo **ACTIVADO** (los compradores se registran solos).
   - **Confirm email**: recomendado **DESACTIVADO** para que el comprador entre al instante. Si lo dejas activo, cada registro envía un correo y el plan
     gratis permite muy pocos por hora (configura un SMTP propio si lo quieres activo).
   - No actives CAPTCHA todavía: el formulario aún no lo soporta y los registros fallarían.
7. **Comprobar la seguridad.** En una consulta nueva ejecuta esto (los conteos deben dar lo indicado y las dos últimas líneas **deben fallar**):
   ```sql
   set role anon;
   select count(*) from public.leaks;      -- 9
   select count(*) from public.products;   -- 8
   select count(*) from public.vendors;    -- 5
   select count(*) from public.staff;      -- 0
   select count(*) from public.buyers;     -- debe FALLAR (permission denied)
   insert into public.products (id, vendor_id, data) values ('x', 'vendedor-central', '{}');  -- debe FALLAR
   reset role;
   ```

## Parte B — Conectar la web

8. **Copiar las claves.** *Project Settings → API*: copia **Project URL** y la clave **anon public** (o **publishable**).
   ❌ **No copies** la `service_role` ni la `secret`: dan control total. La web se niega a usarlas si te equivocas.
9. **Ponerlas en la web.**
   - En tu PC, en `.env`:
     ```
     VITE_CONTENT_SUPABASE_URL="https://xxxx.supabase.co"
     VITE_CONTENT_SUPABASE_ANON_KEY="la-clave-publica"
     ```
     y reinicia `npm run dev`.
   - En Vercel: *Project → Settings → Environment Variables* → agrega esas dos → *Redeploy* (se aplican al construir).
10. **Probar.** Abre la web: el catálogo y los leaks ya vienen de Supabase, y la barra superior muestra **Ingresar**.
    Entra a `…/#ironcat` con `@Tin9o` y su clave: debes ver `SESIÓN: @Tin9o · DEV`.

> Con la base conectada, el panel usa **usuario + contraseña** (Supabase Authentication). El servidor propio con usuario y PIN
> solo se usa si NO configuras estas dos variables (modo de desarrollo local); en ese modo no hay cuentas de compradores.

## Parte C — Ventas, clientes, renovaciones y reportes (módulo del panel)

Sirve para llevar el negocio: registrar cada venta, guardar a tus clientes, saber **quién está por vencer** (con el mensaje listo para WhatsApp o Telegram)
y ver tus **ingresos reales**. Se activa una sola vez:

11. **Crear las tablas.** *SQL Editor* → *New query* → pega todo `supabase/06-ventas-y-clientes.sql` → *Run* (necesita haber ejecutado antes el paso 3).
    Al final muestra `clientes = 0` y `ventas = 0`. Es seguro ejecutarlo más de una vez.
12. **Abrir el panel.** Entra a `/#ironcat`: aparece el grupo **Ventas** (Ventas, Clientes, Renovaciones) y **Reportes**. Mientras no ejecutes el paso 11,
    esas pantallas muestran «Falta activar el módulo de ventas» con estos mismos pasos (nada se rompe).

Quién ve qué (lo exige la base de datos, no solo la web):

| Rol | Ventas y clientes |
|---|---|
| **DEV / ADMIN** | De **todas** las tiendas: ver, registrar, editar y **borrar**. |
| **VENDEDOR** | Solo de **su** tienda: ver, registrar y editar. No borra: **anula** la venta. |
| **COMPRADOR / público** | Nada. |

Cómo funciona:
- Las ventas **las registra el equipo** cuando cierra la venta por Telegram o WhatsApp: el panel no cobra ni conecta pasarelas de pago. Por eso las cifras
  son reales pero dependen de que se anoten.
- Solo las ventas **Pagadas** cuentan como ingreso. Las *Pendientes* se muestran como «pendiente de cobro»; las *Anuladas* y *Reembolsadas* no suman.
- Cada venta puede tener **duración** (por ejemplo 30 días) y entonces aparece en **Renovaciones**. Si el cliente renueva, la venta anterior deja de contar como vencida.
- Todas las fechas usan la **hora de Lima**.
- **Exportar CSV** (Ventas) abre en Excel o Google Sheets. Las celdas que empiezan con `=`, `+`, `-` o `@` se guardan como texto para que nadie pueda colar fórmulas.
- Los datos de tus clientes (nombre, Telegram, WhatsApp, correo) son **datos personales**: no los compartas y limítalos a lo necesario.
- Se muestran hasta las **5,000 ventas más recientes** en pantalla; las anteriores siguen guardadas en la base.

## Parte D — Visitas y clics reales (pantalla «Tráfico y clics»)

Cuenta cuántas personas entran a la web, qué productos abren y cuántas pulsan el botón de **Telegram o WhatsApp** de una tienda. Antes esta pantalla mostraba
cifras de ejemplo; ahora solo muestra datos reales. Se activa una sola vez:

13. **Crear la tabla y las funciones.** *SQL Editor* → *New query* → pega todo `supabase/07-visitas-y-clics.sql` → *Run* (necesita el paso 3).
    Al final muestra `registros = 0`. Es seguro ejecutarlo más de una vez.
14. **Mirar las cifras.** Panel → *Tráfico y clics*. Las cifras empiezan a contarse desde que ejecutas el paso 13 (no hay datos de antes).
    Mientras no lo ejecutes, la pantalla muestra «Falta activar el registro de visitas y clics» con estos mismos pasos.

Qué se guarda y qué no:
- **Se guarda:** qué pasó (visita, producto abierto, clic en Telegram/WhatsApp), de qué tienda o producto, la fecha, y un **código al azar por navegador**
  (para contar personas distintas).
- **NO se guarda:** IP, nombre, correo ni teléfono. Nadie puede leer la tabla directamente: solo las funciones del paso 13.
- **No se cuenta** a quien tiene activado «No rastrear» (o *Global Privacy Control*), a los robots, ni al equipo con sesión iniciada en ese navegador.

Quién ve qué (lo exige la base de datos):

| Rol | Tráfico y clics |
|---|---|
| **DEV / ADMIN** | Toda la web (visitas, productos abiertos, clics) o la tienda que elijan. |
| **VENDEDOR** | Solo las vistas de productos y los clics de **su** tienda. |
| **COMPRADOR / público** | Nada. El público solo puede *enviar* un registro; no puede leerlos. |

Protección contra abuso (la base ignora el exceso, sin dar error): máximo **60 registros por visitante por hora**, **600 por minuto** en total, y un mismo
registro repetido en menos de 3 segundos cuenta una sola vez. No es imposible de engañar (cualquiera puede abrir la web muchas veces con navegadores
distintos), así que **las cifras son una guía, no una auditoría**. Las ventas registradas en la parte C son la cifra que manda.
Si la tabla crece demasiado, se puede limpiar: `delete from public.events where created_at < now() - interval '180 days';`

## Parte E — Papelera, historial de cambios y copia de seguridad

Son tres piezas **independientes**: se ejecuta un archivo por vez, en el orden que quieras (todas necesitan el paso 3; ventas y clientes se incluyen si ya hiciste el 06).
Cada una se puede ejecutar más de una vez sin problema. Mientras una no esté ejecutada, su pantalla del panel muestra «Falta activar…» con los mismos pasos.

15. **Papelera.** *SQL Editor* → *New query* → pega todo `supabase/08-papelera.sql` → *Run*. Al final muestra `elementos_en_la_papelera = 0`.
    Desde ese momento, todo lo que se borre (producto, tienda, método de pago, artículo, cliente o venta) se guarda **30 días** y se restaura desde el panel
    (*Catálogo → Papelera*). Pasados los 30 días se elimina solo. *Nada de lo que borraste antes de ejecutarlo se puede recuperar.*
16. **Historial de cambios (solo DEV).** Pega todo `supabase/09-historial-de-cambios.sql` → *Run*. Anota quién cambió qué y cuándo, con el valor de **antes y después**
    de cada dato. Se ve en el panel: *Desarrollador → Historial de cambios*. Se conserva 12 meses. No guarda contraseñas ni copia las fotos.
17. **Copia de seguridad (solo DEV).** Pega todo `supabase/10-respaldo.sql` → *Run*. Desde el panel (*Desarrollador → Copia de la base de datos*):
    - **Descargar copia:** baja un archivo `.json` con productos, tiendas, métodos de pago, artículos, clientes y ventas. Trae datos de clientes: guárdalo en privado.
      No incluye contraseñas, cuentas ni compradores registrados.
    - **Recuperar lo que falte:** vuelve a poner lo que ya no existe en la base. **Nunca cambia ni borra** lo que hay: solo agrega lo que falta.

Quién ve qué (lo exige la base de datos):

| Rol | Papelera | Historial | Copia |
|---|---|---|---|
| **DEV / ADMIN** | Ven y restauran todo lo borrado | Solo el DEV | Solo el DEV |
| **VENDEDOR** | Solo los **productos** borrados de su tienda | No | No |
| **COMPRADOR / público** | Nada | No | No |

Límites que conviene saber:
- La papelera guarda una copia de la fila. Las **fotos** de un producto borrado siguen en Storage (no se eliminan), así que al restaurar vuelven a verse.
- Si ya existe otro elemento con el mismo identificador o nombre, restaurar avisa del choque y no pisa nada.
- Una copia de seguridad es una foto de ese momento: hazla de vez en cuando (por ejemplo cada semana y antes de cambios grandes). Revisa en Supabase si tu plan incluye copias automáticas; esta es una copia tuya, aparte.

## Parte F — Entrar con Google (botón «Continuar con Google»)

La persona pulsa el botón, se abre Google para elegir su cuenta y vuelve a la web ya con su cuenta de **comprador**. No necesita inventar una contraseña y la web
nunca recibe su contraseña de Google. Es solo para **compradores**: el equipo sigue entrando con `@usuario`, y una cuenta de Google **nunca** da permisos del panel.
El botón se ve siempre en «Ya tengo cuenta» y «Crear cuenta»; **mientras Google no esté encendido en Supabase**, al pulsarlo avisa «todavía no está activado» (no manda a ninguna página de error). Se prepara una sola vez, en 3 lugares:

**1. En Google Cloud** (console.cloud.google.com, con tu cuenta de Google):
   1. Crea un proyecto nuevo (por ejemplo «Descuentos Perú»).
   2. *APIs y servicios → Pantalla de consentimiento de OAuth*: tipo **Externo**, escribe el nombre de la app y tu correo de contacto. Al terminar, pulsa **Publicar la app**
      (si se queda en «Prueba», solo podrán entrar las personas que añadas a mano).
   3. *APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*:
      - **Orígenes autorizados de JavaScript:** la dirección de tu web (por ejemplo `https://tu-web.vercel.app`).
      - **URI de redireccionamiento autorizados:** la «Callback URL» que te muestra Supabase en el paso 2 (termina en `/auth/v1/callback`).
   4. Copia el **ID de cliente** y el **Secreto de cliente**.

**2. En Supabase** → *Authentication → Sign In / Providers → Google*: enciéndelo, pega el ID y el Secreto → *Save*. Ahí mismo copia la «Callback URL» y pégala en Google (paso 1.3).

**3. En Supabase** → *Authentication → URL Configuration*: en **Site URL** pon la dirección de tu web y en **Redirect URLs** agrega esa misma dirección con `/**` al final
   (por ejemplo `https://tu-web.vercel.app/**`). Para probar en tu computadora agrega también `http://localhost:5173/**`.

**4. Probar.** Abre la web → *Ingresar* → pulsa «Continuar con Google»: debe abrirse Google para elegir cuenta. Si sale el aviso «todavía no está activado», revisa que Google esté encendido en Supabase (paso 2).

Seguridad:
- El **Secreto de cliente** se pega **solo en Supabase**. Nunca en la web, en este proyecto ni en un chat.
- Antes de abrirlo al público, enciende **Confirm email** (*Authentication → Sign In / Providers → Email*). Así nadie puede registrarse con el correo de otra persona
  antes de que esa persona entre con Google. Para que lleguen los correos de confirmación necesitas conectar un servicio de envío (*Authentication → Emails → SMTP Settings*).
- Del usuario de Google solo se usa el **correo** y el **nombre** (para llenar su ficha de comprador). Nunca la foto ni sus contactos.

## Parte G — Ganancias, garantías y mensajes (secciones del panel)

Tres secciones nuevas. **Mensajes listos no necesita nada**; las otras dos se activan con un archivo cada una (se ejecutan uno por vez; mientras no lo hagas, su pantalla dice «Falta activar…» con los mismos pasos).

18. **Costos y ganancias.** *SQL Editor* → *New query* → pega todo `supabase/11-costos-y-ganancias.sql` → *Run* (necesita el paso 3).
    Crea una tabla **privada** con lo que te cuesta cada producto (por tienda y por plan). No va dentro del producto a propósito: los productos son públicos y el costo no.
    En el panel: *Análisis → Ganancias*. Escribe tus costos y verás ingresos, costos, **ganancia** y **margen** por período y por producto.
    - Solo cuentan las ventas **pagadas**. La ganancia se calcula **solo con las ventas que tienen costo**; las demás se avisan aparte («3 ventas sin costo») y nunca se inventa un costo.
    - Se usa el costo que tienes anotado **hoy**: si lo cambias, se recalcula también lo ya vendido.
    - Un producto con varios planes tiene una fila «Todos los planes» (para planes sin costo propio y ventas sin plan) y una por plan.
19. **Garantías y soporte.** Pega todo `supabase/12-garantias-y-soporte.sql` → *Run* (necesita el paso 3 y el **06**, porque se apoya en las ventas y los clientes).
    En el panel: *Ventas → Garantías y soporte*. Anota cada reclamo (qué pasó, de qué venta, fecha límite), atiéndelo y ciérralo con «Resolver» dejando escrito cómo se resolvió.
    Si eliges la venta, el cliente, el producto y **hasta cuándo dura la garantía** se llenan solos. El menú muestra cuántos casos hay pendientes.
    Nadie borra casos (ni el admin): se cierran con «Resuelto», para que quede el historial.
20. **Mensajes listos.** *Ventas → Mensajes listos*: 7 textos (bienvenida, aviso de vencimiento, renovación, cobro, garantía recibida, solucionado, gracias). Eliges una venta y se llenan solos
    el nombre, el producto, el monto, la fecha y las formas de pago; luego **copias** el mensaje o abres WhatsApp/Telegram del cliente. Puedes cambiar los textos y guardar tu versión:
    se guarda **solo en el navegador que usas** (si entras desde otro equipo vuelven los originales).

Quién ve qué (lo exige la base de datos):

| Rol | Costos y ganancias | Garantías y soporte | Mensajes listos |
|---|---|---|---|
| **DEV / ADMIN** | Ven y editan los costos de todas las tiendas | Ven y atienden los casos de todas las tiendas | Sí |
| **VENDEDOR** | Solo los de **su** tienda | Solo los casos de **su** tienda | Sí (con sus ventas) |
| **COMPRADOR / público** | Nada | Nada | — |

## Cómo se usa

- **Compradores:** botón **Ingresar** (barra superior) → *Crear cuenta* (nombre, correo, teléfono opcional, contraseña de 8+ caracteres).
  Para comprar hay que haber iniciado sesión: si no, *Comprar por Telegram/WhatsApp* abre el registro y, al terminar, un botón
  *Continuar con mi compra* abre el chat del vendedor. Si prefieres que **no** sea obligatorio, cambia `REQUIRE_ACCOUNT_TO_BUY` a `false`
  en `src/lib/accountStore.ts` y vuelve a desplegar.
- **Ver compradores y equipo (solo DEV):** panel → *DESARROLLADOR → Equipo y compradores* (solo lectura).
- **Fotos:** al subir una imagen en el panel (producto, QR, leak) se guarda sola en Supabase Storage y en la base queda el enlace.
  Máximo 10 MB por imagen en el catálogo (JPG, PNG, WebP o GIF). Recomendado: WebP, pesa 5–10 veces menos.
- **Guardado:** la barra de arriba avisa *Guardando…*, *Guardado en la base* o *Error al guardar*, y muestra si la base está en línea.
- **Ocultar un producto:** en *Productos*, el interruptor *Publicado / Oculto* (el público deja de verlo; tú sigues viéndolo). Con las casillas puedes publicar u ocultar varios a la vez.
- **Buscador rápido:** Ctrl + K en el panel salta a cualquier sección, producto, tienda, cliente o artículo.
- **Leaks nuevos:** salen publicados al guardarse. Para programar uno o dejarlo en borrador, cambia `status` y `publish_at` en *Table Editor → leaks*
  (`published` solo se ve cuando llega la fecha de `publish_at`).
- **Dar de baja a alguien del equipo** (pierde el acceso al instante), en el SQL Editor:
  `update public.staff set active = false where lower(username) = lower('NombreDeUsuario');`
- **Cambiar un rol:** `update public.staff set role = 'admin' where lower(username) = lower('NombreDeUsuario');`  (`dev` | `admin` | `vendor`).

## Videos y PDF

El panel sube **imágenes** solo. Para **videos o PDF** (hasta 50 MB):

1. *Storage → `leaks-media` → Upload file* → clic en el archivo → *Get URL*.
2. Pega el enlace en el leak, en *Table Editor → leaks → data*. Un video se escribe así (se muestra como "Material audiovisual"):
   ```json
   "videos": [
     { "src": "https://xxxx.supabase.co/storage/v1/object/public/leaks-media/caso/video.mp4",
       "poster": "https://xxxx.supabase.co/storage/v1/object/public/leaks-media/caso/portada.webp",
       "title": "Título del video", "caption": "Qué muestra, con su fuente." }
   ]
   ```

## Límites y avisos

- **Claves del equipo:** una clave corta (como 6 dígitos) y compartida por varias personas es fácil de adivinar, y los usuarios (`@whiskyper`…) son públicos.
  Quien entre como ADMIN puede cambiar productos, métodos de pago (QR, números de Yape/cuentas) y leaks de toda la web. Cámbialas por claves largas
  y distintas cuanto antes (*Mi Perfil & Datos → Nueva contraseña*), y limita lo que puede hacer alguien con `role = 'vendor'` si quieres menos poder.
- Los dos videos del caso China Polo y los íconos/banners del diseño siguen dentro de la web (`/public`): cargan más rápido allí. Se pueden mover cuando quieras.
- El plan gratis de Supabase tiene límites de almacenamiento, tráfico y correos: revísalos en *Project Settings → Usage* antes de subir videos pesados o de activar *Confirm email*.
- Un vendedor puede editar su propia ficha pública (nombre, foto, métodos de pago). Sus cambios no afectan a otros vendedores.
- **PIN:** la base **rechaza** cualquier ficha de vendedor con un campo `pin`. Las contraseñas viven solo en Supabase Authentication.
- **Datos de compradores:** se guardan nombre, correo y teléfono (opcional). Solo los ve cada comprador y el DEV. Si registras compradores reales, publica un aviso de privacidad.
- Antes de publicar un leak con nombres de personas, revisa que cada una tenga imputación formal o condena citada.
- Regenerar los SQL desde el código: `npm run leaks:seed` y `npm run catalog:seed`.
