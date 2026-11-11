import { useEffect, useState } from 'react';
import { subscribeToDriverTrips } from '../services/firebase/trips';

// CONCEPTO: custom hook de los viajes del conductor, en tiempo real. Mantiene abierta la suscripción mientras la
// pantalla esté abierta y la cancela en la limpieza del useEffect. Devuelve { trips, loading, error }.
export default function useDriverTrips(uid) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    return subscribeToDriverTrips(
      uid,
      (data) => {
        setTrips(data);
        setLoading(false);
      },
      () => {
        setError('No pudimos cargar tus viajes. Revisa tu conexión.');
        setLoading(false);
      },
    );
  }, [uid]);

  return { trips, loading, error };
}
