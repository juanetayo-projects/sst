-- El modulo "inspecciones" (Nueva Inspeccion + Historial juntos) se separa en dos modulos
-- independientes: 'nueva-inspeccion' e 'historial'. Migra las filas existentes preservando el
-- acceso actual del usuario que ya tenia 'inspecciones' configurado.
insert into permisos_modulo (profile_id, modulo)
select profile_id, 'nueva-inspeccion' from permisos_modulo where modulo = 'inspecciones'
union all
select profile_id, 'historial' from permisos_modulo where modulo = 'inspecciones';

delete from permisos_modulo where modulo = 'inspecciones';
