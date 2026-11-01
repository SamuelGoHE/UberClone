import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectField from '../../components/forms/SelectField';
import { validateSelection } from '../../utils/validators';
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
  const [genderError, setGenderError] = useState(null);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.content}>
        <SelectField
          label="Género"
          value={gender}
          options={GENDER_OPTIONS}
          onChange={(next) => {
            setGender(next);
            setGenderError(null);
          }}
          error={genderError}
        />
        <Pressable
          style={styles.button}
          onPress={() => setGenderError(validateSelection(gender))}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Validar</Text>
        </Pressable>
        <Text style={styles.debug}>Valor guardado: {gender || '(vacío)'}</Text>
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
