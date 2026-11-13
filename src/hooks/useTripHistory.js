// AI-assisted: see docs/AI_LOG.md #29
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchTripHistoryPage } from '../services/firebase/trips';
import { buildHistoryRange } from '../utils/historyFilters';

const EMPTY = { trips: [], hasMore: false, loading: false, loadingMore: false, refreshing: false, error: null };

// CONCEPTO: custom hook del historial paginado. A diferencia de Ganancias (que escucha todo en tiempo real), el
// Historial lee por páginas de 20: la primera al abrir o al cambiar un filtro, y las siguientes con loadMore
// cuando la lista llega al final.
//   filters: { period, paymentMethod, rangeFrom, rangeTo } (ver historyFilters.js)
// Devuelve { trips, loading, loadingMore, refreshing, error, hasMore, rangeReady, rangeError, loadMore, refresh }.
//
// Cambiar de filtro REINICIA todo: vacía la lista, olvida el cursor y descarta la respuesta de la consulta
// anterior. Eso último importa: si el conductor pasa de "Mes" a "Hoy" mientras la primera consulta todavía viaja,
// su respuesta llegaría después y se mezclaría con la nueva. Cada reinicio sube un número de "generación" y solo
// se aceptan respuestas de la generación vigente.
export default function useTripHistory(uid, { period, paymentMethod, rangeFrom, rangeTo }) {
  const range = useMemo(
    () => buildHistoryRange({ period, rangeFrom, rangeTo }),
    [period, rangeFrom, rangeTo],
  );
  const [state, setState] = useState(EMPTY);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const cursor = useRef(null);
  const hasMore = useRef(false);

  // reset = true: primera página (cursor nuevo). reset = false: la página que sigue. keep = true conserva la lista
  // visible mientras se recarga (deslizar para actualizar).
  const load = useCallback(
    async ({ reset, keep = false }) => {
      if (reset) {
        generation.current += 1;
        cursor.current = null;
        hasMore.current = false;
      } else if (inFlight.current || !hasMore.current) {
        return; // ya hay una página en camino o no quedan más
      }
      const mine = generation.current;
      inFlight.current = true;
      setState((prev) => ({
        ...prev,
        trips: reset && !keep ? [] : prev.trips,
        error: null,
        loading: reset && !keep,
        loadingMore: !reset,
        refreshing: reset && keep,
      }));

      try {
        const page = await fetchTripHistoryPage(uid, {
          fromMs: range.fromMs,
          toMs: range.toMs,
          paymentMethod,
          cursor: cursor.current,
        });
        if (mine !== generation.current) return; // respuesta de una consulta vieja: se descarta
        cursor.current = page.cursor;
        hasMore.current = page.hasMore;
        setState((prev) => ({
          trips: reset ? page.trips : [...prev.trips, ...page.trips],
          hasMore: page.hasMore,
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: null,
        }));
      } catch {
        if (mine !== generation.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: 'No pudimos cargar tu historial. Revisa tu conexión.',
        }));
      } finally {
        if (mine === generation.current) inFlight.current = false;
      }
    },
    [uid, range, paymentMethod],
  );

  // Al abrir y cada vez que cambia un filtro, load cambia: se reinicia. Con el rango incompleto no se consulta.
  useEffect(() => {
    if (!range.ready) {
      generation.current += 1; // por si había una consulta en camino del filtro anterior
      inFlight.current = false;
      setState(EMPTY);
      return;
    }
    load({ reset: true });
  }, [load, range.ready]);

  const loadMore = useCallback(() => load({ reset: false }), [load]);
  const refresh = useCallback(() => load({ reset: true, keep: true }), [load]);

  return { ...state, rangeReady: range.ready, rangeError: range.error, loadMore, refresh };
}
