// AI-assisted: see docs/AI_LOG.md #20
// CONCEPTO: la app NUNCA habla directamente con Mercado Pago ni conoce su token secreto: le pide al backend (la
// carpeta backend/, que corre en el computador) que haga el cobro. Este servicio es el único lugar de la app que
// conoce las direcciones del backend; el resto de la app solo llama createPayment y refreshPayment.
const TIMEOUT_MS = 20000;

// Error de pagos con un mensaje listo para mostrarle al conductor.
export class PaymentsError extends Error {}

async function post(path, body) {
  const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new PaymentsError('Falta EXPO_PUBLIC_BACKEND_URL en el .env de la app.');

  // fetch no tiene tiempo límite propio: sin esto, un backend apagado dejaría la pantalla esperando sin fin.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new PaymentsError(
      'No pudimos conectar con el servidor de pagos. Revisa que el backend esté encendido y que el celular esté en la misma Wi-Fi.',
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new PaymentsError(data.error ?? 'El servidor de pagos respondió con un error.');
  return data;
}

// Crea el cobro del viaje en Mercado Pago. Devuelve { url, preferenceId }: url es la página donde el pasajero paga.
export const createPayment = (tripId) => post('/payments', { tripId });

// Le pide al backend que consulte el resultado del pago y lo guarde en el viaje. Devuelve { paymentStatus, paymentId }.
export const refreshPayment = (tripId) => post(`/payments/${tripId}/refresh`);
