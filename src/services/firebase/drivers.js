import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './index';

// CONCEPTO: onSnapshot deja una suscripción abierta que avisa cada vez que el documento cambia
// (por ejemplo, si el estado pasa de pending a approved). Devuelve la función para cancelarla:
// quien la use debe llamarla en la limpieza de su useEffect, o la suscripción queda viva.
export function subscribeToDriver(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'drivers', uid),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  );
}
