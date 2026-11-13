// AI-assisted: see docs/AI_LOG.md #22, #23, #24, #25, #26, #28, #29
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../constants/paymentMethods';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { db } from './index';

// Los estados en los que el viaje sigue abierto para el conductor: en marcha (accepted, driver_arriving,
// in_progress) o terminado pero sin cobrar (completed). Mientras esté en uno de ellos se muestra la pantalla del
// viaje o, en completed, el resumen del cobro. Al pasar a paid (o cancelled) el viaje se cierra.
export const ACTIVE_STATUSES = [
  TRIP_STATUS.ACCEPTED,
  TRIP_STATUS.DRIVER_ARRIVING,
  TRIP_STATUS.IN_PROGRESS,
  TRIP_STATUS.COMPLETED,
];

// CONCEPTO: el viaje es un documento en trips/{id} y su campo status dice en qué paso va. El pasajero
// (hoy el simulador) y el conductor no se hablan: los dos leen y escriben ese mismo documento.

// Las fechas llegan como Timestamp de Firestore (o null un instante, mientras el servidor las escribe). Se
// agregan también en milisegundos (createdAtMs, completedAtMs, paidAtMs), que son más fáciles de comparar.
const toMs = (timestamp) => timestamp?.toMillis?.() ?? null;
const toTrip = (tripDoc) => {
  const data = tripDoc.data();
  return {
    id: tripDoc.id,
    ...data,
    createdAtMs: toMs(data.createdAt),
    completedAtMs: toMs(data.completedAt),
    paidAtMs: toMs(data.paidAt),
  };
};

// Las solicitudes que se le ofrecen a este conductor: viajes en estado "requested" cuyo candidateDriverId
// es su uid. Dos filtros de igualdad no necesitan índice compuesto; por eso el orden se hace en el hook.
export function subscribeToTripRequests(uid, onData, onError) {
  const requests = query(
    collection(db, 'trips'),
    where('candidateDriverId', '==', uid),
    where('status', '==', TRIP_STATUS.REQUESTED),
  );
  return onSnapshot(requests, (snapshot) => onData(snapshot.docs.map(toTrip)), onError);
}

// Todos los viajes de este conductor, del más reciente al más antiguo. Un solo filtro de igualdad no necesita
// índice; el orden se hace aquí. Lo usan Ganancias (los cobrados) e Historial (los cerrados).
export function subscribeToDriverTrips(uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'trips'), where('driverId', '==', uid)),
    (snapshot) => onData(snapshot.docs.map(toTrip).sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0))),
    onError,
  );
}

// Un solo viaje por su id (para el detalle del Historial), o null si no existe.
export async function fetchTrip(tripId) {
  const snapshot = await getDoc(doc(db, 'trips', tripId));
  return snapshot.exists() ? toTrip(snapshot) : null;
}

// Guarda en el viaje la ruta recorrida (ya reducida, ver utils/route.js) para dibujarla después en el detalle del
// Historial sin volver a pedirla a OSRM: el enunciado pide dibujar "la ruta guardada" con Polyline y cuidar las
// consultas. Es una escritura simple, no un cambio de estado.
export function saveTripRoute(tripId, route) {
  return updateDoc(doc(db, 'trips', tripId), { route });
}

// Cuántos viajes trae cada página del Historial (el enunciado sugiere 20).
export const HISTORY_PAGE_SIZE = 20;

// CONCEPTO: paginación con cursor. En vez de traer todos los viajes, se piden de 20 en 20: la primera página sin
// cursor y las siguientes con startAfter(cursor), que continúa justo después del último documento recibido.
// El cursor es el DOCUMENTO y no solo su fecha: si dos viajes terminaron en el mismo instante, la fecha sola
// podría saltarse uno o repetirlo.
//   uid           conductor dueño de los viajes
//   fromMs, toMs  rango de completedAt (toMs NO inclusivo); null = sin límite
//   paymentMethod 'cash' | 'mercadopago' | null (todos)
// Ordena por completedAt (del más reciente al más antiguo). Efecto buscado: un viaje cancelado no tiene
// completedAt y Firestore deja fuera de una consulta ordenada los documentos sin ese campo, así que el
// Historial solo muestra viajes que se hicieron (completed y paid). Si algún día un cancelado trajera
// completedAt, aparecería aquí sin avisar. Los completed sin cobrar sí salen, con su estado de pago.
// Necesita dos índices compuestos: driverId + completedAt, y driverId + paymentMethod + completedAt.
// Devuelve { trips, cursor, hasMore }: hasMore es false cuando la página vino incompleta (no quedan más).
export async function fetchTripHistoryPage(uid, { fromMs = null, toMs = null, paymentMethod = null, cursor = null }) {
  const constraints = [where('driverId', '==', uid)];
  if (paymentMethod) constraints.push(where('paymentMethod', '==', paymentMethod));
  if (fromMs !== null) constraints.push(where('completedAt', '>=', Timestamp.fromMillis(fromMs)));
  if (toMs !== null) constraints.push(where('completedAt', '<', Timestamp.fromMillis(toMs)));
  constraints.push(orderBy('completedAt', 'desc'));
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(HISTORY_PAGE_SIZE));

  const snapshot = await getDocs(query(collection(db, 'trips'), ...constraints));
  return {
    trips: snapshot.docs.map(toTrip),
    cursor: snapshot.docs[snapshot.docs.length - 1] ?? cursor,
    hasMore: snapshot.size === HISTORY_PAGE_SIZE,
  };
}

const activeTripsQuery = (uid) =>
  query(collection(db, 'trips'), where('driverId', '==', uid), where('status', 'in', ACTIVE_STATUSES));

// El viaje que el conductor tiene abierto: suyo (driverId) y todavía sin cerrar. Entrega el viaje o null.
// Así, si cierra la app a mitad de camino, al abrirla vuelve a su viaje. Un filtro de igualdad más uno "in"
// sobre campos distintos tampoco necesita índice compuesto.
export function subscribeToActiveTrip(uid, onData, onError) {
  return onSnapshot(
    activeTripsQuery(uid),
    (snapshot) => onData(snapshot.empty ? null : toTrip(snapshot.docs[0])),
    onError,
  );
}

// CONCEPTO: transacción. Lee el viaje y lo cambia solo si sigue en uno de los estados de partida (from).
// Así, si el tiempo se vence justo cuando el conductor toca Aceptar (o el pasajero cancela a la vez), una de
// las dos acciones gana y la otra no pisa a la primera. Devuelve true si el cambio se hizo y false si el
// viaje ya no estaba en ese estado. isAllowed (opcional) es una condición extra sobre los datos del viaje.
async function moveTrip(tripId, from, changes, isAllowed = () => true) {
  const tripRef = doc(db, 'trips', tripId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists() || !from.includes(snapshot.data().status) || !isAllowed(snapshot.data())) return false;
    transaction.update(tripRef, changes);
    return true;
  });
}

// El conductor acepta: el viaje pasa a "accepted" y desde ese momento es suyo (driverId).
// Un conductor no puede llevar dos viajes a la vez: si ya tiene uno en marcha, no se acepta otro y devuelve
// false. (Esta revisión va antes de la transacción, no dentro: Firestore no permite consultas en transacciones.)
export async function acceptTrip(tripId, uid) {
  const active = await getDocs(activeTripsQuery(uid));
  if (!active.empty) return false;
  return moveTrip(tripId, [TRIP_STATUS.REQUESTED], {
    status: TRIP_STATUS.ACCEPTED,
    driverId: uid,
    acceptedAt: serverTimestamp(),
  });
}

// El conductor rechaza, o se venció el tiempo de la tarjeta: el viaje pasa a "rejected".
export function rejectTrip(tripId) {
  return moveTrip(tripId, [TRIP_STATUS.REQUESTED], {
    status: TRIP_STATUS.REJECTED,
    rejectedAt: serverTimestamp(),
  });
}

// El conductor sale hacia el punto de recogida.
export function startDriverArriving(tripId) {
  return moveTrip(tripId, [TRIP_STATUS.ACCEPTED], { status: TRIP_STATUS.DRIVER_ARRIVING });
}

// El pasajero sube al carro: el viaje pasa a "in_progress" y la ruta cambia hacia el destino.
export function pickUpPassenger(tripId) {
  return moveTrip(tripId, [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING], {
    status: TRIP_STATUS.IN_PROGRESS,
    startedAt: serverTimestamp(),
  });
}

// El conductor finaliza el viaje: pasa a "completed" y se guardan la tarifa, la comisión y la ganancia neta,
// junto con el porcentaje de comisión que se aplicó (si mañana cambia, el historial no se altera). El estado
// del pago arranca en "efectivo" si se cobra en mano o en "pendiente" si falta la confirmación de la pasarela.
export function completeTrip(tripId, { fare, commission, driverEarnings, commissionRate, paymentMethod }) {
  return moveTrip(tripId, [TRIP_STATUS.IN_PROGRESS], {
    status: TRIP_STATUS.COMPLETED,
    fare,
    commission,
    driverEarnings,
    commissionRate,
    paymentStatus: paymentMethod === PAYMENT_METHODS.CASH ? PAYMENT_STATUS.CASH : PAYMENT_STATUS.PENDING,
    completedAt: serverTimestamp(),
  });
}

// El cobro quedó resuelto: el viaje pasa a "paid" y se cierra. Solo se permite si el dinero está cobrado:
// en efectivo (el conductor confirma que lo recibió) o con el pago de Mercado Pago aprobado.
export function markTripPaid(tripId) {
  return moveTrip(
    tripId,
    [TRIP_STATUS.COMPLETED],
    { status: TRIP_STATUS.PAID, paidAt: serverTimestamp() },
    (trip) => trip.paymentMethod === PAYMENT_METHODS.CASH || trip.paymentStatus === PAYMENT_STATUS.APPROVED,
  );
}

// Si el pago con Mercado Pago está pendiente o fue rechazado, el conductor puede cobrar en efectivo: el método
// pasa a efectivo y el resumen cambia solo a esa variante. Si el pago ya está aprobado no se permite, para no
// cobrarle dos veces al pasajero.
export function switchToCash(tripId) {
  return moveTrip(
    tripId,
    [TRIP_STATUS.COMPLETED],
    { paymentMethod: PAYMENT_METHODS.CASH, paymentStatus: PAYMENT_STATUS.CASH },
    (trip) => trip.paymentMethod !== PAYMENT_METHODS.CASH && trip.paymentStatus !== PAYMENT_STATUS.APPROVED,
  );
}

// Cancelar solo se puede antes de que el pasajero suba (el enunciado: "antes de in_progress").
export function cancelTrip(tripId) {
  return moveTrip(tripId, [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING], {
    status: TRIP_STATUS.CANCELLED,
    cancelledBy: 'driver',
    cancelledAt: serverTimestamp(),
  });
}
