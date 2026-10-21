-- ============================================================================
-- PASO 13 · Endurecimiento de seguridad (cierra todo lo que no sea público a propósito)
--
-- Requiere haber ejecutado antes el paso 3. Es seguro ejecutarlo más de una vez: no borra datos.
--
-- Antes de empezar, una aclaración importante:
--   La clave «anon» que se ve en «Inspeccionar» es PÚBLICA a propósito (toda web con Supabase la muestra).
--   No se puede ocultar. Lo que sí se puede (y esto hace) es que esa clave NO pueda leer ni hacer
--   nada que no sea público. Ese es el verdadero escudo contra los atacantes.
--
-- Qué hace:
--   A. Lo que se cree desde hoy NACE CERRADO: tablas, funciones y secuencias nuevas ya no quedan
--      abiertas por defecto a la clave pública ni a las cuentas con sesión (Supabase las abre solo).
--   B. Enciende las reglas de acceso (RLS) en cualquier tabla de «public» que no las tuviera.
--   C. Quita permisos peligrosos: la clave pública no puede escribir ni vaciar nada; nadie puede
--      vaciar tablas por la API; las tablas privadas (equipo, compradores, ventas, costos, visitas,
--      historial, papelera y soporte) ya no responden ni siquiera «vacío» a la clave pública.
--   D. Funciones: solo se pueden llamar las que la web usa. El resto queda cerrado.
--   E. Las vistas (si algún día hay) respetan las reglas de quien las consulta.
--   F. Al final muestra un informe: «ATENCIÓN» = algo por revisar, «INFO» = lo público (previsto).
--
-- Qué NO hace (se hace en el panel de Supabase, no con SQL): ver la lista al final de este archivo.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Resultado esperado: una tabla con la fila «OK · Sin hallazgos de atención» y varias filas «INFO».
-- ============================================================================

do $$
begin
  if to_regclass('public.staff') is null then
    raise exception 'Primero ejecuta supabase/03-catalogo-y-panel.sql (este paso se apoya en las tablas y los roles del paso 3).';
  end if;
end $$;

-- ---------- A. Lo nuevo nace cerrado ----------
-- Desde ahora, cada tabla o función nueva necesita un «grant» explícito para abrirse a alguien
-- (los archivos 03 al 12 ya lo hacen; si creas tablas a mano, da los permisos tú).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges revoke execute on functions from public;

-- ---------- B. Reglas de acceso (RLS) encendidas en todas las tablas ----------
-- Con RLS encendida y sin ninguna regla, la tabla queda cerrada para todos. Es lo más seguro por defecto.
do $$
declare r record;
begin
  for r in
    select c.oid::regclass as t, c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
       and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
  loop
    execute format('alter table %s enable row level security', r.t);
    raise notice 'Se encendieron las reglas de acceso (RLS) en la tabla %', r.relname;
  end loop;
end $$;

-- ---------- C. Permisos peligrosos fuera ----------
-- Vaciar una tabla (TRUNCATE) no pasa por las reglas de acceso: nadie debe tener ese permiso por la API.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
-- La clave pública solo LEE lo público; jamás escribe.
revoke insert, update, delete on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- Tablas privadas: la clave pública no tiene ningún permiso (ni siquiera ve que existen filas).
do $$
declare t text;
begin
  foreach t in array array['staff', 'buyers', 'customers', 'sales', 'product_costs', 'events', 'audit_log', 'trash', 'support_cases']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke all on public.%I from anon', t);
    end if;
  end loop;
end $$;

-- ---------- D. Funciones: solo las que la web usa ----------
-- Se cierran TODAS las funciones de «public» (menos las de extensiones) y se vuelven a abrir las previstas.
-- Las funciones de disparador (triggers) no necesitan permiso para ejecutarse: siguen funcionando.
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as f
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prokind in ('f', 'p')
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.f);
  end loop;
end $$;

do $$
declare x record;
begin
  for x in
    select * from (values
      -- las usan las reglas de acceso de las tablas: deben poder llamarlas todos
      ('public.is_admin()',                                        'anon, authenticated'),
      ('public.is_dev()',                                          'anon, authenticated'),
      ('public.my_vendor_id()',                                    'anon, authenticated'),
      -- visitas y clics (la web la llama sin sesión; no guarda IP)
      ('public.track_event(text, text, text, text, text, text)',   'anon, authenticated'),
      -- solo con sesión del equipo (la propia función revisa el rol)
      ('public.traffic_report(integer, text)',                     'authenticated'),
      ('public.restore_from_trash(bigint)',                        'authenticated'),
      ('public.trash_delete_forever(bigint)',                      'authenticated'),
      ('public.export_backup()',                                   'authenticated'),
      ('public.restore_backup(jsonb)',                             'authenticated')
    ) as v(f, roles)
  loop
    if to_regprocedure(x.f) is not null then
      execute format('grant execute on function %s to %s', x.f, x.roles);
    end if;
  end loop;
end $$;

-- ---------- E. Vistas que respetan las reglas de quien consulta ----------
do $$
declare r record;
begin
  if current_setting('server_version_num')::int >= 150000 then
    for r in
      select c.oid::regclass as v
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'v'
         and coalesce(c.reloptions::text, '') not like '%security_invoker=true%'
         and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
    loop
      execute format('alter view %s set (security_invoker = true)', r.v);
    end loop;
  end if;
end $$;

notify pgrst, 'reload schema';

-- ---------- F. Informe ----------
select nivel, tema, detalle
from (
  select 'ATENCIÓN'::text as nivel, 'Tabla sin reglas de acceso (RLS)'::text as tema, c.relname::text as detalle
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
     and not exists (select 1 from pg_depend d where d.objid = c.oid and d.deptype = 'e')
  union all
  select 'ATENCIÓN', 'La clave pública puede escribir o vaciar', c.relname::text || ' (' || p || ')'
    from pg_class c join pg_namespace n on n.oid = c.relnamespace, unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) p
   where n.nspname = 'public' and c.relkind in ('r', 'p') and has_table_privilege('anon', c.oid, p)
  union all
  select 'ATENCIÓN', 'Una cuenta con sesión puede vaciar la tabla (TRUNCATE)', c.relname::text
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p') and has_table_privilege('authenticated', c.oid, 'TRUNCATE')
  union all
  select 'ATENCIÓN', 'La clave pública puede ejecutar una función no prevista', p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prokind in ('f', 'p') and has_function_privilege('anon', p.oid, 'execute')
     and p.proname not in ('is_admin', 'is_dev', 'my_vendor_id', 'track_event')
     and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  union all
  select 'ATENCIÓN', 'Función con permisos elevados sin «search_path» fijo', p.oid::regprocedure::text
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosecdef
     and not exists (select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) s where s like 'search_path=%')
  union all
  select 'ATENCIÓN', 'Vista que se salta las reglas de acceso', c.relname::text
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'v' and coalesce(c.reloptions::text, '') not like '%security_invoker=true%'
  union all
  select 'INFO', 'La clave pública puede LEER (previsto: es lo que muestra la web)', c.relname::text
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p', 'v') and has_table_privilege('anon', c.oid, 'SELECT')
  union all
  select 'INFO', 'Carpeta de archivos pública (cualquiera puede ver sus archivos)', b.id::text
    from storage.buckets b where b.public
  union all
  select 'OK', 'Sin hallazgos de atención', ''
   where not exists (
     select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p') and (not c.relrowsecurity
        or has_table_privilege('anon', c.oid, 'INSERT') or has_table_privilege('anon', c.oid, 'UPDATE')
        or has_table_privilege('anon', c.oid, 'DELETE') or has_table_privilege('anon', c.oid, 'TRUNCATE')
        or has_table_privilege('authenticated', c.oid, 'TRUNCATE'))
   )
) informe
order by case nivel when 'ATENCIÓN' then 1 when 'OK' then 2 else 3 end, tema, detalle;

-- ============================================================================
-- Lo que SQL no puede hacer: revisa esto en el panel de Supabase
--   1. Authentication → Sign In / Providers → Email → enciende «Confirm email» (necesita SMTP).
--   2. Authentication → Rate Limits: deja los límites activos (evita que alguien cree miles de cuentas).
--   3. Authentication → Attack Protection → CAPTCHA (Cloudflare Turnstile): NO lo enciendas todavía. La web aún no envía el token del CAPTCHA
--      y, encendido, fallarían TODOS los registros y los ingresos (también el del equipo). Primero hay que agregarlo a la web.
--   4. Project Settings → API → «Max rows»: déjalo en 1000 (el valor por defecto). La web pide las ventas y los clientes de 1000 en 1000:
--      si lo bajas, solo se cargarían las primeras filas, sin ningún aviso.
--   5. Project Settings → API Keys: si la clave secreta/service_role se mostró alguna vez, créala de nuevo.
--   6. Authentication → Providers: apaga los proveedores que no uses (hoy solo Email y Google).
--   7. Database → Backups: revisa si tu plan incluye copias automáticas (además de la copia del panel).
--   8. (Opcional, no es seguridad) Google muestra «Ir a <tu-proyecto>.supabase.co» al elegir cuenta, en vez del nombre de la web.
--      Es normal mientras la marca no esté verificada en Google Cloud (Centro de verificación) o no uses un dominio propio en Supabase.
-- ============================================================================
