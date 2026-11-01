import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';

// Pestaña 3 del registro, reservada. Se construye después del avance.
export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Documentos</Text>
      <Text style={styles.soon}>Próximamente</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  title: { ...typography.heading, color: colors.text },
  soon: { ...typography.body, color: colors.textMuted },
});
