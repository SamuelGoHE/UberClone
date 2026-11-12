import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DRIVER_STATUS } from '../constants/driverStatus';
import { subscribeToActiveTrip } from '../services/firebase/trips';
import { useAuth } from './AuthContext';

// CONCEPTO: Context del viaje activo. Comparte con toda la app el viaje que el conductor tiene abierto (en marcha
// o terminado y por cobrar; o null) y si todavía se está comprobando. Vive en Firestore, no en la memoria del celular: por eso, si el
// conductor cierra la app a mitad de camino, al abrirla el viaje sigue ahí. RootNavigator lo lee para decidir
// si muestra el Inicio, la pantalla del viaje o el resumen del cobro.
const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { user, driver } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [error, setError] = useState(null);
  // uid para el que ya llegó la primera respuesta de Firestore. Mientras no coincida con el uid actual, se
  // está cargando. Se calcula así (y no con un useState(true)) para no mostrar un instante el Inicio antes
  // de saber si hay un viaje.
  const [loadedUid, setLoadedUid] = useState(null);

  // Solo los conductores aprobados pueden tener viajes.
  const uid = user?.uid;
  const enabled = Boolean(uid) && driver?.status === DRIVER_STATUS.APPROVED;

  useEffect(() => {
    if (!enabled) return undefined;
    setError(null);
    const unsubscribe = subscribeToActiveTrip(
      uid,
      (trip) => {
        setActiveTrip(trip);
        setLoadedUid(uid);
      },
      () => {
        // Si no se puede leer, se sigue como si no hubiera viaje, pero se avisa.
        setActiveTrip(null);
        setError('No pudimos revisar tu viaje en curso. Revisa tu conexión.');
        setLoadedUid(uid);
      },
    );
    // Limpieza: al cerrar sesión o cambiar de conductor se cancela la suscripción y se olvida el viaje.
    return () => {
      unsubscribe();
      setActiveTrip(null);
      setLoadedUid(null);
    };
  }, [enabled, uid]);

  const loading = enabled && loadedUid !== uid;
  const value = useMemo(() => ({ activeTrip, loading, error }), [activeTrip, loading, error]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useActiveTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useActiveTrip debe usarse dentro de TripProvider');
  return context;
}
