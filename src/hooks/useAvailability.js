// AI-assisted: see docs/AI_LOG.md #20
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDriverAvailability } from '../services/firebase/drivers';

// La clave incluye el uid: si en el mismo celular entran dos conductores, cada uno conserva lo suyo.
const storageKey = (uid) => `uberclone.availability.${uid}`;

// CONCEPTO: custom hook de la disponibilidad. El último estado se guarda en AsyncStorage (el enunciado lo
// permite para preferencias como esta, nunca para datos sensibles) y se refleja en Firestore, donde lo
// leerán las solicitudes. Al abrir la pantalla se restaura el último estado.
export default function useAvailability(uid) {
  const [available, setAvailableState] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Al abrir: leer el último estado guardado y dejar la base de datos igual a él.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      let stored = false;
      try {
        stored = (await AsyncStorage.getItem(storageKey(uid))) === 'true';
      } catch {
        // Si no se puede leer, se empieza como No disponible: es el estado seguro.
      }
      if (cancelled) return;
      setAvailableState(stored);
      setReady(true);
      setDriverAvailability(uid, stored).catch(() => {});
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // CONCEPTO: se cambia el interruptor al instante y, si Firestore falla, se revierte y se avisa.
  const setAvailable = useCallback(
    async (next) => {
      setError(null);
      setAvailableState(next);
      try {
        await setDriverAvailability(uid, next);
        AsyncStorage.setItem(storageKey(uid), String(next)).catch(() => {});
      } catch {
        setAvailableState(!next);
        setError('No pudimos actualizar tu disponibilidad. Revisa tu conexión.');
      }
    },
    [uid],
  );

  return { available, ready, error, setAvailable };
}
