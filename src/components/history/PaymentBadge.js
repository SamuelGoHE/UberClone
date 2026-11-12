import { StyleSheet, Text, View } from 'react-native';
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '../../constants/paymentMethods';
import { getPaymentVariant } from '../../utils/paymentVariant';
import { colors, radius, typography } from '../../theme/colors';

// Color de la etiqueta del estado del pago, el mismo del resumen del cobro.
const VARIANT_COLORS = {
  [PAYMENT_STATUS.APPROVED]: colors.success,
  [PAYMENT_STATUS.PENDING]: colors.warning,
  [PAYMENT_STATUS.REJECTED]: colors.danger,
  [PAYMENT_STATUS.CASH]: colors.cash,
};

// Etiqueta con el estado del pago de un viaje (Aprobado, Efectivo, Pendiente o Rechazado). El estado se calcula con
// getPaymentVariant, igual que en el resumen del cobro.
export default function PaymentBadge({ trip }) {
  const variant = getPaymentVariant(trip);
  const color = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{PAYMENT_STATUS_LABELS[variant]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...typography.caption, color: colors.text },
});
