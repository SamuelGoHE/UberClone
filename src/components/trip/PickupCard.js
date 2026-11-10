import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_OPTIONS } from '../../constants/registration';
import { PAYMENT_LABELS } from '../../constants/paymentMethods';
import { initialsOf } from '../../utils/initials';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Tarjeta del tramo "Hacia la recogida": quién es el pasajero, dónde recogerlo y cuánto falta, con los botones
// Pasajero a bordo y Cancelar viaje. Los datos de distancia y tiempo vienen de la ruta (route); si no hay,
// solo se muestra la dirección.
export default function PickupCard({ trip, route, busy, error, onPickedUp, onCancel }) {
  const insets = useSafeAreaInsets();
  const categoryLabel = CATEGORY_OPTIONS.find((option) => option.value === trip.category)?.label;
  const paymentLabel = PAYMENT_LABELS[trip.paymentMethod] ?? trip.paymentMethod;
  const details = [`★ ${String(trip.passengerRating ?? '–').replace('.', ',')}`, categoryLabel, paymentLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.handle} />

      <View style={styles.passenger}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initialsOf(trip.passengerName)}</Text>
        </View>
        <View style={styles.passengerTexts}>
          <Text style={styles.name}>{trip.passengerName}</Text>
          <Text style={styles.caption}>{details}</Text>
        </View>
      </View>

      <View style={styles.pickup}>
        <Text style={styles.caption}>Recogida</Text>
        <Text style={styles.address}>{trip.origin.address}</Text>
        {route ? (
          <Text style={styles.caption}>{`${String(route.distanceKm).replace('.', ',')} km · ${route.durationMin} min`}</Text>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.primary, busy && styles.disabled]}
        onPress={onPickedUp}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Pasajero a bordo"
      >
        <Text style={styles.primaryText}>Pasajero a bordo</Text>
      </Pressable>
      <Pressable
        style={[styles.cancel, busy && styles.disabled]}
        onPress={onCancel}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Cancelar viaje"
      >
        <Text style={styles.cancelText}>Cancelar viaje</Text>
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
  passenger: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...typography.bodyStrong, color: colors.text },
  passengerTexts: { flex: 1, gap: 2 },
  name: { ...typography.heading, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  pickup: { gap: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background },
  address: { ...typography.body, color: colors.text },
  error: { ...typography.caption, color: colors.danger },
  primary: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  primaryText: { ...typography.bodyStrong, color: colors.onPrimary },
  cancel: { alignItems: 'center', justifyContent: 'center', height: 44, marginTop: -spacing.sm },
  disabled: { opacity: 0.5 },
  cancelText: { ...typography.bodyStrong, color: colors.danger },
});
