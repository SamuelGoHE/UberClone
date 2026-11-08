import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { db } from './index';

// CONCEPTO: el viaje es un documento en trips/{id} y su campo status dice en qué paso va. El pasajero
// (hoy el simulador) y el conductor no se hablan: los dos leen y escriben ese mismo documento.

// Las solicitudes que se le ofrecen a este conductor: viajes en estado "requested" cuyo candidateDriverId
// es su uid. Dos filtros de igualdad no necesitan índice compuesto; por eso el orden se hace en el hook.
export function subscribeToTripRequests(uid, onData, onError) {
  const requests = query(
    collection(db, 'trips'),
    where('candidateDriverId', '==', uid),
    where('status', '==', TRIP_STATUS.REQUESTED),
  );
  return onSnapshot(
    requests,
    (snapshot) => {
      onData(
        snapshot.docs.map((tripDoc) => {
          const data = tripDoc.data();
          // createdAt llega como Timestamp de Firestore (o null un instante, mientras el servidor lo escribe).
          return { id: tripDoc.id, ...data, createdAtMs: data.createdAt?.toMillis?.() ?? null };
        }),
      );
    },
    onError,
  );
}

// CONCEPTO: transacción. Lee el viaje y lo cambia solo si sigue en "requested". Así, si el tiempo se vence
// justo cuando el conductor toca Aceptar (o llega de otro lado), una de las dos acciones gana y la otra
// no pisa a la primera. Devuelve true si el cambio se hizo y false si la solicitud ya no estaba disponible.
async function moveFromRequested(tripId, changes) {
  const tripRef = doc(db, 'trips', tripId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists() || snapshot.data().status !== TRIP_STATUS.REQUESTED) return false;
    transaction.update(tripRef, changes);
    return true;
  });
}

// El conductor acepta: el viaje pasa a "accepted" y desde ese momento es suyo (driverId).
export function acceptTrip(tripId, uid) {
  return moveFromRequested(tripId, {
    status: TRIP_STATUS.ACCEPTED,
    driverId: uid,
    acceptedAt: serverTimestamp(),
  });
}

// El conductor rechaza, o se venció el tiempo de la tarjeta: el viaje pasa a "rejected".
export function rejectTrip(tripId) {
  return moveFromRequested(tripId, {
    status: TRIP_STATUS.REJECTED,
    rejectedAt: serverTimestamp(),
  });
}
