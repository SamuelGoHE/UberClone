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
