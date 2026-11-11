import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PAYMENT_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/paymentMethods';
import ClockIcon from '../../components/common/ClockIcon';
import { useActiveTrip } from '../../context/TripContext';
import { markTripPaid, switchToCash } from '../../services/firebase/trips';
import { createPayment, PaymentsError, refreshPayment } from '../../services/payments';
import { formatMoney } from '../../utils/formatMoney';
import { getPaymentVariant } from '../../utils/paymentVariant';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: las cuatro variantes del resumen son datos, no cuatro pantallas. Cada una dice qué color, textos y
// botones le corresponden; la pantalla es la misma. Cada botón tiene un id que apunta a una acción (handlers).
// El primero de actions es el botón principal; link es un texto pequeño de apoyo.
const VARIANTS = {
  [PAYMENT_STATUS.APPROVED]: {
    color: colors.success,
    icon: 'check',
    title: 'Pago aprobado',
    message: 'El pasajero pagó con Mercado Pago.',
    actions: [{ id: 'markPaid', label: 'Listo' }],
  },
  [PAYMENT_STATUS.PENDING]: {
    color: colors.warning,
    icon: 'clock',
    title: 'Pago pendiente',
    message: 'Esperando la confirmación de Mercado Pago…',
    actions: [
      { id: 'refresh', label: 'Actualizar estado' },
      { id: 'cash', label: 'Cobrar en efectivo' },
    ],
    link: { id: 'checkout', label: 'Abrir el pago de nuevo' },
  },
  [PAYMENT_STATUS.REJECTED]: {
    color: colors.danger,
    icon: 'cross',
    title: 'Pago rechazado',
    message: 'La tarjeta del pasajero fue rechazada.',
    notice: 'Pide al pasajero otro medio de pago o cobra en efectivo.',
    actions: [
      { id: 'checkout', label: 'Reintentar cobro' },
      { id: 'cash', label: 'Cobrar en efectivo' },
    ],
  },
  [PAYMENT_STATUS.CASH]: {
    color: colors.cash,
    icon: 'cash',
    title: 'Cobro en efectivo',
    message: 'Cobra la tarifa al pasajero en mano.',
    actions: [{ id: 'markPaid', label: 'Marcar cobro recibido' }],
  },
};

const ALREADY_PAID_HINT = 'El pasajero ya pagó con Mercado Pago, no hace falta cobrar en efectivo.';
const STILL_PENDING_HINT = 'Todavía no vemos el pago. Si ya pagaste, espera unos segundos y toca Actualizar estado.';

// Ícono dentro del círculo de color, dibujado con Views y texto (la app no usa librería de íconos).
function StatusIcon({ icon, color }) {
  return (
    <View style={[styles.iconCircle, { backgroundColor: `${color}26` }]}>
      {icon === 'check' ? <Text style={[styles.glyph, { color }]}>✓</Text> : null}
      {icon === 'cross' ? <Text style={[styles.glyph, { color }]}>✕</Text> : null}
      {icon === 'cash' ? <Text style={[styles.glyph, { color }]}>$</Text> : null}
      {icon === 'clock' ? <ClockIcon color={color} /> : null}
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
// En un viaje de Mercado Pago, la app le pide el cobro al backend, abre el checkout (donde el pasajero paga con
// su tarjeta) y, al cerrarlo, consulta el resultado. El backend lo escribe en el viaje y esta pantalla, que lo
// escucha en tiempo real, cambia sola de variante.
export default function SummaryScreen() {
  const { activeTrip: trip } = useActiveTrip();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);
  const autoStarted = useRef(false);

  const tripId = trip?.id;
  const variant = trip ? getPaymentVariant(trip) : null;

  // Consulta el resultado del pago; si todavía no hay pago, avisa en lugar de dejar al conductor sin respuesta.
  const refresh = async () => {
    const result = await refreshPayment(tripId);
    if (result.paymentStatus === PAYMENT_STATUS.PENDING) setHint(STILL_PENDING_HINT);
  };

  // Pide el cobro al backend, abre el checkout y, cuando el navegador se cierra, consulta el resultado.
  const checkout = async () => {
    const { url } = await createPayment(tripId);
    await WebBrowser.openBrowserAsync(url);
    await refresh();
  };

  const handlers = {
    markPaid: () => markTripPaid(tripId),
    // Antes de pasar a efectivo se consulta el pago: si el pasajero ya pagó en el checkout y la app todavía no lo
    // sabía, el cambio se rechaza y no se le cobra dos veces. Si el backend no responde, igual se puede cobrar.
    cash: async () => {
      if (trip.paymentPreferenceId) await refreshPayment(tripId).catch(() => {});
      if (!(await switchToCash(tripId))) setHint(ALREADY_PAID_HINT);
    },
    refresh,
    checkout,
  };

  const run = async (id) => {
    setBusy(true);
    setError(null);
    setHint(null);
    try {
      await handlers[id]();
    } catch (caught) {
      setError(caught instanceof PaymentsError ? caught.message : 'No pudimos completar la acción. Inténtalo de nuevo.');
    }
    setBusy(false);
  };

  // Un viaje de Mercado Pago que todavía no tiene cobro creado abre el checkout solo, en cuanto aparece el resumen.
  // Si el backend estaba apagado y falló, "Abrir el pago de nuevo" lo reintenta.
  const needsCheckout =
    Boolean(trip) &&
    trip.paymentMethod === PAYMENT_METHODS.MERCADO_PAGO &&
    !trip.paymentPreferenceId &&
    variant === PAYMENT_STATUS.PENDING;
  useEffect(() => {
    if (needsCheckout && !autoStarted.current) {
      autoStarted.current = true;
      run('checkout');
    }
  }, [needsCheckout]);

  if (!trip) return null;

  const view = VARIANTS[variant];
  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);
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
        {hint ? (
          <View style={[styles.notice, { backgroundColor: `${colors.warning}1F` }]}>
            <Text style={styles.noticeText}>{hint}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {view.actions.map((action, index) => (
          <Pressable
            key={action.id}
            style={[styles.button, index === 0 ? styles.primary : styles.secondary, busy && styles.disabled]}
            onPress={() => run(action.id)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text style={index === 0 ? styles.primaryText : styles.secondaryText}>{action.label}</Text>
          </Pressable>
        ))}
        {view.link ? (
          <Pressable
            style={[styles.link, busy && styles.disabled]}
            onPress={() => run(view.link.id)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={view.link.label}
          >
            <Text style={styles.linkText}>{view.link.label}</Text>
          </Pressable>
        ) : null}
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
  button: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  primaryText: { ...typography.bodyStrong, color: colors.onPrimary },
  secondaryText: { ...typography.bodyStrong, color: colors.text },
  link: { alignItems: 'center', justifyContent: 'center', height: 36 },
  linkText: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
});
