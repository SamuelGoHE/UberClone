import { useEffect, useRef, useState } from 'react';
import { getRoute } from '../services/maps/osrm';

// CONCEPTO: custom hook de la ruta de un tramo. Pide la ruta a OSRM UNA vez por tramo, no con cada movimiento
// del GPS: el servicio es gratuito y compartido, y el enunciado recomienda cuidar las consultas.
//   routeKey: identifica el tramo (por ejemplo "id-del-viaje:pickup"); al cambiar, se pide otra ruta.
//   from:     { lat, lng } de salida. Se usa el valor que haya cuando llega por primera vez en ese tramo.
//   to:       { lat, lng } de llegada.
// Devuelve { route, error }. route = { distanceKm, durationMin, coordinates } o null mientras carga.
// Si OSRM falla, error trae el mensaje y la pantalla dibuja una línea recta en su lugar.
export default function useRoute(routeKey, from, to) {
  const [state, setState] = useState({ key: null, route: null, error: null });
  const fromRef = useRef(from);
  const toRef = useRef(to);
  fromRef.current = from;
  toRef.current = to;
  const hasFrom = Boolean(from);

  useEffect(() => {
    // Sin punto de salida todavía (el GPS no ha respondido) no hay nada que pedir.
    if (!hasFrom) return undefined;
    let cancelled = false;
    getRoute(fromRef.current, toRef.current)
      .then((route) => {
        if (!cancelled) setState({ key: routeKey, route, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ key: routeKey, route: null, error: error.message });
      });
    // Si el tramo cambia mientras la petición viaja, su respuesta se descarta.
    return () => {
      cancelled = true;
    };
  }, [routeKey, hasFrom]);

  // Una respuesta de otro tramo no se muestra en este.
  return state.key === routeKey ? { route: state.route, error: state.error } : { route: null, error: null };
}
