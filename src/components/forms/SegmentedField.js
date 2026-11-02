import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: control segmentado, para escoger una opción entre pocas (como Español / English).
// Controlado como los demás selectores: value viene de la pantalla y onChange avisa el cambio.
export default function SegmentedField({ label, value, options, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.bodyStrong, color: colors.text },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 },
  segmentSelected: { backgroundColor: colors.surface },
  text: { ...typography.body, color: colors.textMuted },
  textSelected: { ...typography.bodyStrong, color: colors.text },
});
