// AI-assisted: see docs/AI_LOG.md #12
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: campo de selección (lista desplegable). Se ve como un FormField, pero al tocarlo abre una
// hoja con las opciones. Es un componente "controlado": el valor vive en la pantalla que lo usa
// (value) y el componente avisa el cambio con onChange. Sirve para género, categoría y color.
export default function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Selecciona una opción',
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);

  function choose(optionValue) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.box, error ? styles.boxError : null]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected ? selected.label : placeholder}`}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <View style={styles.chevron} />
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        {/* Tocar fuera de la hoja la cierra. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{label}</Text>
          <ScrollView>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={styles.option}
                  onPress={() => choose(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected ? <View style={styles.check} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.bodyStrong, color: colors.text },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  boxError: { borderColor: colors.danger },
  value: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  // Flecha hacia abajo dibujada con dos bordes de un cuadrado girado (sin librería de íconos).
  chevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textMuted,
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  error: { ...typography.caption, color: colors.danger },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    maxHeight: '60%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionText: { ...typography.body, color: colors.text },
  optionTextSelected: { ...typography.bodyStrong },
  // Check dibujado igual que la flecha: dos bordes de un rectángulo girado.
  check: {
    width: 7,
    height: 13,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.success,
    transform: [{ rotate: '45deg' }],
  },
});
