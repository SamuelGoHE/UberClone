// AI-assisted: see docs/AI_LOG.md #6, #17, #20, #30
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { EDITABLE_FIELDS } from '../../utils/profile';
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

// Marca al conductor como disponible o no. Cambia pocas veces, por eso vive en drivers/{uid}.
// (La ubicación, que cambia cada pocos segundos, va aparte: ver locations.js.)
export function setDriverAvailability(uid, isAvailable) {
  return updateDoc(doc(db, 'drivers', uid), { isAvailable });
}

// CONCEPTO: el conductor solo puede cambiar campos concretos de su perfil. Se actualizan por nombre (rutas con punto
// para lo anidado, como 'vehicle.color') y NO se escribe un objeto completo: así nunca se pisa por accidente
// status, isAvailable ni createdAt. Si llega un campo que no esté en la lista de editables, se rechaza antes de
// escribir. Cada cambio guarda updatedAt. Cuando se endurezcan las reglas de Firestore, también deben impedir
// que un conductor modifique su propio status.
export function updateDriverProfile(uid, updates) {
  const forbidden = Object.keys(updates).filter((field) => !EDITABLE_FIELDS.includes(field));
  if (forbidden.length > 0) throw new Error(`Campos que no se pueden editar: ${forbidden.join(', ')}`);
  return updateDoc(doc(db, 'drivers', uid), { ...updates, updatedAt: serverTimestamp() });
}
