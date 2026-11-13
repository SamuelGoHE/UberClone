// AI-assisted: see docs/AI_LOG.md #17
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { REQUIRED_TABS } from '../../constants/registration';
import { useRegistration } from '../../context/RegistrationContext';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: barra fija que aparece debajo de las pestañas, en todas. Muestra cuántas pestañas están
// completas y el botón "Enviar registro", que solo se habilita cuando todas las requeridas lo están.
export default function SubmitBar() {
  const { completedTabs, canSubmit, submitting, submitError, submit } = useRegistration();
  const disabled = !canSubmit || submitting;

  return (
    <View style={styles.bar}>
      <Text style={[styles.progress, canSubmit && styles.progressDone]}>
        {canSubmit
          ? 'Todo listo para enviar tu registro'
          : `Completa las pestañas para enviar tu registro (${completedTabs} de ${REQUIRED_TABS})`}
      </Text>
      {submitError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {submitError}
        </Text>
      ) : null}
      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={submit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Enviar registro"
        accessibilityState={{ disabled }}
      >
        {submitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>Enviar registro</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  progress: { ...typography.caption, color: colors.textMuted },
  progressDone: { ...typography.bodyStrong, color: colors.success },
  error: { ...typography.caption, color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  // Deshabilitado = gris, como en el diseño; un botón negro apagado confundiría.
  buttonDisabled: { backgroundColor: colors.border },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  buttonTextDisabled: { color: colors.textMuted },
});
