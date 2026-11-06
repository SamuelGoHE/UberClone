import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
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

// Guarda el registro del conductor en drivers/{uid}. El id del documento es el uid de la cuenta, así
// cada conductor tiene un solo documento. serverTimestamp() pone la fecha desde el servidor.
// Cuando el documento existe, la app lo detecta sola (subscribeToDriver) y pasa a "En revisión".
export function saveDriverRegistration(uid, record) {
  return setDoc(doc(db, 'drivers', uid), { ...record, createdAt: serverTimestamp() });
}
