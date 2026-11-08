import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: casilla de aceptación (como los términos y condiciones). Controlada: checked viene de la
// pantalla y onChange avisa el cambio. detail es un texto secundario que se muestra siempre (aquí, el
// porcentaje de comisión debe estar visible antes de aceptar).
export default function CheckboxField({ label, detail, checked, onChange, error }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.card, error ? styles.cardError : null]}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <View style={styles.check} /> : null}
        </View>
        <View style={styles.texts}>
          <Text style={styles.label}>{label}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  cardError: { borderColor: colors.danger },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  // Check dibujado con dos bordes de un rectángulo girado (sin librería de íconos).
  check: {
    width: 6,
    height: 11,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.onPrimary,
    transform: [{ rotate: '45deg' }],
  },
  texts: { flex: 1, gap: 4 },
  label: { ...typography.bodyStrong, color: colors.text },
  detail: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
});
