// AI-assisted: see docs/AI_LOG.md #24, #25
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney } from '../../utils/formatMoney';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Tarjeta del tramo "Hacia el destino": adónde se lleva al pasajero y lo que se cobrará, con el botón
// Finalizar viaje. La distancia, la duración y la tarifa son las de la solicitud que el conductor aceptó:
// con esos mismos valores se calcula el cobro final (estimate viene de calculateFare).
export default function DestinationCard({ trip, estimate, busy, error, onFinish }) {
  const insets = useSafeAreaInsets();
  const metrics = [
    { label: 'Distancia', value: `${String(trip.distanceKm).replace('.', ',')} km` },
    { label: 'Duración', value: `${trip.durationMin} min` },
    { label: 'Tarifa estimada', value: formatMoney(estimate.fare) },
  ];

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.handle} />

      <View style={styles.destination}>
        <Text style={styles.caption}>Destino</Text>
        <Text style={styles.address}>{trip.destination.address}</Text>
      </View>

      <View style={styles.metrics}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Text style={styles.caption}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.finish, busy && styles.disabled]}
        onPress={onFinish}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Finalizar viaje"
      >
        <Text style={styles.finishText}>Finalizar viaje</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  destination: { gap: 2 },
  caption: { ...typography.caption, color: colors.textMuted },
  address: { ...typography.heading, color: colors.text },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metric: { flex: 1, gap: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background },
  metricValue: { ...typography.bodyStrong, color: colors.text },
  error: { ...typography.caption, color: colors.danger },
  finish: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  disabled: { opacity: 0.5 },
  finishText: { ...typography.bodyStrong, color: colors.onPrimary },
});
