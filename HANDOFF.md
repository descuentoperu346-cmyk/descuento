# Traspaso del proyecto — Descuentos Perú

> Escrito el 2026-10-21 y puesto al día el 2026-10-23 para la persona (o la sesión de Claude) que continúe el proyecto.
> No contiene claves ni contraseñas, y no debe contenerlas nunca.

## 1. Qué es y cómo está hoy

Web de **Descuentos Perú**: catálogo de productos y servicios digitales con descuento (Streaming, Educación, Investigación…), tiendas de vendedores, la revista **Leaks** (artículos de investigación) con fichas de figuras públicas, y un **panel interno oculto** en `https://<dominio>/#ironcat` para el equipo.

| Tema | Estado |
|---|---|
| Hosting | Vercel, desde el repo `descuentoperu346-cmyk/descuento`, rama `main`. |
| Último commit | `18c8415` (2026-10-22: páginas legales, casillas obligatorias con constancia y Libro de Reclamaciones), más el commit de HANDOFF que lo sigue. **Local: el usuario hace el `git push`.** Ya subido a GitHub (`origin/main` en `54a501e`): `0d1022b` (olvidé mi contraseña, ingresar con código, cambiar correo, código de seguridad y las 3 plantillas con código en `plantillas-correo/volver-a-pegar/`). Antes: `1772370` (despedida al cerrar sesión y «Ir al panel» solo para el equipo), `17a3052` (mensajes claros si Supabase rechaza contraseña o correo), `0338ed9` (confirmar con código de 6 dígitos y 13 plantillas de correo), `6eff928` (HANDOFF), `725aef8` (CAPTCHA Turnstile, SQL 13, banner del equipo, contador del Leak #3, carrusel, barra lateral, selector de perfil solo DEV). Antes: `a917dac` (panel de ventas, ganancias y soporte, login con Google, política de privacidad, roles). El `git push` lo hace el usuario en su terminal: desde la sesión de Claude Git no puede pedir credenciales. |
| Web publicada | `https://descuentos-peru.vercel.app` (política en `/privacidad`, términos en `/terminos`). Vercel tiene `VITE_CONTENT_SUPABASE_URL` y `VITE_CONTENT_SUPABASE_ANON_KEY` como tipo Config. |
| Google | **Activo** (2026-10-21): app publicada en Google Cloud (proyecto `descuentos-peru`), cliente OAuth "Descuentos Peru Web", Google encendido en Supabase. El botón abre Google y el flujo completo funciona (ver Pendientes, punto 2). |
| Commits | **Nunca hagas commit ni push sin que el usuario lo pida.** Todo lo hecho hasta `18c8415` está en commit; lo posterior queda sin commit hasta que el usuario lo pida. |
| Base de datos | Supabase, proyecto `ncqegvituteypivmfyoo`. SQL 01–15 ya ejecutados por el usuario (el 14 y el 15 los confirmó el 2026-10-23; ver sección 4). |
| Verificación | Las pruebas automáticas usan una base **imitada** (stub y PGlite). Contra lo real se probaron a mano (2026-10-21 y 22): lectura con la clave anon, Google, CAPTCHA y el envío de correo por SMTP; Confirm email figura encendido. El usuario confirmó el 2026-10-23 que hizo la prueba de punta a punta del registro con código por correo y que pegó las plantillas en Supabase; también dijo que probó con el real los otros flujos con código (olvidé contraseña, entrar con código, cambiar correo, código de seguridad), sin reportar fallos. |

## 2. Cómo trabajar con el usuario

- Escribe en **español**, con palabras simples y respuestas cortas. No es técnico.
- Da avisos breves de avance; se impacienta con silencios largos. Comandos pequeños, de uno en uno.
- Informa con honestidad: si algo falla o no se pudo probar, dilo.
- **Decisiones ya tomadas (no las discutas de nuevo):**
  - Los SQL se ejecutan **uno por uno**. No quiere un instalador de un solo archivo.
  - Papelera: para todos los roles; los vendedores solo ven sus productos.
  - Historial de cambios y copia de seguridad: **solo DEV**.
  - Login con Google: **solo compradores**, nunca el equipo.
  - Commit y push solo cuando el usuario lo pida (lo ha pedido varias veces; el `git push` siempre lo hace él).
  - Correos de Supabase: solo texto, sin imágenes; lema «El Perú necesita una voz. Una voz unida.»; contacto de Telegram `@Tin9o`.
- Yo (Claude) **nunca ejecuto SQL en su Supabase** ni pido claves `service_role` / secret.

## 3. Arquitectura

- **React 19 + Vite 8 + Tailwind v4 + TypeScript.** Todo el contenido sale de Supabase **directo desde el navegador**, protegido con RLS. En Vercel solo se publica `dist/` (SPA con rewrite a `index.html`).
- **Rutas por hash:** `#/servicios`, `#/leaks`, `#/nosotros`, `#/contacto`, `#/privacidad`, `#/terminos`, `#/reclamaciones` (con las direcciones cortas `/privacidad`, `/terminos` y `/reclamaciones`), `#/tienda/<id>`, `#/leaks/figura/<id>`, y el panel `#ironcat` (`src/lib/panelRoute.ts`). Páginas en `src/pages/`; la raíz es `src/App.tsx`.
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
- `src/lib/`: `supabaseBrowser.ts` (cliente, flujo PKCE, Google), `panelAuth.ts` + `roles.ts` (login del equipo), `accountStore.ts` (compradores), `salesStore/Api/Math`, `costsStore` + `gainsMath`, `supportStore` + `supportLogic`, `complaintsStore` + `complaintsLogic` (Libro de Reclamaciones: formulario público, panel y reglas; la página pública es `src/pages/ComplaintsPage.tsx` y la del panel `src/components/panel/ComplaintsAdminPage.tsx`), `legal.ts` (versión de los textos y datos del proveedor `PROVIDER`), `messageTemplates`, `vaultApi` (papelera, historial, copia), `trafficApi` + `analytics`, `leaksDb`, `api`, `contentEnv`, `clipboard`.
- `supabase/`: los SQL y `LEEME.md`, la guía paso a paso del usuario (Partes A–K), y `plantillas-correo/` (13 correos de Supabase y `generar-plantillas.cjs`).
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
| `14-aceptacion-de-terminos.sql` | `consent_log`: constancia de las dos casillas (fecha puesta por la base, versión de los textos, cómo entró: `signup`/`login`/`code`/`google`). Insert solo a nombre propio, lee cada quien lo suyo y ADMIN/DEV todo, nadie edita ni borra (se borra al eliminar la cuenta). Requiere 03. Probado en PGlite (`consent-test.cjs`, 32/32, y junto con el 13). Además se agregó `consent_log` a la lista de tablas privadas del 13. | **Ejecutado** (confirmado por el usuario el 2026-10-23). La web guarda la constancia sola; si la tabla no existe, igual entra y no la guarda (`recordConsent` en `supabaseBrowser.ts`). |
| `15-libro-de-reclamaciones.sql` | `complaints` (hojas del Libro de Reclamaciones) + `submit_complaint(jsonb)` (única puerta para registrar, abierta a `anon`; valida todo y limita 5 por correo/24 h y 100/hora) + `complaints_add_business_days` (interna, 15 días hábiles sin descontar feriados). Lee y responde solo ADMIN/DEV (únicas columnas editables: `status`, `response`); nadie borra; la fecha de respuesta la pone un trigger. Requiere 03. Se agregó `complaints` a las tablas privadas del 13 y `submit_complaint` a su lista blanca de funciones. Probado en PGlite (`complaints-test.cjs`, 80/80, y junto con el 13: `hardening-test.cjs` 54/54). | **Ejecutado** (confirmado por el usuario el 2026-10-23). Sin la tabla, el formulario avisa y pide escribir al correo; el panel dice «Falta activar el Libro de reclamaciones». |

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
| Libro de reclamaciones (`reclamaciones`) | **solo ADMIN y DEV** (grupo Administración; el vendedor no la ve ni pide las hojas) | 15 |
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
- **Compradores:** registro con correo (se confirma con un código de 6 dígitos que llega por correo), o **"Continuar con Google"** (PKCE, redirección completa). El botón se ve **siempre** en "Ya tengo cuenta" y "Crear cuenta"; al tocarlo se pregunta `GET /auth/v1/settings` y, si Google no está activo, muestra un aviso en vez de mandar a una página de error de Supabase.
- **Configuración de Google (la hace el usuario, una vez):**
  - Google Cloud: pantalla de consentimiento publicada, origen JS = la web, redirect URI = la "Callback URL" de Supabase.
  - El **Client Secret se pega solo en Supabase** (Authentication → Providers → Google). Nunca en archivos, chat ni variables `VITE_`.
  - Supabase → URL Configuration: Site URL y Redirect URLs con `/**`.
  - **"Confirm email" está encendido** (2026-10-22), con código de 6 dígitos y SMTP propio (Pendientes, punto 6). Evita que alguien se registre con el correo de otra persona.
  - Pasos completos: `supabase/LEEME.md`, Parte F.
- **Correos con código (compradores), agregados el 2026-10-22 (commit `0d1022b`) y probados por el usuario con el Supabase real el 2026-10-23, con las plantillas ya pegadas y sin reportar fallos** (antes solo con base imitada, 55/55 en Chrome real; la parte con CAPTCHA activo no se pudo probar entonces porque no cargó el widget de Cloudflare):
  - **«¿Olvidaste tu contraseña?»** (vistas `forgot` → `confirm` con `codeKind='recovery'` → `newpass` de `AuthModal`): `buyerRequestPasswordReset`, `buyerVerifyRecoveryCode` (`verifyOtp` tipo `recovery`, abre sesión) y `buyerSetNewPassword` (`updateUser`). Si la contraseña nueva falla, la sesión ya está abierta y se puede reintentar.
  - **«Entrar con un código por correo»** (vista `otp` → `confirm` con `codeKind='login'`): `buyerRequestLoginCode` (`signInWithOtp` con `shouldCreateUser: false`; `otp_disabled` se trata como enviado para no revelar quién tiene cuenta) y `buyerVerifyCode(..., 'email')`.
  - **Mi cuenta → «Cambiar correo»** (`EmailChange.tsx`): `buyerRequestEmailChange` (`updateUser({email})`) y `buyerConfirmEmailChange` (`verifyOtp` tipo `email_change` con el código del correo actual y/o el del nuevo; lo que cuenta es el estado final leído con `getUser()`). **Era lo más incierto** (cómo reparte Supabase los dos códigos con «Secure email change» estaba armado de la documentación); el usuario lo probó con el real el 2026-10-23 sin reportar fallos. Si algún día falla, probar con ese interruptor apagado (llega un solo código).
  - **Código de seguridad** (`PasswordChange.tsx`): si `updateUser({password})` responde `reauthentication_needed`, se llama `reauthenticate()` (correo «Reauthentication») y se pide el código aquí mismo (`nonce`). `panelChangePassword` ahora devuelve `{ error, needsReauth? }` (antes un texto o null). Con cuentas del equipo (`.invalid`) avisa que cierren sesión y vuelvan a entrar.
  - Los correos de aviso de seguridad (7, todos encendidos) los manda Supabase solos. Duda sin probar: qué hace Supabase cuando el aviso «Password changed» va a un correo `.invalid` del equipo (¿falla el cambio de clave?). Probar una vez con la cuenta DEV; si falla, apagar ese interruptor.
  - Con CAPTCHA activo, los pedidos de código llevan el token (`resetPasswordForEmail`, `signInWithOtp`, `resend`); `verifyOtp`, `updateUser` y `reauthenticate` no lo llevan.
- **Cerrar sesión (comprador):** la ventana de cuenta muestra una despedida «¡Hasta pronto! Gracias por visitarnos» (vista `bye` de `AuthModal`; se cierra sola a los 6 s; botones «Seguir navegando» y «Volver a ingresar»). El botón «Ir al panel» de esa ventana solo aparece para cuentas del equipo con sesión (`kind === 'staff'`); antes salía unos segundos al cerrar sesión porque la ventana quedaba abierta sin cuenta. Si el usuario quiere, se puede quitar también para el equipo (entrarían solo por `#ironcat`).

## 7. Pruebas — y un riesgo

Las pruebas viven **fuera del repo**, en carpetas temporales que se pueden borrar:
- `C:\Users\USUARIO\AppData\Local\Temp\claude\d--descuentos-per-\1db10d52-2b10-4865-88c6-ccd40f80ae6e\scratchpad\`
  - Chrome real con Supabase imitado (`supabase-full-stub.cjs` + `content.json`): `e2e-panel-new` 57, `e2e-sales` 95, `e2e-modules` 138, `e2e-vault` 86, `e2e-google` 26, `e2e-growth` 84, `e2e-heading` 76, y las más viejas `e2e-db` 34, `e2e-roles` 43, `e2e-leaks`, `e2e-panel`.
  - Lógica: `forms-test.ts` (142), con `npx --no-install tsx`.
- `%TEMP%\pglite-test\`: reglas SQL en PGlite (`rls`, `roles`, `sales`, `events`, `vault`, `growth`, `local-accounts`, `staff-template`).
- `%TEMP%\axe-test\`: axe-core para accesibilidad (WCAG 2.0/2.1 A y AA).

Último resultado: `tsc` sin errores y `npm run build` correcto. Pruebas nuevas del 2026-10-22: `e2e-codes.cjs` (55/55; olvidé contraseña, código de acceso, cambiar correo y código de seguridad) con `stub-codes.cjs` (copia del imitador con esos endpoints), en `C:\Users\USUARIO\AppData\Local\Temp\claude\d--descuentos-per-\97f69dc5-d5fa-4179-bfe9-88a14a2f8105\scratchpad\`. **Pruebas viejas que ya no cuadran con la web** (no son fallos nuevos; se comprobó contra un checkout limpio de `1772370`): Pruebas nuevas del Libro de Reclamaciones: `e2e-libro.cjs` (70/70; formulario, hoja imprimible, panel, sin el SQL 15) con `stub-codes.cjs` ampliado (`patch-complaints.cjs` agrega `submit_complaint` y `complaints` al generador `make-stub-codes.cjs`), y `%TEMP%\pglite-test\complaints-test.cjs` (80/80); `e2e-legal.cjs` 24/24 y `e2e-codes.cjs` 83/83 siguen en verde. `e2e-roles` falla 6 (selector de tienda ahora solo DEV, y el registro con confirmar correo ahora pide código en vez de «revisa tu correo») y `e2e-google` falla 1 («Google apagado: NO aparece el botón»; el botón ahora se ve siempre). `e2e-db` se actualizó a la nueva forma de `panelChangePassword`. A veces una prueba falla sola por arranque lento de Vite: repetirla. Los scripts tienen rutas escritas a mano (puertos y carpeta del scratchpad). Para no perderlos, hay que moverlos al repo y ajustar esas rutas. **No lo he hecho** porque nadie me lo pidió.

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
- **PowerShell:** `node script.js | Select-Object -First N` cierra la tubería y corta el proceso a medias (un generador dejó solo el primer archivo). No uses `-First` con comandos que escriben archivos.
- **Comprobar texto en el sitio publicado:** la ventana de cuenta es un fragmento perezoso (`assets/AuthModal-*.js`); no está dentro de `index-*.js`.
- **Ver un correo en ancho de celular:** Chrome sin cabeza no baja de unos 500 px de ventana; pon el correo dentro de un `iframe` de 360 px. Para ver las animaciones hay que usar `--virtual-time-budget`. No hay script de vista previa en el repo: se reemplazan `{{ .Token }}`, `{{ .SiteURL }}` y demás por datos de ejemplo.

## 9. Pendientes

**Del usuario:**
1. (Hecho) Los SQL 06 → 12 ya están en la base real (verificado 2026-10-21), y el 13 también.
2. (Hecho el 2026-10-21) Google probado de punta a punta: una cuenta creada con Google entró a la web y aparece en "Equipo y compradores". Comprobado también que esa cuenta NO entra al panel (`#ironcat` le muestra el login del equipo). El cliente OAuth repetido "Descuentos Perú web" en Google Cloud ya lo borró el usuario (2026-10-22); el que se usa es "Descuentos Peru Web".
3. (Hecho) `VITE_CONTENT_*` en Vercel.
4. Cambiar el número de pago de ejemplo `999 888 777` (el Resumen avisa cuando un método o una tienda todavía lo usa). **El usuario dijo el 2026-10-22 que puede esperar.**
5. (Hecho: el equipo ya cambió la contraseña compartida, 2026-10-22.) Cómo se hace: cada persona la cambia ella misma en el panel (menú de la cuenta, arriba a la derecha → **Mi perfil y datos** → "Nueva contraseña", mínimo 10 caracteres). Usa `auth.updateUser` de Supabase con la sesión abierta; no se probó contra el Supabase real (solo con base imitada). **No vuelvas a ejecutar `05-crear-cuentas.local.sql`**: reinicia las claves de las cuentas a las del archivo y borraría los cambios. No hay "Olvidé mi contraseña" para el equipo (los correos internos `.invalid` no reciben mensajes): si alguien la olvida, el DEV la restablece desde Supabase.
6. **Confirmar el correo con código de 6 dígitos: ENCENDIDO** (comprobado el 2026-10-22 con `GET /auth/v1/settings`: `mailer_autoconfirm: false`). La web con la vista de código está publicada (`0338ed9`; `buyerVerifyCode` / `buyerResendCode` en `supabaseBrowser.ts` y la vista `confirm` de `AuthModal`; pasos en `supabase/LEEME.md` Parte J). SMTP propio: Gmail aparte con contraseña de aplicación (se probó con una invitación y el correo llegó). **Hecho** (confirmado por el usuario el 2026-10-23): probó el registro de punta a punta y las plantillas están pegadas. El primer intento del usuario creó la cuenta sin pedir código: al revisar, Supabase ya tenía Confirm email encendido y la web publicada ya traía la vista de código, así que lo más probable es que probó antes de activarlo; **la causa no se confirmó**. Si vuelve a pasar, pedir una captura. Borrar las cuentas de prueba en Authentication → Users. Si algo falla, apagar Confirm email y todo vuelve a como estaba.
   - **Contraseña o correo rechazados al registrarse:** los decide Supabase (Authentication → Sign In / Providers → Email: largo mínimo, requisitos de caracteres y "Prevent use of leaked passwords"; los correos inventados o sin buzón se rechazan). Desde `17a3052` la web muestra el motivo real (`authErrorMessage` lee `weak_password.reasons`). No se conoce la regla exacta configurada: si el usuario sigue bloqueado, pedir captura de esa pantalla.
   - **Correos de Supabase (13 plantillas)** en `supabase/plantillas-correo/`, mismo diseño, solo texto y sin imágenes: lema "El Perú necesita una voz. Una voz unida.", estilo terminal, contacto de Telegram `@Tin9o`. `confirmar-registro.html` es la base; los otros 12 (invitación, magic link/OTP, cambiar correo, restablecer contraseña, reautenticación y 7 avisos de seguridad) los genera `generar-plantillas.cjs` (`node supabase/plantillas-correo/generar-plantillas.cjs`; reescribe esos 12 y no toca la base). Tienen animaciones suaves que solo reproducen Apple Mail e iPhone (en Gmail y Outlook se ven quietas y completas; respetan "reducir movimiento") y el texto apagado tiene contraste reforzado. Tabla archivo → asunto en `LEEME.md` Parte K. Se pegan a mano en Supabase. Hoy la web solo usa "Confirm sign up"; los 7 avisos de seguridad necesitan además su interruptor y llevan la dirección de la web fija (`https://descuentos-peru.vercel.app`) porque Supabase no confirma `{{ .SiteURL }}` ahí. Las variables `{{ .Provider }}`, `{{ .FactorType }}`, `{{ .OldPhone }}`, `{{ .Phone }}` y `{{ .OldEmail }}` salen de la documentación de Supabase y no se probaron con correos reales. Desde 2026-10-22 «Reset password», «Change email address», «Magic link or OTP» y «Reauthentication» **sí los usa la web** y funcionan con **código de 6 dígitos** (no enlace); sus plantillas se regeneraron y mejoraron (pasos «cómo hacerlo», vencimiento, aviso de seguridad) y ahora salen en `supabase/plantillas-correo/volver-a-pegar/` (las otras 10 + `confirmar-registro.html` siguen en la carpeta principal): «Reset password», «Change email address» y «Magic link or OTP» ya se volvieron a pegar en Supabase (confirmado por el usuario el 2026-10-23; ver `LEEME.md` Parte K y el punto de la sección 6). No se vieron en Outlook de escritorio ni en clientes reales: solo en Chrome.
   - Se instaló la skill `react-email` de Resend en el usuario (`~/.claude/skills/react-email`). Se usó solo como guía de reglas; los correos no se arman con React.
7. **Que Google muestre el nombre de la web y no `ncqegvituteypivmfyoo.supabase.co`.** Hoy la pantalla "Elige una cuenta" dice "Ir a ncqegvituteypivmfyoo.supabase.co" porque Google muestra la dirección de retorno (la de Supabase) mientras la marca de la app no esté verificada. No es un error ni un riesgo. Dos caminos: (a) verificar la marca en Google Cloud (Centro de verificación) comprobando `descuentos-peru.vercel.app` en Search Console con la etiqueta HTML; probablemente se atore porque `supabase.co` es otro dominio autorizado que no es del usuario y no se puede verificar; (b) comprar un dominio propio y usarlo como dominio de autenticación en Supabase (servicio de pago). Mientras tanto el inicio con Google funciona igual. Para (a) el pie ya tiene enlaces reales `<a href="/privacidad">` y `<a href="/terminos">` (hecho el 2026-10-22); falta la etiqueta de Search Console en `index.html` (el usuario debe dar la línea `<meta name="google-site-verification" …>`).
8. Seguridad en el panel de Supabase (el SQL 13 ya está ejecutado y dio "OK"): crear de nuevo la clave secreta si alguna vez se mostró y apagar proveedores que no se usan (Confirm email ya está encendido: punto 6). **CAPTCHA (Cloudflare Turnstile)**: la web ya lo soporta (`src/lib/captcha.ts`, `src/components/CaptchaWidget.tsx`; `AuthModal` y `PanelLogin` envían el `captchaToken` a `signUp` / `signInWithPassword`) y queda **inactivo mientras no exista `VITE_TURNSTILE_SITE_KEY`** (comprobado: sin la variable la llave no entra en el build). Orden obligatorio, en `supabase/LEEME.md` Parte I: (1) crear el widget en Cloudflare, (2) poner `VITE_TURNSTILE_SITE_KEY` en Vercel y redesplegar (el código nuevo debe estar subido), (3) recién entonces encender CAPTCHA en Supabase con la llave secreta. Encenderlo antes rompe todos los registros e ingresos, incluido el del equipo; si pasa, apagarlo en Supabase. El ingreso con Google no usa este CAPTCHA. **Estado (2026-10-21): CAPTCHA ya está ENCENDIDO en Supabase** (Authentication → Attack Protection, Cloudflare Turnstile, secret solo en Supabase; Site Key en Vercel como `VITE_TURNSTILE_SITE_KEY`). El usuario comprobó que la verificación aparece y que el ingreso funciona. Si algún día falla el ingreso, apagar "CAPTCHA protection" en Supabase. **Max rows: dejarlo en 1000**: `salesApi.ts` pide de 1000 en 1000 (`PAGE = 1000`) y corta al recibir menos de `PAGE`; con un máximo menor se cargarían solo las primeras filas sin aviso (si se quiere bajar, bajar antes `PAGE`; `costsStore` pide `limit(5000)`).

9. **Leak #3 (turistas israelíes en Pisac/Cusco).** El usuario dijo el 2026-10-22 que puede esperar; **pero el contador sigue corriendo**: si llega a cero sin artículo, los avisos dirán «LIBERADO» (ver Trampas conocidas). La fecha de la cuenta regresiva (1 nov 2026, 8 pm Lima) es provisional. Faltan: la fecha real de liberación, la cuenta y la fecha del reel, y el video original de Facebook. Con eso se escribe el artículo con etiquetas Documentado / Material recibido / Rumor, sin publicar caras de personas privadas, y se publica antes de que el contador llegue a cero. Solo material atribuido y etiquetado.
10. **Pagos** (puede esperar, dicho el 2026-10-22): el usuario enviará los números reales y los QR (sigue puesto `999 888 777`). Decidir si se cambian los textos del carrusel de pagos ("acreditación automática", "SSL 256-bit"), que no cuadran con que la web no procesa pagos.
11. **Revisión visual del usuario:** banner del equipo, carrusel de pagos, bloque rojo de Leaks y barra lateral personalizada.
12. **Páginas legales (2026-10-22, commit `18c8415`):** el usuario entregó el texto de la Política de Privacidad y de los Términos y Condiciones; están en `src/pages/PrivacyPage.tsx` y `TermsPage.tsx` (componente común `src/components/LegalDocument.tsx`), con rutas `#/privacidad` y `#/terminos` (y las direcciones cortas `/privacidad` y `/terminos`) y enlaces reales en el pie. El texto es **del usuario, tal cual**; lo único mío es el **«Anexo»** de la política (cuentas, ingreso con Google, Cloudflare Turnstile, visitas, borrado): Google exige que la política diga cómo se usan los datos de Google y el texto entregado no lo decía. Pendientes de esas páginas: (a) la cláusula 16 de los Términos ya enlaza al Libro de Reclamaciones (`LIBRO_RECLAMACIONES_URL` en `TermsPage.tsx` = `https://descuentos-peru.vercel.app/reclamaciones`; ver punto 13); (b) la fecha «22 de octubre de 2026» la puse yo (el texto traía `[FECHA]`); (c) el texto no se ha revisado con un abogado; (d) las **dos casillas** del usuario son obligatorias en la ventana de cuenta (`AuthModal`, componente `AcceptTerms`): «He leído y acepto los Términos y Condiciones y la Política de Privacidad de Descuentos Peru.» (`#auth-accept`) y «Acepto que el contenido de la venta no será divulgado, salvo respecto a leaks y reportes.» (`#auth-accept-secrecy`). Se exigen al *Crear cuenta*, al *Ingresar* con correo, al *Entrar con un código por correo* y antes de *Continuar con Google*; **no** se pide en «¿Olvidaste tu contraseña?» ni en el login del panel (`#ironcat`). Es una sola casilla que sirve para las dos pestañas, no se recuerda para la próxima vez y la constancia **sí se guarda en la base** (SQL 14, tabla `consent_log`) tras entrar: `recordConsent(context)` en `supabaseBrowser.ts`, llamada desde `AuthModal` (`saveConsent`) con `signup` (cuenta nueva, tras confirmar el código), `login`, `code`, y `google` (la marca se anota en `sessionStorage` antes de salir a Google y se guarda al volver, en `finishOAuthRedirect`). Nunca impide entrar. La versión sale de `src/lib/legal.ts` (`LEGAL_VERSION`/`LEGAL_UPDATED`: cámbialas junto con el texto). El «Anexo» de la política menciona esta constancia. **Límite:** la constancia la escribe la web con la sesión de la persona; quien llame a la API a mano se salta las casillas (no hay forma de exigirlas en el servidor para el registro con correo). Efecto en las pruebas: `e2e-roles` y `e2e-google` entran por la ventana de cuenta y ahora necesitan marcar `#auth-accept` y `#auth-accept-secrecy` antes de enviar (`e2e-codes.cjs` ya lo hace, 83/83, incluida la constancia en los 4 modos de entrar y el caso «sin el SQL 14»). Dominio propio sigue sin hacer (ver punto 7). **Comprar exige cuenta** (`REQUIRE_ACCOUNT_TO_BUY = true` en `accountStore.ts`, con la base conectada), así que las casillas cubren a todo comprador que use la web con normalidad.
13. **Libro de Reclamaciones virtual (2026-10-22, commit `18c8415`).** Página pública `#/reclamaciones` (`/reclamaciones`), enlazada desde el pie y desde la cláusula 16 de los Términos; no pide cuenta. Formulario con los datos de la hoja oficial (D.S. 011-2011-PCM): reclamo o queja, consumidor (nombre, documento, domicilio, teléfono, correo; representante si es menor), bien contratado (producto/servicio, descripción, monto opcional, pedido), detalle, pedido, medio de respuesta y casilla de conformidad (en el libro virtual reemplaza la firma). Al enviar muestra la **hoja** con número, fecha/hora de Lima y plazo, para imprimir o guardar en PDF (CSS de impresión: solo la hoja, negro sobre blanco). Guarda con `submit_complaint` (SQL 15); campo trampa (honeypot) contra programas automáticos. Panel: Administración → «Libro de reclamaciones» (solo ADMIN/DEV, con el número de pendientes en el menú): resumen (sin responder, vencen pronto ≤3 días, plazo vencido, respondidas), orden por fecha límite, búsqueda, «Ver la hoja completa», responder (el saludo ya viene escrito; no deja guardar solo el saludo), y botones «Correo» (mailto) y «WhatsApp» (+51 si son 9 cifras) con la respuesta lista. Plazo: **15 días hábiles** (Ley N.º 31435, D.S. 101-2022-PCM), calculado en la base sin descontar feriados. Pendientes: (a) el SQL 15 ya está ejecutado (confirmado por el usuario el 2026-10-23); (b) **completar `PROVIDER.ruc` y `PROVIDER.address` en `src/lib/legal.ts`** (la hoja los exige; mientras estén vacíos no se muestran y el panel avisa; `PROVIDER.holder` = «DescuentosPeru2», dicho por el usuario como titular, y no es un nombre legal completo: falta nombre completo/RUC/domicilio); (c) **la copia de la hoja por correo NO es automática**: la ley pide poder recibirla en el correo indicado y hoy no hay servidor que envíe correos; la hoja dice «escríbenos con tu número de hoja». Para hacerlo hace falta una función en el servidor (Supabase Edge Function + SMTP o Resend) con una clave que solo el usuario pega; (d) el Anexo de la política ya describe estos datos; (e) conservar las hojas: no hay ni habrá borrado desde la web; (f) no consta que el formulario se haya probado con el Supabase real (el SQL 15 sí está ejecutado); se probó con PGlite y Chrome con base imitada (`complaints-test.cjs` 80/80, `e2e-libro.cjs` 70/70).
14. **Revisión legal pendiente (opinión mía, no de un abogado, 2026-10-22):** marqué como problemáticas las cláusulas 13 de los Términos y 11 de la Política («no se puede denunciar ni demandar»: una renuncia anticipada a la tutela judicial/Indecopi no vale; Constitución art. 139.3, Código de Consumo art. 49), la 20 («no asume responsabilidad penal»: no se pacta), la 12 y 9 («no divulgar qué se vende»: no puede impedir reportar algo ilícito), la 15 («sin devoluciones ni garantías»: Código de Consumo arts. 18-19, garantías legales irrenunciables) y la 10 (prohibir decir a quién se pagó). Faltan: identidad y domicilio del titular (art. 18 Ley 29733), registro del banco de datos ante la Autoridad, RUC/comprobantes de pago, y actualizar el reglamento citado (creo que el D.S. 003-2013-JUS fue reemplazado por el D.S. 016-2024-JUS: verificar). Detalles menores: el art. 1542 del Código Civil no es «transacción» (arts. 1302 y ss.); la aceptación electrónica vale por el Código Civil art. 141, no por la Ley 27269; «no guardamos tu IP» no cubre los registros técnicos de Supabase/Vercel. El usuario **no ha decidido** si corregir los textos ni si llevarlos a un abogado. No se tocó ningún texto suyo salvo el Anexo y la cláusula 16 (enlace).

**Nuestros, sin construir (el usuario aún no eligió):**
- Stock de cuentas y perfiles (solo cantidades; sin guardar contraseñas de cuentas).
- Gastos (para ganancia neta real).
- Cupones y promociones.
- Anuncios y banners editables (hoy están en el código).
- 2FA para el equipo y "Olvidé mi contraseña" **del equipo** (sus correos internos `.invalid` no reciben mensajes; si la olvidan, el DEV la restablece desde Supabase). Para compradores "Olvidé mi contraseña" ya existe (ver sección 6).
- Cobros pendientes, comisiones por tienda, proveedores, reseñas, preguntas frecuentes.
- "Mis compras" para compradores: antes **no era seguro** (con "Confirm email" apagado se podía registrar el correo de otra persona); ahora que está encendido ya es viable, vinculando por correo confirmado. Sigue sin construirse.
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

1. `git status` y `git log -5` (el último commit es `18c8415` o el de HANDOFF que lo sigue; si `git status` muestra plantillas de correo «modificadas» sin cambios reales, son solo saltos de línea: ignóralas). Pregunta al usuario antes de hacer commit.
2. `npm install` y luego `npm run lint` y `npm run build`.
3. Lee `supabase/LEEME.md`, que está escrito para el usuario no técnico.
4. Antes de afirmar que la BD está lista, comprueba con la clave anon (solo lectura): `GET <URL>/rest/v1/leaks?select=id&limit=1`.
5. Para cambios al panel, vuelve a correr las pruebas de la sección 7: están en carpetas temporales, así que confirma primero que siguen ahí.
