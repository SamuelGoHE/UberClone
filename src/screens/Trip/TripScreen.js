import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PickupCard from '../../components/trip/PickupCard';
import { useActiveTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import useRoute from '../../hooks/useRoute';
import { updateDriverLocation } from '../../services/firebase/locations';
import { cancelTrip, startDriverArriving } from '../../services/firebase/trips';
import { TRIP_STATUS } from '../../constants/tripStatus';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Centro de Medellín: el mapa abre aquí mientras llega la ubicación real del conductor.
const FALLBACK_REGION = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.05, longitudeDelta: 0.05 };
// Espacio que tapan la píldora de arriba y la tarjeta de abajo al encuadrar la ruta.
const MAP_PADDING = { top: 140, right: 60, bottom: 380, left: 60 };

// Pantalla del viaje en curso. RootNavigator la muestra mientras exista un viaje activo (en lugar del Inicio),
// así que mientras dura el viaje esta pantalla es la que sigue enviando la ubicación del conductor.
// Por ahora cubre el tramo "Hacia la recogida"; el tramo hacia el destino se suma en el siguiente paso.
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

  // Una sola ruta para este tramo: desde donde esté el conductor hasta la recogida.
  const pickup = trip ? { lat: trip.origin.lat, lng: trip.origin.lng } : null;
  const { route, error: routeError } = useRoute(`${tripId}:pickup`, location, pickup);

  // La línea de la ruta; si OSRM falla, una línea recta para que el conductor igual vea hacia dónde ir.
  let line = null;
  if (route) line = route.coordinates;
  else if (routeError && location && pickup) {
    line = [
      { latitude: location.lat, longitude: location.lng },
      { latitude: pickup.lat, longitude: pickup.lng },
    ];
  }

  // Cuando la ruta llega, el mapa la encuadra una vez (no en cada movimiento del GPS).
  useEffect(() => {
    if (line && mapRef.current) mapRef.current.fitToCoordinates(line, { edgePadding: MAP_PADDING, animated: true });
  }, [route, routeError]);

  if (!trip) return null;

  const confirmCancel = async () => {
    setBusy(true);
    setActionError(null);
    try {
      // Si sale bien, el viaje deja de estar activo y RootNavigator vuelve solo al Inicio.
      await cancelTrip(tripId);
    } catch {
      setActionError('No pudimos cancelar el viaje. Inténtalo de nuevo.');
    }
    setBusy(false);
  };
  const handleCancel = () =>
    Alert.alert('¿Cancelar el viaje?', 'El pasajero tendrá que pedir otro viaje.', [
      { text: 'Volver', style: 'cancel' },
      { text: 'Cancelar viaje', style: 'destructive', onPress: confirmCancel },
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
        <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.pickupMarker} />
        </Marker>
      </MapView>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="none">
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>{`Hacia la recogida${minutes}`}</Text>
        </View>
      </View>

      <PickupCard trip={trip} route={route} busy={busy} error={actionError} onCancel={handleCancel} />
    </View>
  );
}

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
  pillDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  pillText: { ...typography.bodyStrong, color: colors.text },
  pickupMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
