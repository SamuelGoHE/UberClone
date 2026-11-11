import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_OPTIONS } from '../../constants/registration';
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '../../constants/paymentMethods';
import { formatDateTime } from '../../utils/formatDate';
import { formatMoney } from '../../utils/formatMoney';
import { getPaymentVariant } from '../../utils/paymentVariant';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Color de la etiqueta del estado del pago, el mismo del resumen del cobro.
const VARIANT_COLORS = {
  [PAYMENT_STATUS.APPROVED]: colors.success,
  [PAYMENT_STATUS.PENDING]: colors.warning,
  [PAYMENT_STATUS.REJECTED]: colors.danger,
  [PAYMENT_STATUS.CASH]: colors.cash,
};

// Un viaje en la lista del Historial: fecha y hora, estado del pago, origen → destino, categoría, tarifa y
// ganancia neta. El estado se calcula con getPaymentVariant, igual que en el resumen del cobro.
export default function TripCard({ trip, onPress }) {
  const variant = getPaymentVariant(trip);
  const color = VARIANT_COLORS[variant];
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
        <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.badgeText}>{PAYMENT_STATUS_LABELS[variant]}</Text>
        </View>
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
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { ...typography.caption, color: colors.text },
  route: { ...typography.bodyStrong, color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amounts: { flexDirection: 'row', gap: spacing.md },
  net: { ...typography.caption, color: colors.text, fontWeight: '600' },
});
