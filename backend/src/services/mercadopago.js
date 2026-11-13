// AI-assisted: see docs/AI_LOG.md #27
import { config } from '../config.js';

const API = 'https://api.mercadopago.com';
// Si Mercado Pago no responde en este tiempo, se corta y se avisa: sin límite, una caída de la pasarela dejaría
// colgada la petición de la app para siempre.
const TIMEOUT_MS = 15000;

// Error de la pasarela: el servidor lo traduce a una respuesta 502 (la pasarela falló, no el cliente).
export class GatewayError extends Error {}

async function mpFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${config.mercadoPagoToken}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new GatewayError(
      error.name === 'TimeoutError' ? 'Mercado Pago tardó demasiado en responder.' : 'No se pudo conectar con Mercado Pago.',
    );
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new GatewayError(`Mercado Pago respondió ${response.status}: ${body.message ?? 'error'}`);
  return body;
}

// CONCEPTO: Checkout Pro. El backend crea una "preferencia" (qué se cobra y a quién) y Mercado Pago devuelve
// una dirección (init_point) donde el pasajero paga. external_reference amarra el pago al viaje: así, después,
// se puede preguntar "¿qué pasó con el pago de este viaje?".
export async function createPreference({ externalReference, title, amount }) {
  const returnUrl = `${config.publicUrl}/payments/return`;
  const preference = await mpFetch('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: externalReference, title, quantity: 1, currency_id: 'COP', unit_price: amount }],
      external_reference: externalReference,
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
    }),
  });
  return { id: preference.id, url: preference.init_point };
}

// El pago que decide el estado de una referencia, o null si el pasajero todavía no ha pagado nada.
// CONCEPTO: un mismo cobro puede recibir varios intentos (una tarjeta rechazada y luego otra aprobada, o al
// revés). Si alguno está aprobado, el viaje ya está pagado, aunque después haya un intento rechazado; si no,
// manda el más reciente.
export async function findDecisivePayment(externalReference) {
  const query = new URLSearchParams({
    external_reference: externalReference,
    sort: 'date_created',
    criteria: 'desc',
    limit: '20',
  });
  const { results = [] } = await mpFetch(`/v1/payments/search?${query}`);
  return results.find((payment) => payment.status === 'approved') ?? results[0] ?? null;
}
