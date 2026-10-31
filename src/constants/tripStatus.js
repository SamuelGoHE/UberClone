// CONCEPTO: el campo status del viaje controla qué pantalla se muestra.
export const TRIP_STATUS = {
  REQUESTED: 'requested', // el pasajero solicitó el viaje
  ACCEPTED: 'accepted', // el conductor aceptó
  DRIVER_ARRIVING: 'driver_arriving', // el conductor va hacia el punto de recogida
  IN_PROGRESS: 'in_progress', // el pasajero está a bordo
  COMPLETED: 'completed', // el viaje terminó y se calcularon tarifa, comisión y ganancia
  PAID: 'paid', // el pago fue confirmado por la pasarela o registrado en efectivo
  CANCELLED: 'cancelled', // cancelado por cualquiera de las partes antes de in_progress
  REJECTED: 'rejected', // el conductor rechazó o se venció el tiempo y no quedan más conductores
};
