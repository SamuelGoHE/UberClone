import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpError } from '../errors.js';
import { db } from '../services/firebase.js';
import { createPreference, findDecisivePayment } from '../services/mercadopago.js';
import { mapPaymentStatus } from '../services/paymentStatus.js';

const router = Router();

// Los ids de viaje que crea Firestore son letras y números; se rechaza cualquier otra cosa antes de usarlo
// como nombre de documento.
const TRIP_ID = /^[A-Za-z0-9_-]{1,128}$/;

async function loadTrip(tripId) {
  if (typeof tripId !== 'string' || !TRIP_ID.test(tripId)) throw new HttpError(400, 'tripId no es válido.');
  const ref = db.collection('trips').doc(tripId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new HttpError(404, 'El viaje no existe.');
  return { ref, trip: snapshot.data() };
}

// POST /payments  { tripId }  ->  { url, preferenceId }
// CONCEPTO: el monto NO lo manda la app: el backend lo lee del viaje en Firestore. Si la app pudiera decir
// cuánto cobrar, cualquiera podría cobrar $1 por un viaje de $19.200. El pasajero paga la tarifa más la propina.
// Cada intento de cobro usa una referencia nueva (viaje-1, viaje-2…): así, al reintentar después de un rechazo,
// el pago viejo no se confunde con el nuevo.
router.post('/payments', async (req, res) => {
  const { ref, trip } = await loadTrip(req.body?.tripId);
  if (trip.status !== 'completed') throw new HttpError(409, 'El viaje todavía no está finalizado.');
  if (trip.paymentMethod !== 'mercadopago') throw new HttpError(409, 'Este viaje no se cobra con Mercado Pago.');
  if (trip.paymentStatus === 'approved') throw new HttpError(409, 'Este viaje ya está pagado.');

  const amount = trip.fare + (trip.tip ?? 0);
  if (!Number.isInteger(amount) || amount <= 0) throw new HttpError(409, 'El viaje no tiene una tarifa válida.');

  const attempt = (trip.paymentAttempt ?? 0) + 1;
  const externalReference = `${ref.id}-${attempt}`;
  const preference = await createPreference({ externalReference, title: 'Viaje UberClone', amount });

  await ref.update({
    paymentStatus: 'pending',
    paymentPreferenceId: preference.id,
    paymentExternalReference: externalReference,
    paymentAttempt: attempt,
    paymentId: FieldValue.delete(),
  });
  res.json({ url: preference.url, preferenceId: preference.id });
});

// POST /payments/:tripId/refresh  ->  { paymentStatus, paymentId, gatewayStatus }
// CONCEPTO: sin webhook público, la app pregunta por el resultado ("Actualizar estado"). El backend consulta a
// Mercado Pago el pago de la referencia actual y guarda el resultado en el viaje; la app lo ve al instante
// porque escucha ese documento en tiempo real.
router.post('/payments/:tripId/refresh', async (req, res) => {
  const { ref, trip } = await loadTrip(req.params.tripId);
  const current = { paymentStatus: trip.paymentStatus ?? 'pending', paymentId: trip.paymentId ?? null, gatewayStatus: null };

  // Viaje en efectivo, sin cobro creado todavía o ya cerrado: no hay nada que consultar.
  if (trip.paymentMethod !== 'mercadopago' || !trip.paymentExternalReference || trip.status !== 'completed') {
    return res.json(current);
  }

  const payment = await findDecisivePayment(trip.paymentExternalReference);
  if (!payment) return res.json(current); // el pasajero todavía no ha pagado

  const paymentStatus = mapPaymentStatus(payment.status);
  const paymentId = String(payment.id);
  await ref.update({ paymentStatus, paymentId });
  res.json({ paymentStatus, paymentId, gatewayStatus: payment.status });
});

// GET /payments/return: a esta página llega el pasajero cuando Mercado Pago termina el pago. Solo le dice que
// vuelva a la app; el resultado real lo consulta la app con /refresh.
router.get('/payments/return', (req, res) => {
  res.type('html').send(
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Pago recibido</title></head>' +
      '<body style="font-family:-apple-system,sans-serif;text-align:center;padding:48px 24px">' +
      '<h2>Listo</h2><p>Ya puedes cerrar esta ventana y volver a la app.</p></body></html>',
  );
});

export default router;
