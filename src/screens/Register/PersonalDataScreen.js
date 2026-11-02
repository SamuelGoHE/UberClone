import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateField from '../../components/forms/DateField';
import PhotoField from '../../components/forms/PhotoField';
import SelectField from '../../components/forms/SelectField';
import { formatDate } from '../../utils/formatDate';
import { validateBirthDate, validateImage, validateSelection } from '../../utils/validators';
import { colors, radius, spacing, typography } from '../../theme/colors';

// PANTALLA PROVISIONAL: sirve para probar los selectores uno a uno. El formulario completo
// de Datos personales la reemplaza más adelante.
const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro / Prefiero no decirlo' },
];

export default function PersonalDataScreen() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  const [allValid, setAllValid] = useState(false);

  function validate() {
    const found = {
      profilePhoto: validateImage(profilePhoto, 'Agrega tu foto de perfil.') ?? undefined,
      vehiclePhoto: validateImage(vehiclePhoto, 'Agrega la foto del vehículo.') ?? undefined,
      gender: validateSelection(gender) ?? undefined,
      birthDate: validateBirthDate(birthDate) ?? undefined,
    };
    setErrors(found);
    // Solo para la prueba: confirma en pantalla que no hay errores. Nada se guarda todavía.
    setAllValid(Object.values(found).every((error) => !error));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PhotoField
          label="Foto de perfil"
          shape="circle"
          addText="Agregar foto de perfil"
          helper="Desde la cámara o la galería. Es obligatoria."
          value={profilePhoto}
          onChange={(uri) => {
            setProfilePhoto(uri);
            clearError('profilePhoto');
          }}
          error={errors.profilePhoto}
        />
        <PhotoField
          label="Foto del vehículo"
          addText="Agregar foto del vehículo"
          helper="Debe verse la placa."
          value={vehiclePhoto}
          onChange={(uri) => {
            setVehiclePhoto(uri);
            clearError('vehiclePhoto');
          }}
          error={errors.vehiclePhoto}
        />
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
        {allValid ? (
          <Text style={styles.valid}>
            ✓ Todos los campos son válidos. (Esta pantalla es de prueba: todavía no se guarda nada.)
          </Text>
        ) : null}
        <View style={styles.debugBox}>
          <Text style={styles.debug}>Foto de perfil: {profilePhoto ? 'sí' : '(vacía)'}</Text>
          <Text style={styles.debug}>Foto del vehículo: {vehiclePhoto ? 'sí' : '(vacía)'}</Text>
          <Text style={styles.debug}>Fecha: {formatDate(birthDate) || '(vacía)'}</Text>
          <Text style={styles.debug}>Género: {gender || '(vacío)'}</Text>
        </View>
      </ScrollView>
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
  valid: { ...typography.bodyStrong, color: colors.success },
  debugBox: { gap: 2 },
  debug: { ...typography.caption, color: colors.textMuted },
});
