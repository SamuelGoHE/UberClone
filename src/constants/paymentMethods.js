// CONCEPTO: método con el que el pasajero paga el viaje. El de Mercado Pago lo confirma la pasarela;
// el de efectivo lo registra el conductor al final del viaje.
export const PAYMENT_METHODS = {
  MERCADO_PAGO: 'mercadopago',
  CASH: 'cash',
};

export const PAYMENT_LABELS = {
  mercadopago: 'Mercado Pago',
  cash: 'Efectivo',
};

// Estado del pago de un viaje terminado (campo paymentStatus). Los cuatro corresponden a las variantes de la
// pantalla de resumen: Aprobado, Pendiente y Rechazado los escribirá el backend de Mercado Pago; Efectivo, la app.
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CASH: 'cash',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};
