// AI-assisted: see docs/AI_LOG.md #29
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_OPTIONS } from '../../constants/registration';
import { formatDateTime } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import PaymentBadge from './PaymentBadge';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Un viaje en la lista del Historial: fecha y hora, estado del pago, origen → destino, categoría, tarifa y
// ganancia neta.
export default function TripCard({ trip, onPress }) {
  const category = CATEGORY_OPTIONS.find((option) => option.value === trip.category)?.label;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.caption}>{formatDateTime(trip.completedAtMs ?? trip.createdAtMs)}</Text>
        <PaymentBadge trip={trip} />
      </View>
      <Text style={styles.route} numberOfLines={2}>
        {`${trip.origin?.address ?? 'Origen'} → ${trip.destination?.address ?? 'Destino'}`}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.caption}>{category ?? ''}</Text>
        <View style={styles.amounts}>
          <Text style={styles.caption}>{`Tarifa ${formatMoney(trip.fare ?? 0)}`}</Text>
          <Text style={styles.net}>{`Neta ${formatMoney(trip.driverEarnings ?? 0)}`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caption: { ...typography.caption, color: colors.textMuted },
  route: { ...typography.bodyStrong, color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amounts: { flexDirection: 'row', gap: spacing.md },
  net: { ...typography.caption, color: colors.text, fontWeight: '600' },
});
