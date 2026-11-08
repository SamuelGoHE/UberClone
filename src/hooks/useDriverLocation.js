import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { shouldEmit, toCoords } from '../utils/location';

// CONCEPTO: custom hook. Agrupa en un solo lugar todo lo relacionado con la ubicación del conductor:
//   1. pide el permiso al abrir y vuelve a revisarlo al regresar de Ajustes,
//   2. obtiene la posición actual (para mostrarla en el mapa),
//   3. mientras active sea true, sigue la posición y avisa con onLocation cada minIntervalMs.
// Cuando active pasa a false (No disponible) o la pantalla se cierra, la función de limpieza del
// useEffect cancela el seguimiento: es lo que pide el enunciado.
export default function useDriverLocation({ active, onLocation, minIntervalMs = 5000 }) {
  const [permission, setPermission] = useState('unknown'); // 'unknown' | 'granted' | 'denied'
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const onLocationRef = useRef(onLocation);
  const lastEmitRef = useRef(null);

  // Siempre se llama a la versión más reciente de onLocation, sin reiniciar el seguimiento por ello.
  useEffect(() => {
    onLocationRef.current = onLocation;
  });

  // 1. Pedir el permiso al abrir la pantalla.
  useEffect(() => {
    let cancelled = false;
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (!cancelled) setPermission(status === 'granted' ? 'granted' : 'denied');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Si el conductor activa el permiso desde Ajustes y vuelve a la app, se revisa de nuevo.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermission(status === 'granted' ? 'granted' : 'denied');
    });
    return () => subscription.remove();
  }, []);

  // 2. Con permiso, obtener la posición actual una vez.
  useEffect(() => {
    if (permission !== 'granted') return undefined;
    let cancelled = false;
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((position) => {
        if (!cancelled) setLocation(toCoords(position));
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos obtener tu ubicación.');
      });
    return () => {
      cancelled = true;
    };
  }, [permission]);

  // 3. Seguimiento: solo mientras el conductor está disponible.
  useEffect(() => {
    if (!active || permission !== 'granted') return undefined;
    let cancelled = false;
    let subscription = null;

    Location.watchPositionAsync(
      // distanceInterval 0: no se filtra por distancia, así el GPS informa aunque el celular esté quieto.
      // timeInterval solo lo respeta Android; en iPhone el límite lo pone shouldEmit.
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 0, timeInterval: minIntervalMs },
      (position) => {
        const coords = toCoords(position);
        setLocation(coords);
        const now = Date.now();
        if (shouldEmit(lastEmitRef.current, now, minIntervalMs)) {
          lastEmitRef.current = now;
          onLocationRef.current?.(coords);
        }
      },
    )
      .then((sub) => {
        // Si el efecto ya se limpió mientras se creaba la suscripción, se cancela de inmediato.
        if (cancelled) sub.remove();
        else subscription = sub;
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos seguir tu ubicación.');
      });

    // Función de limpieza: se ejecuta al pasar a No disponible o al salir de la pantalla.
    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
      lastEmitRef.current = null;
    };
  }, [active, permission, minIntervalMs]);

  return { location, permission, error };
}
