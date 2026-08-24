-- Los modales de "Nueva solicitud" y "Nuevo compromiso" (fuera del flujo de la ronda) permiten
-- elegir la ronda de inspección pero no guardaban una empresa propia del ítem: se agrega para
-- que quede explícita en el registro, independiente de la empresa de la ronda enlazada.
alter table solicitudes_compra_item add column empresa text;
alter table compromisos_ronda add column empresa text;
