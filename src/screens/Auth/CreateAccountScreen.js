import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/colors';

// Pantalla casi vacía: solo el título y el enlace de regreso. El formulario llega en un paso posterior.
export default function CreateAccountScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Crear cuenta</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="link">
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  title: { ...typography.heading, color: colors.text },
  footer: { flexDirection: 'row', gap: spacing.sm },
  footerText: { ...typography.body, color: colors.textMuted },
  footerLink: { ...typography.bodyStrong, color: colors.text },
});
