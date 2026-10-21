-- ============================================================================
-- PASO 5 · Crear las cuentas del EQUIPO (DEV y ADMIN)  — plantilla
--
-- Requiere haber ejecutado antes el paso 3 (crea los roles y la tabla staff).
--
-- Cómo usarla:
--   1. Copia este archivo con otro nombre (p. ej. 05-crear-cuentas.local.sql: los *.local.sql NO se suben a git).
--   2. En la lista de abajo cambia CAMBIA-ESTA-CLAVE por la clave real de cada persona.
--   3. Pégalo en Supabase > SQL Editor > New query > Run.
--
-- Qué hace por cada fila de la lista:
--   · Crea la cuenta en Authentication (ya confirmada) con la clave indicada, guardada cifrada (bcrypt).
--   · La da de alta en staff con su rol:  dev = todo + ver equipo y compradores · admin = gestionar el contenido.
--   · Quien inicia sesión en  /#ironcat  escribe su USUARIO (p. ej. @Tin9o) y su clave: la web arma el correo interno solo.
--
-- Notas:
--   · Las filas con CAMBIA-ESTA-CLAVE se omiten (no se crea nada).
--   · Si la cuenta ya existe NO se cambia su clave (por si la cambió desde el panel). Para forzarlo: restablecer := true.
--   · El correo interno (usuario@equipo.descuentos-peru.invalid) no recibe mensajes: el equipo NO usa "olvidé mi contraseña";
--     si alguien la pierde, se restablece aquí (restablecer := true) o en Authentication > Users.
--   · El dominio debe coincidir con STAFF_EMAIL_DOMAIN en src/lib/roles.ts.
--   · Los compradores NO se crean aquí: se registran solos desde la web.
--   · Para DAR DE BAJA a alguien (pierde el acceso al instante) mira el final de este archivo.
-- ============================================================================

do $$
declare
  dominio     constant text    := 'equipo.descuentos-peru.invalid';
  restablecer constant boolean := false;
  c       record;
  uid     uuid;
  mail    text;
  tokens  text;
  hecho   int := 0;
begin
  for c in
    select * from (values
      --  usuario       rol      tienda (vendor_id)  nombre público    clave
      ('Tin9o',      'dev',   'vendedor-tino',   'Tin9o',        'CAMBIA-ESTA-CLAVE'),
      ('whiskyper',  'admin', 'vendedor-whisky', 'Whisky Perú',  'CAMBIA-ESTA-CLAVE'),
      ('AbbysPeru',  'admin', 'vendedor-abby',   'Abbys Perú',   'CAMBIA-ESTA-CLAVE'),
      ('elnanovip',  'admin', 'vendedor-nano',   'El Nano VIP',  'CAMBIA-ESTA-CLAVE')
    ) as t(usuario, rol, tienda, nombre, clave)
  loop
    if c.clave = 'CAMBIA-ESTA-CLAVE' then
      raise notice 'Se omite @%: falta escribir su clave en la lista.', c.usuario;
      continue;
    end if;
    if char_length(c.clave) < 6 then
      raise exception 'La clave de @% es demasiado corta (mínimo 6 caracteres; se recomiendan 10 o más).', c.usuario;
    end if;

    mail := lower(c.usuario) || '@' || dominio;
    select id into uid from auth.users where lower(email) = mail;

    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail,
        extensions.crypt(c.clave, extensions.gen_salt('bf', 10)), now(),
        '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
      );
      insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(), uid, uid::text, 'email',
        jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true, 'phone_verified', false),
        now(), now(), now()
      );
      -- El servicio de acceso no tolera NULL en estos campos de texto: se dejan vacíos si existen en tu versión.
      select string_agg(format('%1$I = coalesce(%1$I, '''')', column_name), ', ') into tokens
      from information_schema.columns
      where table_schema = 'auth' and table_name = 'users'
        and column_name in ('confirmation_token', 'recovery_token', 'email_change', 'email_change_token_new',
                            'email_change_token_current', 'phone_change', 'phone_change_token', 'reauthentication_token');
      if tokens is not null then
        execute format('update auth.users set %s where id = $1', tokens) using uid;
      end if;
    elsif restablecer then
      update auth.users
      set encrypted_password = extensions.crypt(c.clave, extensions.gen_salt('bf', 10)), updated_at = now()
      where id = uid;
    end if;

    insert into public.staff (user_id, role, vendor_id, display_name, username, active)
    values (uid, c.rol, c.tienda, c.nombre, c.usuario, true)
    on conflict (user_id) do update
      set role = excluded.role, vendor_id = excluded.vendor_id, display_name = excluded.display_name,
          username = excluded.username, active = true;
    hecho := hecho + 1;
  end loop;

  -- El equipo no es "comprador": se quita la ficha de comprador que crea el sistema al registrar una cuenta.
  delete from public.buyers where user_id in (select user_id from public.staff);
  raise notice 'Cuentas del equipo procesadas: %', hecho;
end $$;

-- Comprobación: cuentas con acceso al panel.
select s.username as usuario, s.role as rol, s.vendor_id as tienda, s.display_name as nombre, s.active as activa
from public.staff s
order by case s.role when 'dev' then 0 when 'admin' then 1 else 2 end, s.username;

-- ---------------------------------------------------------------------------
-- Para DAR DE BAJA a alguien sin borrar su cuenta (pierde el acceso al instante):
--   update public.staff set active = false where lower(username) = lower('NombreDeUsuario');
-- Para volver a darle acceso:
--   update public.staff set active = true  where lower(username) = lower('NombreDeUsuario');
-- Para cambiar un rol:
--   update public.staff set role = 'admin' where lower(username) = lower('NombreDeUsuario');   -- dev | admin | vendor
-- ---------------------------------------------------------------------------
