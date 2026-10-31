// CONCEPTO: estado de la cuenta del conductor. Un conductor nuevo queda en pending y no puede
// ponerse Disponible hasta que alguien cambie el campo status a approved en la base de datos.
export const DRIVER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
};
