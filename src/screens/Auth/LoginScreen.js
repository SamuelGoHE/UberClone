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
import { colors, radius, spacing, typography } from '../../theme/colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Devuelve un objeto con un mensaje por cada campo inválido (vacío si todo está bien).
function validate(email, password) {
  const errors = {};
  if (email.trim() === '') errors.email = 'Ingresa tu correo.';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El correo no es válido.';
  if (password === '') errors.password = 'Ingresa tu contraseña.';
  return errors;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // CONCEPTO: useRef guarda una referencia al campo para poder darle el foco desde otro.
  const passwordRef = useRef(null);

  async function handleSubmit() {
    // onSubmitEditing del teclado llama a esta función sin pasar por el botón deshabilitado:
    // si ya hay un envío en curso, se ignora para no iniciar sesión dos veces.
    if (submitting) return;

    const found = validate(email, password);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const message = await signIn(email, password);
    // Si el login funciona, AuthContext cambia la sesión y esta pantalla deja de mostrarse.
    if (message) {
      setErrors({ password: message });
      setSubmitting(false);
    }
  }

  // Al escribir se borra el error de ese campo, para no dejar un mensaje viejo en pantalla.
  const clearError = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Conductor</Text>
            <Text style={styles.subtitle}>Inicia sesión para empezar a recibir viajes</Text>
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
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              // 'submit' mantiene el teclado abierto al pasar de un campo al otro
              // (por defecto un campo de una línea lo cierra al pulsar "siguiente").
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <FormField
              ref={passwordRef}
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Iniciar sesión"
            >
              {submitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
});
