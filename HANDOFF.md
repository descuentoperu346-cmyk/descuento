# Traspaso del proyecto — Descuentos Perú

> Escrito el 2026-10-21 para la persona (o la sesión de Claude) que continúe el proyecto.
> Es un archivo **nuevo y sin commit**. No contiene claves ni contraseñas, y no debe contenerlas nunca.

## 1. Qué es y cómo está hoy

Web de **Descuentos Perú**: catálogo de productos y servicios digitales con descuento (Streaming, Educación, Investigación…), tiendas de vendedores, la revista **Leaks** (artículos de investigación) con fichas de figuras públicas, y un **panel interno oculto** en `https://<dominio>/#ironcat` para el equipo.

| Tema | Estado |
|---|---|
| Hosting | Vercel, desde el repo `descuentoperu346-cmyk/descuento`, rama `main`. |
| Último commit | `725aef8` (2026-10-21): CAPTCHA Turnstile, SQL 13, banner del equipo, contador del Leak #3, carrusel y bloque rojo, barra lateral, selector de perfil solo DEV. Ya subido a GitHub (`origin/main`). Antes: `a917dac` (panel de ventas, ganancias y soporte, login con Google, política de privacidad, roles). El `git push` lo hace el usuario en su terminal: desde la sesión de Claude Git no puede pedir credenciales. |
| Web publicada | `https://descuentos-peru.vercel.app` (política en `/privacidad`). Vercel tiene `VITE_CONTENT_SUPABASE_URL` y `VITE_CONTENT_SUPABASE_ANON_KEY` como tipo Config. |
| Google | **Activo** (2026-10-21): app publicada en Google Cloud (proyecto `descuentos-peru`), cliente OAuth "Descuentos Peru Web", Google encendido en Supabase. El botón abre Google. Falta probar el flujo completo de punta a punta (volver a la web ya con sesión de comprador). |
| Commits | **Nunca hagas commit ni push sin que el usuario lo pida.** Cambios hechos después de `725aef8` (solo este HANDOFF) quedan sin commit. |
| Base de datos | Supabase, proyecto `ncqegvituteypivmfyoo`. SQL 01–05 ejecutados por el usuario (2026-10-20). SQL 06–12: **por ejecutar, uno por uno** (ver sección 4). |
| Verificación | Todo lo nuevo pasó pruebas con una base **imitada** (stub y PGlite). **Nada se probó contra el Supabase real ni contra Google real.** |

## 2. Cómo trabajar con el usuario

- Escribe en **español**, con palabras simples y respuestas cortas. No es técnico.
- Da avisos breves de avance; se impacienta con silencios largos. Comandos pequeños, de uno en uno.
- Informa con honestidad: si algo falla o no se pudo probar, dilo.
- **Decisiones ya tomadas (no las discutas de nuevo):**
  - Los SQL se ejecutan **uno por uno**. No quiere un instalador de un solo archivo.
  - Papelera: para todos los roles; los vendedores solo ven sus productos.
  - Historial de cambios y copia de seguridad: **solo DEV**.
  - Login con Google: **solo compradores**, nunca el equipo.
  - Commit y push solo cuando el usuario lo pida (el 2026-10-21 lo pidió y se hizo el commit `a917dac`).
- Yo (Claude) **nunca ejecuto SQL en su Supabase** ni pido claves `service_role` / secret.

## 3. Arquitectura

- **React 19 + Vite 8 + Tailwind v4 + TypeScript.** Todo el contenido sale de Supabase **directo desde el navegador**, protegido con RLS. En Vercel solo se publica `dist/` (SPA con rewrite a `index.html`).
- **Rutas por hash:** `#/servicios`, `#/leaks`, `#/nosotros`, `#/contacto`, `#/tienda/<id>`, `#/leaks/figura/<id>`, y el panel `#ironcat` (`src/lib/panelRoute.ts`). Páginas en `src/pages/`; la raíz es `src/App.tsx`.
- **Variables de entorno** (`.env.example` las documenta; `.env` está en `.gitignore`):
  - `VITE_CONTENT_SUPABASE_URL` y `VITE_CONTENT_SUPABASE_ANON_KEY`: solo la clave **pública** (anon/publishable). `src/lib/contentEnv.ts` rechaza claves `service_role` / `sb_secret_`.
  - Ya están en Vercel (2026-10-21). Sin ellas la web publicada esconde el botón "Ingresar".
- **Modo del panel:**
  - Con `VITE_CONTENT_*`: modo Supabase (correo/usuario + contraseña con Supabase Auth). Es el modo principal.
  - Sin ellas: modo anterior con el servidor Express de `server/` (`npm run server`, `ADMIN_PIN_HASH`). Tiene sus propias pruebas viejas. Vercel **no** lo despliega.
- **Cebo anti-curiosos (no lo "arregles"):** `vercel.json` (cabeceras `X-DP-Data-Source`), `public/config.json` y `src/lib/decoyConfig.ts` apuntan a un proyecto falso `mgoufbntqyksunablrzb`. Es un señuelo a propósito. No lo mezcles con el proyecto real.

### Archivos clave
- `src/pages/AdminPortal.tsx`: el panel (carga perezosa de cada sección, estado de ventas, soporte, papelera).
- `src/components/panel/`: `panelNav.ts` (menú por rol), `DashboardHome.tsx` (Resumen), `ProductEditor.tsx`, `PaymentsPage.tsx`, `ArticlesPage.tsx`, `TrafficPage.tsx`, `TrashPage.tsx`, `HistoryPage.tsx`, `BackupPage.tsx`, `ui.tsx`, `fields.tsx`, `Dialog.tsx`.
- `src/components/panel/sales/`: `SalesPage`, `CustomersPage`, `RenewalsPage`, `ReportsPage`, `GainsPage`, `SupportPage`, `MessagesPage`, `SaleDialog`, `shared`, `charts`.
- `src/lib/`: `supabaseBrowser.ts` (cliente, flujo PKCE, Google), `panelAuth.ts` + `roles.ts` (login del equipo), `accountStore.ts` (compradores), `salesStore/Api/Math`, `costsStore` + `gainsMath`, `supportStore` + `supportLogic`, `messageTemplates`, `vaultApi` (papelera, historial, copia), `trafficApi` + `analytics`, `leaksDb`, `api`, `contentEnv`, `clipboard`.
- `supabase/`: los SQL y `LEEME.md`, la guía paso a paso del usuario (Partes A–G).
- `scripts/`: `generate-leaks-seed.ts`, `generate-catalog-seed.ts`, `hash-admin-pin.ts`, `optimize-images.mjs`.

### Comandos
`npm run dev` (puerto 3000) · `npm run build` · `npm run lint` (= `tsc --noEmit`) · `npm run server` (modo anterior).

## 4. Base de datos (Supabase)

Ejecutar **en orden numérico, uno por uno**, en el SQL Editor. Todos son re-ejecutables (`if not exists` / `or replace`).

| Archivo | Qué crea | Estado conocido |
|---|---|---|
| `01-esquema-leaks.sql` | tabla `leaks` (lectura pública) + bucket de medios | Ejecutado |
| `03-catalogo-y-panel.sql` | `staff`, `buyers`, `products`, `vendors`, `payment_methods`, buckets, funciones `is_admin()`, `is_dev()`, `my_vendor_id()`, `set_updated_at()` | Ejecutado |
| `02-leaks-seed.sql`, `04-catalogo-seed.sql` | datos iniciales de leaks y catálogo | Ejecutados |
| `05-crear-cuentas.local.sql` | cuentas del equipo (**ignorado por git**; trae contraseñas) | Ejecutado |
| `06-ventas-y-clientes.sql` | `customers`, `sales` | Ejecutado (verificado 2026-10-21) |
| `07-visitas-y-clics.sql` | `events`, RPC `track_event` (anon) y `traffic_report` (staff) | Ejecutado (verificado 2026-10-21) |
| `08-papelera.sql` | `trash`, triggers de borrado, `restore_from_trash`, `trash_delete_forever` (30 días) | Ejecutado (verificado 2026-10-21) |
| `09-historial-de-cambios.sql` | `audit_log` + triggers; solo DEV; 12 meses | Ejecutado (verificado 2026-10-21) |
| `10-respaldo.sql` | `export_backup()`, `restore_backup()`; solo DEV; restaurar solo agrega lo que falta | Ejecutado (verificado 2026-10-21) |
| `11-costos-y-ganancias.sql` | `product_costs` (privado) | Ejecutado (verificado 2026-10-21) |
| `12-garantias-y-soporte.sql` | `support_cases` (**requiere 06**) | Ejecutado (verificado 2026-10-21) |
| `13-endurecimiento.sql` | Lo nuevo nace cerrado (default privileges), RLS en toda tabla, `anon` sin escritura ni TRUNCATE, tablas privadas sin acceso para `anon`, funciones en lista blanca, informe final. Re-ejecutable. Probado en PGlite (`hardening-test.cjs`, 54/54). | **Ejecutado** el 2026-10-21 en el Supabase real: informe "OK · Sin hallazgos de atención". |

"Verificado" = con la clave anon (solo lectura) esas tablas y funciones responden 401 (existen y están cerradas), mientras algo inexistente responde 404. Eso prueba que existen, no que sea la última versión de cada archivo.

`diagnostico.sql` es una consulta de solo lectura (tamaño de tablas, índices, políticas RLS, consultas lentas). No es parte de la instalación. Mientras un SQL no corra, su pantalla del panel dice **"Falta activar…"** con el archivo y los pasos. Eso es lo esperado, no un error.

**Roles:** `dev` (todo) · `admin` (todo el contenido) · `vendor` (solo su tienda) · **comprador** (sesión sin fila en `staff`).
Equipo actual: DEV `@Tin9o`; ADMIN `@whiskyper`, `@AbbysPeru`, `@elnanovip`. Los compradores se registran solos.

**Reglas de diseño que no debes romper:**
- La clave `anon` es pública y visible en el navegador: eso es normal y no se "arregla". La seguridad son las RLS. Con la clave anon (solo lectura) el 2026-10-21 se comprobó que `staff`, `buyers`, `sales`, `customers`, `product_costs`, `events`, `audit_log`, `trash`, `support_cases` y las RPC `export_backup` / `traffic_report` responden sin acceso (401 = existen y están cerradas; 404 = no existen). Tras el paso 13, toda tabla o función nueva necesita `grant` explícito.
- Los **costos** nunca van en `products.data` (es público). Viven en `product_costs`.
- En las funciones SQL de permisos usa `coalesce(..., false)`: con `my_vendor_id()` nulo, `false or null` da NULL y se colaba un comprador. Ya se arregló una vez.
- Nadie borra casos de soporte: se cierran como "Resuelto".
- Solo cuentan como ingreso las ventas con estado `paid`. Las fechas usan hora de Lima (UTC-5).
- El tráfico no guarda IP ni user-agent; salta DNT/GPC, bots y staff con sesión. Los conteos son una guía, no una auditoría.

## 5. Panel: secciones y requisitos

| Sección (id) | Rol | Necesita SQL |
|---|---|---|
| Resumen (`resumen`) | todos | cifras de ventas: 06 |
| Ventas, Clientes, Renovaciones | todos (el vendedor ve lo suyo) | 06 |
| Garantías y soporte (`garantias`) | igual | 06 + 12 |
| Mensajes listos (`mensajes`) | igual | ninguno (textos propios en `localStorage`) |
| Productos, Crear o editar, Métodos de pago | todos | 03 |
| Papelera (`papelera`) | todos | 08 |
| Artículos Leaks | escribe solo admin (RLS) | 01 + 03 |
| Reportes | todos | 06 |
| Ganancias (`ganancias`) | todos | 06 + 11 |
| Tráfico y clics (`telemetria`) | todos | 07 |
| Tiendas y vendedores, Base de datos y copias | superadmin (DEV o ADMIN) | 03 |
| Equipo y compradores | **solo DEV** | 03 |
| Historial de cambios, Copia de la BD | **solo DEV** | 09 y 10 |
| Mi perfil y datos | todos | — |

Notas: `isSuperAdmin` = rol `dev` o `admin` de `staff` (igual que `is_admin()` en la base). El selector de perfil (tienda) del encabezado, el buscador Ctrl K y el botón "Gestionar" del Resumen son **solo para el rol DEV** (`canSwitchStore` en `AdminPortal.tsx`); ADMIN y VENDEDOR trabajan siempre con su propia tienda. La lista dice el rol real de la cuenta de cada tienda (DEV / ADMIN / VENDEDOR, leído de `staff`) y el encabezado muestra el rol de quien entró. Al volver a entrar se empieza en la tienda propia.

## 6. Acceso: equipo, compradores y Google

- **Equipo:** entra con `@usuario` + contraseña. `@usuario` se convierte en `<usuario>@equipo.descuentos-peru.invalid` (`staffLoginEmail` en `roles.ts`). Las contraseñas están solo en el archivo local ignorado por git. **Nunca las pongas en archivos versionados, commits ni chats.**
- **Compradores:** registro con correo, o **"Continuar con Google"** (PKCE, redirección completa). El botón se ve **siempre** en "Ya tengo cuenta" y "Crear cuenta"; al tocarlo se pregunta `GET /auth/v1/settings` y, si Google no está activo, muestra un aviso en vez de mandar a una página de error de Supabase.
- **Configuración de Google (la hace el usuario, una vez):**
  - Google Cloud: pantalla de consentimiento publicada, origen JS = la web, redirect URI = la "Callback URL" de Supabase.
  - El **Client Secret se pega solo en Supabase** (Authentication → Providers → Google). Nunca en archivos, chat ni variables `VITE_`.
  - Supabase → URL Configuration: Site URL y Redirect URLs con `/**`.
  - **Recomendado:** encender "Confirm email" (necesita SMTP, por ejemplo Resend o Brevo). Sin eso, alguien podría registrarse con el correo de otra persona.
  - Pasos completos: `supabase/LEEME.md`, Parte F.

## 7. Pruebas — y un riesgo

Las pruebas viven **fuera del repo**, en carpetas temporales que se pueden borrar:
- `C:\Users\USUARIO\AppData\Local\Temp\claude\d--descuentos-per-\1db10d52-2b10-4865-88c6-ccd40f80ae6e\scratchpad\`
  - Chrome real con Supabase imitado (`supabase-full-stub.cjs` + `content.json`): `e2e-panel-new` 57, `e2e-sales` 95, `e2e-modules` 138, `e2e-vault` 86, `e2e-google` 26, `e2e-growth` 84, `e2e-heading` 76, y las más viejas `e2e-db` 34, `e2e-roles` 43, `e2e-leaks`, `e2e-panel`.
  - Lógica: `forms-test.ts` (142), con `npx --no-install tsx`.
- `%TEMP%\pglite-test\`: reglas SQL en PGlite (`rls`, `roles`, `sales`, `events`, `vault`, `growth`, `local-accounts`, `staff-template`).
- `%TEMP%\axe-test\`: axe-core para accesibilidad (WCAG 2.0/2.1 A y AA).

Último resultado: todo en verde, `tsc` sin errores y `npm run build` correcto. Los scripts tienen rutas escritas a mano (puertos y carpeta del scratchpad). Para no perderlos, hay que moverlos al repo y ajustar esas rutas. **No lo he hecho** porque nadie me lo pidió.

## 8. Trampas conocidas

- **Tailwind v4:** `space-y-*` usa `margin-bottom`. Un `-mb-3` dentro de un `space-y` **no** acorta el espacio: lo vuelve negativo y tapa el título (pasó en el Resumen, ya corregido). Para acercar dos elementos, agrúpalos en un `div` con su propio `space-y`.
- **Windows y PowerShell:**
  - Backticks y `${}` dentro de textos se interpretan: usa la herramienta Edit para escribir código.
  - `Set-Content -Encoding UTF8` agrega BOM.
  - Para desactivar la BD en pruebas usa `' '` (un espacio) y no `''`: una variable vacía hace que se cargue `.env`.
  - El portapapeles de Windows convierte `\n` en `\r\n`.
- **TypeScript no estricto:** para estrechar uniones usa `'error' in res` y no `!res.ok`.
- **Accesibilidad:** el estado se muestra con icono + palabra (no solo color). El `aria-label` debe contener el texto visible.
- **Contadores de leaks:** hay dos, independientes, en `src/hooks/useLeakCountdown.ts`. `LEAK_DEADLINE_ISO` es el del #02 (Keiko) y **controla qué parte de su expediente se ve**: no lo cambies para anunciar otro leak. El del #03 está en `NEXT_LEAK` (fecha, textos, enlace); la barra superior y el bloque rojo de la portada lo usan vía `useFeaturedLeak()` cuando el #02 ya salió. La fecha del #03 (1 nov 2026, 8 pm Lima) es provisional. Al vencer, esos avisos dicen "LIBERADO" aunque el artículo del #03 todavía no exista: publica el artículo antes.
- **Hash routing:** cualquier ruta nueva debe respetar `isPanelHash` y los `includes()` de `App.tsx`.

## 9. Pendientes

**Del usuario:**
1. (Hecho) Los SQL 06 → 12 ya están en la base real (verificado 2026-10-21), y el 13 también.
2. (Hecho el 2026-10-21) Google probado de punta a punta: una cuenta creada con Google entró a la web y aparece en "Equipo y compradores". Comprobado también que esa cuenta NO entra al panel (`#ironcat` le muestra el login del equipo). Falta borrar el cliente OAuth repetido "Descuentos Perú web" en Google Cloud (el que se usa es "Descuentos Peru Web").
3. (Hecho) `VITE_CONTENT_*` en Vercel.
4. Cambiar el número de pago de ejemplo `999 888 777` (el Resumen avisa cuando un método o una tienda todavía lo usa).
5. Cambiar la contraseña compartida débil del equipo: cada persona la cambia ella misma en el panel (menú de la cuenta, arriba a la derecha → **Mi perfil y datos** → "Nueva contraseña", mínimo 10 caracteres). Usa `auth.updateUser` de Supabase con la sesión abierta; no se probó contra el Supabase real (solo con base imitada). **No vuelvas a ejecutar `05-crear-cuentas.local.sql`**: reinicia las claves de las cuentas a las del archivo y borraría los cambios. No hay "Olvidé mi contraseña" para el equipo (los correos internos `.invalid` no reciben mensajes): si alguien la olvida, el DEV la restablece desde Supabase.
6. Encender "Confirm email" con SMTP.
7. **Que Google muestre el nombre de la web y no `ncqegvituteypivmfyoo.supabase.co`.** Hoy la pantalla "Elige una cuenta" dice "Ir a ncqegvituteypivmfyoo.supabase.co" porque Google muestra la dirección de retorno (la de Supabase) mientras la marca de la app no esté verificada. No es un error ni un riesgo. Dos caminos: (a) verificar la marca en Google Cloud (Centro de verificación) comprobando `descuentos-peru.vercel.app` en Search Console con la etiqueta HTML; probablemente se atore porque `supabase.co` es otro dominio autorizado que no es del usuario y no se puede verificar; (b) comprar un dominio propio y usarlo como dominio de autenticación en Supabase (servicio de pago). Mientras tanto el inicio con Google funciona igual. Si se hace (a), cambiar el enlace "Política de Privacidad" del pie por un `<a href="/privacidad">` real para que Google lo detecte.
8. Seguridad en el panel de Supabase (el SQL 13 ya está ejecutado y dio "OK"): **Confirm email**, crear de nuevo la clave secreta si alguna vez se mostró, apagar proveedores que no se usan. **CAPTCHA (Cloudflare Turnstile)**: la web ya lo soporta (`src/lib/captcha.ts`, `src/components/CaptchaWidget.tsx`; `AuthModal` y `PanelLogin` envían el `captchaToken` a `signUp` / `signInWithPassword`) y queda **inactivo mientras no exista `VITE_TURNSTILE_SITE_KEY`** (comprobado: sin la variable la llave no entra en el build). Orden obligatorio, en `supabase/LEEME.md` Parte I: (1) crear el widget en Cloudflare, (2) poner `VITE_TURNSTILE_SITE_KEY` en Vercel y redesplegar (el código nuevo debe estar subido), (3) recién entonces encender CAPTCHA en Supabase con la llave secreta. Encenderlo antes rompe todos los registros e ingresos, incluido el del equipo; si pasa, apagarlo en Supabase. El ingreso con Google no usa este CAPTCHA. **Estado (2026-10-21): CAPTCHA ya está ENCENDIDO en Supabase** (Authentication → Attack Protection, Cloudflare Turnstile, secret solo en Supabase; Site Key en Vercel como `VITE_TURNSTILE_SITE_KEY`). El usuario comprobó que la verificación aparece y que el ingreso funciona. Si algún día falla el ingreso, apagar "CAPTCHA protection" en Supabase. **Max rows: dejarlo en 1000**: `salesApi.ts` pide de 1000 en 1000 (`PAGE = 1000`) y corta al recibir menos de `PAGE`; con un máximo menor se cargarían solo las primeras filas sin aviso (si se quiere bajar, bajar antes `PAGE`; `costsStore` pide `limit(5000)`).

**Nuestros, sin construir (el usuario aún no eligió):**
- Stock de cuentas y perfiles (solo cantidades; sin guardar contraseñas de cuentas).
- Gastos (para ganancia neta real).
- Cupones y promociones.
- Anuncios y banners editables (hoy están en el código).
- 2FA para el equipo y "Olvidé mi contraseña".
- Cobros pendientes, comisiones por tienda, proveedores, reseñas, preguntas frecuentes.
- "Mis compras" para compradores: **no es seguro** mientras "Confirm email" esté apagado.
- Avisos automáticos por correo o WhatsApp: no hay servidor para eso; hoy solo hay "copiar y enviar".

**Límites conocidos:**
- Ganancias usa el costo anotado **hoy**, incluso para ventas pasadas.
- Las ventas sin producto del catálogo no pueden tener costo.
- Los textos editados de Mensajes se guardan solo en ese navegador.

**Limpieza de baja prioridad:**
- `README.md` es la plantilla vieja de AI Studio.
- `package.json` se llama `react-example`.
- `.env.example` conserva `GEMINI_API_KEY` y `APP_URL` de esa plantilla.
- La tienda pública tiene problemas de contraste que detecta axe (insignia blanca sobre `#ff2056` de 10 px, y `text-zinc-500` sobre fondo oscuro). No son del trabajo nuevo.

## 10. Primeros pasos para quien llega

1. `git status` para ver los 70 archivos sin commit. Pregunta al usuario antes de hacer commit.
2. `npm install` y luego `npm run lint` y `npm run build`.
3. Lee `supabase/LEEME.md`, que está escrito para el usuario no técnico.
4. Antes de afirmar que la BD está lista, comprueba con la clave anon (solo lectura): `GET <URL>/rest/v1/leaks?select=id&limit=1`.
5. Para cambios al panel, vuelve a correr las pruebas de la sección 7: están en carpetas temporales, así que confirma primero que siguen ahí.
