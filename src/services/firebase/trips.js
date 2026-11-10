import { collection, doc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { db } from './index';

// Los estados en los que el viaje sigue en marcha. En cualquiera de ellos se muestra la pantalla del viaje.
export const ACTIVE_STATUSES = [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.IN_PROGRESS];

// CONCEPTO: el viaje es un documento en trips/{id} y su campo status dice en qué paso va. El pasajero
// (hoy el simulador) y el conductor no se hablan: los dos leen y escriben ese mismo documento.

// createdAt llega como Timestamp de Firestore (o null un instante, mientras el servidor lo escribe).
const toTrip = (tripDoc) => {
  const data = tripDoc.data();
  return { id: tripDoc.id, ...data, createdAtMs: data.createdAt?.toMillis?.() ?? null };
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

const activeTripsQuery = (uid) =>
  query(collection(db, 'trips'), where('driverId', '==', uid), where('status', 'in', ACTIVE_STATUSES));

// El viaje que el conductor tiene en marcha: suyo (driverId) y todavía sin terminar. Entrega el viaje o null.
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
// viaje ya no estaba en ese estado.
async function moveTrip(tripId, from, changes) {
  const tripRef = doc(db, 'trips', tripId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists() || !from.includes(snapshot.data().status)) return false;
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
// junto con el porcentaje de comisión que se aplicó (si mañana cambia, el historial no se altera).
export function completeTrip(tripId, { fare, commission, driverEarnings, commissionRate }) {
  return moveTrip(tripId, [TRIP_STATUS.IN_PROGRESS], {
    status: TRIP_STATUS.COMPLETED,
    fare,
    commission,
    driverEarnings,
    commissionRate,
    completedAt: serverTimestamp(),
  });
}

// Cancelar solo se puede antes de que el pasajero suba (el enunciado: "antes de in_progress").
export function cancelTrip(tripId) {
  return moveTrip(tripId, [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING], {
    status: TRIP_STATUS.CANCELLED,
    cancelledBy: 'driver',
    cancelledAt: serverTimestamp(),
  });
}
