import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Se muestra cuando el registro ya se envió y la cuenta sigue en estado pending.
// El texto final llega en un paso posterior; por ahora solo permite cerrar sesión.
export default function PendingApprovalScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Tu registro está en revisión</Text>
      <Pressable style={styles.logout} onPress={signOut} accessibilityRole="button">
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  logout: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { ...typography.bodyStrong, color: colors.text },
});
