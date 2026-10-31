import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { DRIVER_STATUS } from '../../constants/driverStatus';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Pantalla PROVISIONAL: solo confirma que la sesión y el perfil de Firestore funcionan.
// La Fase 3 la reemplaza por el mapa y el interruptor Disponible / No disponible.
export default function HomeScreen() {
  const { driver, signOut } = useAuth();
  const approved = driver?.status === DRIVER_STATUS.APPROVED;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {driver ? (
          <>
            <Text style={styles.title}>Hola, {driver.fullName}</Text>
            <View style={[styles.badge, approved ? styles.badgeApproved : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {approved ? 'Cuenta aprobada' : 'Cuenta pendiente de aprobación'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>No encontramos tu perfil de conductor.</Text>
        )}

        <Pressable style={styles.logout} onPress={signOut} accessibilityRole="button">
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  title: { ...typography.heading, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  badgeApproved: { backgroundColor: colors.success },
  badgePending: { backgroundColor: colors.warning },
  badgeText: { ...typography.caption, color: colors.onPrimary, fontWeight: '600' },
  logout: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { ...typography.bodyStrong, color: colors.text },
});
