// AI-assisted: see docs/AI_LOG.md #22
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRICING } from '../../config/pricing';
import { CATEGORY_OPTIONS } from '../../constants/registration';
import { PAYMENT_LABELS } from '../../constants/paymentMethods';
import useCountdown from '../../hooks/useCountdown';
import { calculateFare } from '../../utils/calculateFare';
import { formatMoney } from '../../utils/formatMoney';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Segundos que tiene el conductor para responder, y desde cuántos la cuenta se pone roja.
export const REQUEST_SECONDS = 15;
const URGENT_SECONDS = 5;

// Tarjeta de Solicitud entrante, como en el diseño: cuenta regresiva, ganancia neta estimada, ruta y
// los botones Rechazar / Aceptar. Cuando el tiempo llega a cero avisa con onReject, igual que si el
// conductor hubiera tocado Rechazar. Mientras busy es true (se está guardando la respuesta) no se
// rechaza por tiempo ni se puede tocar un botón por segunda vez.
export default function IncomingRequestCard({ request, busy, error, onAccept, onReject }) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(1)).current;
  const remaining = useCountdown(REQUEST_SECONDS, request.id, () => {
    if (!busy) onReject();
  });

  // La barra baja de forma continua durante todo el tiempo; arranca de nuevo con cada solicitud.
  useEffect(() => {
    progress.setValue(1);
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: REQUEST_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [request.id, progress]);

  // La tarifa no viene en la solicitud: la calcula la app, con la misma función que usará al cerrar el viaje.
  const estimate = useMemo(
    () =>
      calculateFare({
        distanceKm: request.distanceKm,
        durationMin: request.durationMin,
        category: request.category,
        tip: request.tip ?? 0,
      }),
    [request],
  );

  const urgent = remaining <= URGENT_SECONDS;
  const categoryLabel = CATEGORY_OPTIONS.find((option) => option.value === request.category)?.label;
  const isCash = request.paymentMethod === 'cash';
  const commissionPercent = Math.round(PRICING.commissionRate * 100);
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.handle} />

      <View style={styles.titleRow}>
        <Text style={styles.title}>Nueva solicitud</Text>
        <Text style={[styles.seconds, urgent && styles.secondsUrgent]} accessibilityLiveRegion="polite">
          {remaining} s
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.bar, { width: barWidth, backgroundColor: urgent ? colors.danger : colors.success }]}
        />
      </View>

      <View style={styles.earnings}>
        <Text style={styles.caption}>Ganancia neta estimada</Text>
        <Text style={styles.amount}>{formatMoney(estimate.driverEarnings)}</Text>
        <Text style={styles.caption}>
          {`Tarifa ${formatMoney(estimate.fare)} · Comisión ${commissionPercent}% −${formatMoney(estimate.commission)}`}
          {request.tip > 0 ? ` · Propina +${formatMoney(request.tip)}` : ''}
        </Text>
      </View>

      <View style={styles.chips}>
        {categoryLabel ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{categoryLabel}</Text>
          </View>
        ) : null}
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: isCash ? colors.cash : colors.primary }]} />
          <Text style={styles.chipText}>{PAYMENT_LABELS[request.paymentMethod] ?? request.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.stops}>
          <View style={styles.stopColumn}>
            <View style={styles.pickupDot} />
            <View style={styles.connector} />
            <View style={styles.destinationSquare} />
          </View>
          <View style={styles.stopTexts}>
            <View style={styles.stop}>
              <Text style={styles.caption}>Recogida</Text>
              <Text style={styles.address}>{request.origin.address}</Text>
            </View>
            <View style={styles.stop}>
              <Text style={styles.caption}>Destino</Text>
              <Text style={styles.address}>{request.destination.address}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.metrics}>
          <View>
            <Text style={styles.caption}>Distancia</Text>
            <Text style={styles.metric}>{`${String(request.distanceKm).replace('.', ',')} km`}</Text>
          </View>
          <View>
            <Text style={styles.caption}>Duración</Text>
            <Text style={styles.metric}>{`${request.durationMin} min`}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.reject, busy && styles.disabled]}
          onPress={onReject}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Rechazar solicitud"
        >
          <Text style={styles.rejectText}>Rechazar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.accept, busy && styles.disabled]}
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Aceptar solicitud"
        >
          <Text style={styles.acceptText}>Aceptar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: -4 },
  elevation: 4,
};

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
    ...SHADOW,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.text },
  seconds: { ...typography.heading, color: colors.text },
  secondsUrgent: { color: colors.danger },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  earnings: { gap: 2 },
  caption: { ...typography.caption, color: colors.textMuted },
  amount: { ...typography.display, color: colors.text },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { ...typography.caption, color: colors.text },
  route: { gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background },
  stops: { flexDirection: 'row', gap: spacing.md },
  stopColumn: { alignItems: 'center', paddingTop: 4, paddingBottom: 6 },
  pickupDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success },
  connector: { flex: 1, width: 2, marginVertical: 2, backgroundColor: colors.border },
  destinationSquare: { width: 12, height: 12, backgroundColor: colors.primary },
  stopTexts: { flex: 1, gap: spacing.sm },
  stop: { gap: 2 },
  address: { ...typography.body, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  metrics: { flexDirection: 'row', gap: spacing.lg },
  metric: { ...typography.bodyStrong, color: colors.text },
  error: { ...typography.caption, color: colors.danger },
  actions: { flexDirection: 'row', gap: spacing.md },
  button: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  reject: { flex: 1, backgroundColor: colors.background },
  accept: { flex: 2, backgroundColor: colors.primary },
  disabled: { opacity: 0.5 },
  rejectText: { ...typography.bodyStrong, color: colors.text },
  acceptText: { ...typography.bodyStrong, color: colors.onPrimary },
});
