import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Botón redondeado de filtro (Hoy, Semana, Efectivo…). Seleccionado se ve negro, como en el diseño.
export default function FilterChip({ label, selected, onPress }) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { ...typography.caption, color: colors.text },
  textSelected: { color: colors.onPrimary, fontWeight: '600' },
});
