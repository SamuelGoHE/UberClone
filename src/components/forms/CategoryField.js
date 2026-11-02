import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: elección de una categoría con tarjetas (Económico, XL, Premium). Es un control como
// SegmentedField, pero con tarjetas más grandes y una ayuda opcional debajo (hint).
// Controlado: value viene de la pantalla y onChange avisa el cambio.
export default function CategoryField({ label, value, options, onChange, error, hint }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.card, selected && styles.cardSelected, error ? styles.cardError : null]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}: ${option.label}`}
            >
              <Text style={[styles.name, selected && styles.nameSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.bodyStrong, color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  // El borde grueso se dibuja hacia adentro restando 1 px de relleno, para que la tarjeta no "salte".
  cardSelected: { borderColor: colors.primary, borderWidth: 2, paddingVertical: 15 },
  cardError: { borderColor: colors.danger },
  name: { ...typography.body, color: colors.text },
  nameSelected: { ...typography.bodyStrong },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
});
