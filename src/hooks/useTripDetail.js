import { useEffect, useState } from 'react';
import { fetchTrip } from '../services/firebase/trips';

// Carga un viaje por su id para la pantalla de detalle. Devuelve { trip, loading, error }. Si el viaje no existe,
// trip es null y no hay error. La bandera cancelled evita actualizar el estado si la pantalla se cierra mientras
// la consulta todavía viaja.
export default function useTripDetail(tripId) {
  const [state, setState] = useState({ trip: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ trip: null, loading: true, error: null });
    fetchTrip(tripId)
      .then((trip) => {
        if (!cancelled) setState({ trip, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) setState({ trip: null, loading: false, error: 'No pudimos cargar el viaje. Revisa tu conexión.' });
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return state;
}
