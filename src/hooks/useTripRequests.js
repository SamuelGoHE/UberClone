import { useEffect, useState } from 'react';
import { subscribeToTripRequests } from '../services/firebase/trips';
import { selectPendingRequests } from '../utils/tripRequests';

// CONCEPTO: custom hook de las solicitudes entrantes. Mientras enabled sea true (el conductor está
// disponible) mantiene abierta la suscripción a Firestore y entrega:
//   request: la solicitud que toca atender ahora (la más antigua vigente) o null,
//   queued:  cuántas más esperan detrás.
// Al pasar a No disponible o al cerrar la pantalla, la función de limpieza cancela la suscripción.
export default function useTripRequests(uid, enabled) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setRequests([]);
      return undefined;
    }
    setError(null);
    return subscribeToTripRequests(
      uid,
      (trips) => setRequests(selectPendingRequests(trips)),
      () => setError('No pudimos revisar las solicitudes. Revisa tu conexión.'),
    );
  }, [uid, enabled]);

  return { request: requests[0] ?? null, queued: Math.max(0, requests.length - 1), error };
}
