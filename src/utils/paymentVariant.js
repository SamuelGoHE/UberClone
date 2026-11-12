import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants/paymentMethods';

// Qué variante del resumen del cobro corresponde a un viaje: 'cash' | 'approved' | 'pending' | 'rejected'.
// El efectivo manda sobre cualquier otro dato: si se cobra en mano, no importa el estado que tuviera la pasarela.
// Un viaje de Mercado Pago sin estado todavía (por ejemplo, uno viejo) se considera pendiente.
export function getPaymentVariant(trip) {
  if (trip.paymentMethod === PAYMENT_METHODS.CASH) return PAYMENT_STATUS.CASH;
  if (trip.paymentStatus === PAYMENT_STATUS.APPROVED) return PAYMENT_STATUS.APPROVED;
  if (trip.paymentStatus === PAYMENT_STATUS.REJECTED) return PAYMENT_STATUS.REJECTED;
  return PAYMENT_STATUS.PENDING;
}
