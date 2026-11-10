import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DestinationCard from '../../components/trip/DestinationCard';
import PickupCard from '../../components/trip/PickupCard';
import { PRICING } from '../../config/pricing';
import { useActiveTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import useRoute from '../../hooks/useRoute';
import { updateDriverLocation } from '../../services/firebase/locations';
import { cancelTrip, completeTrip, pickUpPassenger, startDriverArriving } from '../../services/firebase/trips';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { calculateFare } from '../../utils/calculateFare';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Centro de Medellín: el mapa abre aquí mientras llega la ubicación real del conductor.
const FALLBACK_REGION = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.05, longitudeDelta: 0.05 };
// Espacio que tapan la píldora de arriba y la tarjeta de abajo al encuadrar la ruta.
const MAP_PADDING = { top: 140, right: 60, bottom: 380, left: 60 };

// Pantalla del viaje en curso. RootNavigator la muestra mientras exista un viaje activo (en lugar del Inicio),
// así que mientras dura el viaje esta pantalla es la que sigue enviando la ubicación del conductor.
// CONCEPTO: el campo status del viaje decide qué se ve, sin navegar a mano:
//   accepted / driver_arriving -> "Hacia la recogida": ruta desde el conductor hasta el pasajero.
//   in_progress                -> "Hacia el destino": ruta desde la recogida hasta el destino.
// Al finalizar, el viaje pasa a "completed", deja de estar activo y RootNavigator vuelve al Inicio.
export default function TripScreen() {
  const { activeTrip: trip } = useActiveTrip();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { location } = useDriverLocation({
    active: true,
    onLocation: (coords) => updateDriverLocation(user.uid, coords).catch(() => {}),
  });

  // Al aceptar, el viaje queda en "accepted"; en cuanto se abre esta pantalla, el conductor sale hacia el
  // pasajero y pasa a "driver_arriving". Si la escritura falla no pasa nada grave: la pantalla se ve igual.
  const tripId = trip?.id;
  const status = trip?.status;
  useEffect(() => {
    if (status === TRIP_STATUS.ACCEPTED) startDriverArriving(tripId).catch(() => {});
  }, [tripId, status]);

  // El cobro final usa los valores de la solicitud que el conductor aceptó (lo que vio es lo que cobra).
  const estimate = useMemo(
    () =>
      trip
        ? calculateFare({
            distanceKm: trip.distanceKm,
            durationMin: trip.durationMin,
            category: trip.category,
            tip: trip.tip ?? 0,
          })
        : null,
    [trip],
  );

  // El tramo actual. Hacia la recogida sale de donde esté el conductor; hacia el destino sale de la recogida,
  // que es donde el pasajero sube (así no depende de que el GPS ya haya respondido).
  const boarded = status === TRIP_STATUS.IN_PROGRESS;
  const pickup = trip ? { lat: trip.origin.lat, lng: trip.origin.lng } : null;
  const destination = trip ? { lat: trip.destination.lat, lng: trip.destination.lng } : null;
  const start = boarded ? pickup : location;
  const target = boarded ? destination : pickup;
  // Una sola ruta por tramo: la clave cambia al pasar de un tramo al otro y entonces se pide la nueva.
  const { route, error: routeError } = useRoute(`${tripId}:${boarded ? 'destination' : 'pickup'}`, start, target);

  // La línea de la ruta; si OSRM falla, una línea recta para que el conductor igual vea hacia dónde ir.
  let line = null;
  if (route) line = route.coordinates;
  else if (routeError && start && target) {
    line = [
      { latitude: start.lat, longitude: start.lng },
      { latitude: target.lat, longitude: target.lng },
    ];
  }

  // Cuando la ruta de un tramo llega, el mapa la encuadra una vez (no en cada movimiento del GPS).
  useEffect(() => {
    if (line && mapRef.current) mapRef.current.fitToCoordinates(line, { edgePadding: MAP_PADDING, animated: true });
  }, [route, routeError]);

  if (!trip) return null;

  // Ejecuta una acción sobre el viaje: bloquea los botones mientras se guarda y muestra el error si falla.
  // Si sale bien, el viaje cambia de estado y la pantalla se actualiza sola (TripContext lo detecta).
  const run = async (action, errorMessage) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch {
      setActionError(errorMessage);
    }
    setBusy(false);
  };
  const handlePickedUp = () =>
    run(() => pickUpPassenger(tripId), 'No pudimos registrar que el pasajero subió. Inténtalo de nuevo.');
  const handleFinish = () =>
    run(
      () => completeTrip(tripId, { ...estimate, commissionRate: PRICING.commissionRate }),
      'No pudimos finalizar el viaje. Inténtalo de nuevo.',
    );
  const handleCancel = () =>
    Alert.alert('¿Cancelar el viaje?', 'El pasajero tendrá que pedir otro viaje.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar viaje',
        style: 'destructive',
        onPress: () => run(() => cancelTrip(tripId), 'No pudimos cancelar el viaje. Inténtalo de nuevo.'),
      },
    ]);

  const minutes = route ? ` · ${route.durationMin} min` : '';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={FALLBACK_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {line ? <Polyline coordinates={line} strokeColor={colors.primary} strokeWidth={4} /> : null}
        {/* Punto verde en la recogida; al subir el pasajero, cuadrado negro en el destino (como en el diseño). */}
        <Marker
          key={boarded ? 'destination' : 'pickup'}
          coordinate={{ latitude: target.lat, longitude: target.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={boarded ? styles.destinationMarker : styles.pickupMarker} />
        </Marker>
      </MapView>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="none">
        <View style={styles.pill}>
          <View style={[styles.pillDot, { backgroundColor: boarded ? colors.primary : colors.success }]} />
          <Text style={styles.pillText}>{`${boarded ? 'Hacia el destino' : 'Hacia la recogida'}${minutes}`}</Text>
        </View>
      </View>

      {boarded ? (
        <DestinationCard trip={trip} estimate={estimate} busy={busy} error={actionError} onFinish={handleFinish} />
      ) : (
        <PickupCard
          trip={trip}
          route={route}
          busy={busy}
          error={actionError}
          onPickedUp={handlePickedUp}
          onCancel={handleCancel}
        />
      )}
    </View>
  );
}

const MARKER = { width: 18, height: 18, borderWidth: 3, borderColor: colors.surface };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { position: 'absolute', left: spacing.md, right: spacing.md, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pillDot: { width: 10, height: 10, borderRadius: 5 },
  pillText: { ...typography.bodyStrong, color: colors.text },
  pickupMarker: { ...MARKER, borderRadius: 9, backgroundColor: colors.success },
  destinationMarker: { ...MARKER, backgroundColor: colors.primary },
});
