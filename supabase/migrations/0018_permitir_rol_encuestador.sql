-- profiles_role_check nunca incluyo 'encuestador', aunque la app ya lo usa como rol real
-- (ve/oculta Informe Ejecutivo, gestiona encuestas). Cualquier intento de crear un usuario con ese
-- rol fallaba silenciosamente al insertar el perfil, dejando un usuario de auth.users huerfano.
alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check check (role = any (array['admin','inspector','encuestador']));
