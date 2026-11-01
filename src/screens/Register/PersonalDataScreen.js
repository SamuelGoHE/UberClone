import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateField from '../../components/forms/DateField';
import SelectField from '../../components/forms/SelectField';
import { formatDate } from '../../utils/formatDate';
import { validateBirthDate, validateSelection } from '../../utils/validators';
import { colors, radius, spacing, typography } from '../../theme/colors';

// PANTALLA PROVISIONAL: sirve para probar los selectores uno a uno. El formulario completo
// de Datos personales la reemplaza más adelante.
const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro / Prefiero no decirlo' },
];

export default function PersonalDataScreen() {
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  function validate() {
    setErrors({
      gender: validateSelection(gender) ?? undefined,
      birthDate: validateBirthDate(birthDate) ?? undefined,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.content}>
        <DateField
          label="Fecha de nacimiento"
          value={birthDate}
          onChange={(next) => {
            setBirthDate(next);
            clearError('birthDate');
          }}
          error={errors.birthDate}
        />
        <SelectField
          label="Género"
          value={gender}
          options={GENDER_OPTIONS}
          onChange={(next) => {
            setGender(next);
            clearError('gender');
          }}
          error={errors.gender}
        />
        <Pressable style={styles.button} onPress={validate} accessibilityRole="button">
          <Text style={styles.buttonText}>Validar</Text>
        </Pressable>
        <Text style={styles.debug}>Fecha: {formatDate(birthDate) || '(vacía)'}</Text>
        <Text style={styles.debug}>Género: {gender || '(vacío)'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  debug: { ...typography.caption, color: colors.textMuted },
});
