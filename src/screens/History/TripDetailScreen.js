// AI-assisted: see docs/AI_LOG.md #29
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaymentBadge from '../../components/history/PaymentBadge';
import { PAYMENT_LABELS } from '../../constants/paymentMethods';
import useRoute from '../../hooks/useRoute';
import useTripDetail from '../../hooks/useTripDetail';
import { formatDateTime } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { toMapCoordinates } from '../../utils/route';
import { colors, radius, spacing, typography } from '../../theme/colors';

const FALLBACK_REGION = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.05, longitudeDelta: 0.05 };
// Espacio que tapan el botón de volver y la tarjeta de abajo al encuadrar la ruta.
const MAP_PADDING = { top: 100, right: 50, bottom: 360, left: 50 };

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

// Calificación que el pasajero le dio al viaje (campo rating, de 1 a 5): estrellas llenas y vacías.
function Stars({ rating }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return <Text style={styles.caption}>Sin calificación</Text>;
  return <Text style={styles.stars}>{'★'.repeat(rating) + '☆'.repeat(5 - rating)}</Text>;
}

// Detalle de un viaje del Historial: la ruta dibujada en el mapa y el desglose del cobro.
// CONCEPTO: la ruta se dibuja con Polyline a partir de la que se guardó en el viaje cuando se hizo (trip.route), sin
// pedirle nada a nadie. Solo los viajes viejos, que no la guardaron, la piden a OSRM como respaldo (una consulta),
// y si eso falla se dibuja una línea recta. Así el historial no gasta consultas por cada viaje que se abre.
export default function TripDetailScreen({ route: screenRoute, navigation }) {
  const { tripId } = screenRoute.params;
  const { trip, loading, error } = useTripDetail(tripId);
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const saved = useMemo(() => (trip?.route?.length ? toMapCoordinates(trip.route) : null), [trip]);
  // Respaldo: solo se pide a OSRM si el viaje cargó y no trae ruta guardada (sin punto de salida, useRoute no pide nada).
  const needsFallback = Boolean(trip) && !saved;
  const { route: fetched, error: fetchError } = useRoute(
    `detail:${tripId}`,
    needsFallback ? trip.origin : null,
    trip?.destination,
  );

  let line = saved ?? fetched?.coordinates ?? null;
  if (!line && fetchError && trip) {
    line = [
      { latitude: trip.origin.lat, longitude: trip.origin.lng },
      { latitude: trip.destination.lat, longitude: trip.destination.lng },
    ];
  }

  useEffect(() => {
    if (line && mapRef.current) mapRef.current.fitToCoordinates(line, { edgePadding: MAP_PADDING, animated: true });
  }, [saved, fetched, fetchError]);

  const back = (
    <Pressable
      style={[styles.back, { top: insets.top + spacing.sm }]}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel="Volver al historial"
    >
      <Text style={styles.backGlyph}>‹</Text>
    </Pressable>
  );

  if (loading || error || !trip) {
    return (
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Text style={styles.message}>{error ?? 'Este viaje ya no existe.'}</Text>
        )}
        {back}
      </View>
    );
  }

  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={FALLBACK_REGION}
        toolbarEnabled={false}
        showsMyLocationButton={false}
      >
        {line ? <Polyline coordinates={line} strokeColor={colors.primary} strokeWidth={4} /> : null}
        <Marker coordinate={{ latitude: trip.origin.lat, longitude: trip.origin.lng }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.pickupMarker} />
        </Marker>
        <Marker coordinate={{ latitude: trip.destination.lat, longitude: trip.destination.lng }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.destinationMarker} />
        </Marker>
      </MapView>
      {back}

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatDateTime(trip.completedAtMs ?? trip.createdAtMs)}</Text>
            <PaymentBadge trip={trip} />
          </View>
          <Text style={styles.addresses}>{`${trip.origin.address}\n→ ${trip.destination.address}`}</Text>

          <View style={styles.card}>
            <Row label="Distancia" value={`${String(trip.distanceKm ?? 0).replace('.', ',')} km`} />
            <Row label="Duración" value={`${trip.durationMin ?? 0} min`} />
            <Row label="Tarifa" value={formatMoney(trip.fare ?? 0)} />
            <Row label={`Comisión (${commissionPercent} %)`} value={formatMoney(-(trip.commission ?? 0))} />
            <Row label="Propina" value={formatMoney(trip.tip ?? 0)} />
            <View style={styles.divider} />
            <Row label="Ganancia neta" value={formatMoney(trip.driverEarnings ?? 0)} strong />
          </View>

          <View style={styles.rating}>
            <Text style={styles.caption}>{`Pago: ${PAYMENT_LABELS[trip.paymentMethod] ?? trip.paymentMethod} · Calificación del pasajero`}</Text>
            <Stars rating={trip.rating} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const MARKER = { width: 18, height: 18, borderWidth: 3, borderColor: colors.surface };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  back: {
    position: 'absolute',
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backGlyph: { fontSize: 30, lineHeight: 34, color: colors.text, marginTop: -3 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '58%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  sheetContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { ...typography.bodyStrong, color: colors.text },
  addresses: { ...typography.body, color: colors.text },
  card: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.body, color: colors.text },
  rowStrong: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  rating: { gap: 4, paddingBottom: spacing.sm },
  caption: { ...typography.caption, color: colors.textMuted },
  stars: { fontSize: 20, color: colors.warning },
  pickupMarker: { ...MARKER, borderRadius: 9, backgroundColor: colors.success },
  destinationMarker: { ...MARKER, backgroundColor: colors.primary },
});
