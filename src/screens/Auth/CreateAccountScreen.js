// AI-assisted: see docs/AI_LOG.md #9, #10
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/forms/FormField';
import { useAuth } from '../../context/AuthContext';
import { validateConfirmPassword, validateEmail, validatePassword } from '../../utils/validators';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Devuelve un mensaje por cada campo inválido (objeto vacío si todo está bien).
function validate(email, password, confirmation) {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const confirmError = validateConfirmPassword(password, confirmation);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (confirmError) errors.confirmation = confirmError;
  return errors;
}

export default function CreateAccountScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef(null);
  const confirmationRef = useRef(null);

  async function handleSubmit() {
    // El teclado puede enviar el formulario sin pasar por el botón: se ignora si ya hay un envío.
    if (submitting) return;

    const found = validate(email, password, confirmation);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const failure = await signUp(email, password);
    // Si se crea la cuenta, la sesión cambia y la navegación lleva al registro: no hay que hacer nada más.
    if (failure) {
      setErrors({ [failure.field]: failure.message });
      setSubmitting(false);
    }
  }

  const clearError = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Usa tu correo para empezar tu registro como conductor.</Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              error={errors.email}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={styles.group}>
              <FormField
                ref={passwordRef}
                label="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                error={errors.password}
                placeholder="Tu contraseña"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmationRef.current?.focus()}
              />
              {/* La ayuda se oculta cuando hay un error en este campo, para no duplicar mensajes. */}
              {errors.password ? null : <Text style={styles.hint}>Mínimo 6 caracteres.</Text>}
            </View>

            <FormField
              ref={confirmationRef}
              label="Confirmar contraseña"
              value={confirmation}
              onChangeText={(text) => {
                setConfirmation(text);
                clearError('confirmation');
              }}
              error={errors.confirmation}
              placeholder="Repite tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta"
            >
              {submitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Crear cuenta</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="link">
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  form: { gap: spacing.md },
  group: { gap: spacing.xs },
  hint: { ...typography.caption, color: colors.textMuted },
  formError: { ...typography.caption, color: colors.danger },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  footerText: { ...typography.body, color: colors.textMuted },
  footerLink: { ...typography.bodyStrong, color: colors.text },
});
