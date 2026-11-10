import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAYMENT_LABELS, PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '../../constants/paymentMethods';
import { useActiveTrip } from '../../context/TripContext';
import { markTripPaid, switchToCash } from '../../services/firebase/trips';
import { formatMoney } from '../../utils/formatMoney';
import { getPaymentVariant } from '../../utils/paymentVariant';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: las cuatro variantes del resumen son datos, no cuatro pantallas. Cada una dice qué color, textos y
// botón le corresponden; la pantalla es la misma. El botón principal siempre cierra el cobro (markTripPaid)
// o pasa a efectivo (switchToCash). "Actualizar estado" y "Reintentar cobro" llegan con el backend de pagos.
const VARIANTS = {
  [PAYMENT_STATUS.APPROVED]: {
    color: colors.success,
    icon: 'check',
    title: 'Pago aprobado',
    message: 'El pasajero pagó con Mercado Pago.',
    action: 'Listo',
  },
  [PAYMENT_STATUS.PENDING]: {
    color: colors.warning,
    icon: 'clock',
    title: 'Pago pendiente',
    message: 'Esperando la confirmación de Mercado Pago…',
    action: 'Cobrar en efectivo',
  },
  [PAYMENT_STATUS.REJECTED]: {
    color: colors.danger,
    icon: 'cross',
    title: 'Pago rechazado',
    message: 'La tarjeta del pasajero fue rechazada.',
    notice: 'Pide al pasajero otro medio de pago o cobra en efectivo.',
    action: 'Cobrar en efectivo',
  },
  [PAYMENT_STATUS.CASH]: {
    color: colors.cash,
    icon: 'cash',
    title: 'Cobro en efectivo',
    message: 'Cobra la tarifa al pasajero en mano.',
    action: 'Marcar cobro recibido',
  },
};

// Ícono dentro del círculo de color, dibujado con Views y texto (la app no usa librería de íconos).
function StatusIcon({ icon, color }) {
  return (
    <View style={[styles.iconCircle, { backgroundColor: `${color}26` }]}>
      {icon === 'check' ? <Text style={[styles.glyph, { color }]}>✓</Text> : null}
      {icon === 'cross' ? <Text style={[styles.glyph, { color }]}>✕</Text> : null}
      {icon === 'cash' ? <Text style={[styles.glyph, { color }]}>$</Text> : null}
      {icon === 'clock' ? (
        <View style={[styles.clock, { borderColor: color }]}>
          <View style={[styles.clockHandLong, { backgroundColor: color }]} />
          <View style={[styles.clockHandShort, { backgroundColor: color }]} />
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

// Resumen del cobro. RootNavigator lo muestra mientras el viaje está en "completed" (terminado y por cobrar).
// Cuando el conductor lo cierra, el viaje pasa a "paid", deja de estar abierto y se vuelve al Inicio.
export default function SummaryScreen() {
  const { activeTrip: trip } = useActiveTrip();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!trip) return null;

  const variant = getPaymentVariant(trip);
  const view = VARIANTS[variant];
  // Efectivo y Listo cierran el cobro; en pendiente o rechazado el botón cambia a cobro en efectivo.
  const closesTrip = variant === PAYMENT_STATUS.CASH || variant === PAYMENT_STATUS.APPROVED;
  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);

  const handleAction = async () => {
    setBusy(true);
    setError(null);
    try {
      await (closesTrip ? markTripPaid(trip.id) : switchToCash(trip.id));
    } catch {
      setError('No pudimos guardar el cobro. Inténtalo de nuevo.');
    }
    setBusy(false);
  };

  const notice =
    variant === PAYMENT_STATUS.CASH
      ? `La plataforma no recibió este dinero: la comisión de ${formatMoney(trip.commission)} se descontará de tu saldo.`
      : view.notice;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Resumen del viaje</Text>

        <View style={styles.status}>
          <StatusIcon icon={view.icon} color={view.color} />
          <Text style={styles.statusTitle}>{view.title}</Text>
          <Text style={styles.statusMessage}>{view.message}</Text>
        </View>

        <View style={styles.earnings}>
          <Text style={styles.caption}>Tu ganancia neta</Text>
          <Text style={styles.amount}>{formatMoney(trip.driverEarnings)}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Tarifa final" value={formatMoney(trip.fare)} />
          <Row label={`Comisión (${commissionPercent} %)`} value={formatMoney(-trip.commission)} />
          <Row label="Propina" value={formatMoney(trip.tip ?? 0)} />
          <View style={styles.divider} />
          <Row label="Ganancia neta" value={formatMoney(trip.driverEarnings)} strong />
        </View>

        <View style={styles.card}>
          <Row label="Método de pago" value={PAYMENT_LABELS[trip.paymentMethod] ?? trip.paymentMethod} />
          <Row label="Estado del pago" value={PAYMENT_STATUS_LABELS[variant]} />
          {trip.paymentId ? <Row label="ID del pago" value={String(trip.paymentId)} /> : null}
        </View>

        {notice ? (
          <View style={[styles.notice, { backgroundColor: `${view.color}1F` }]}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, busy && styles.disabled]}
          onPress={handleAction}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={view.action}
        >
          <Text style={styles.buttonText}>{view.action}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  screenTitle: { ...typography.heading, color: colors.text },
  status: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.md },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  glyph: { fontSize: 28, lineHeight: 32, fontWeight: '700' },
  clock: { width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  clockHandLong: { position: 'absolute', width: 2.5, height: 9, top: 3, borderRadius: 1 },
  clockHandShort: { position: 'absolute', width: 7, height: 2.5, left: 12, top: 12, borderRadius: 1 },
  statusTitle: { ...typography.heading, color: colors.text },
  statusMessage: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  earnings: { alignItems: 'center', gap: 2 },
  caption: { ...typography.caption, color: colors.textMuted },
  amount: { ...typography.display, color: colors.text },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.body, color: colors.text },
  rowStrong: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  notice: { padding: spacing.md, borderRadius: radius.md },
  noticeText: { ...typography.caption, color: colors.text },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, backgroundColor: colors.background },
  error: { ...typography.caption, color: colors.danger },
  button: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  disabled: { opacity: 0.5 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
});
