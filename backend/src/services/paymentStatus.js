// Mercado Pago tiene muchos estados de pago; la app solo distingue tres. Función pura, fácil de probar.
//   approved                                    -> approved (pagado)
//   rejected, cancelled, refunded, charged_back -> rejected (no hay dinero)
//   cualquier otro (pending, in_process,
//   authorized, in_mediation…)                  -> pending (falta la confirmación)
const REJECTED = ['rejected', 'cancelled', 'refunded', 'charged_back'];

export function mapPaymentStatus(gatewayStatus) {
  if (gatewayStatus === 'approved') return 'approved';
  if (REJECTED.includes(gatewayStatus)) return 'rejected';
  return 'pending';
}
