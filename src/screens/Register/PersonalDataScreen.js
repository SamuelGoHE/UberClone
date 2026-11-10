import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateField from '../../components/forms/DateField';
import FormField from '../../components/forms/FormField';
import PhotoField from '../../components/forms/PhotoField';
import SegmentedField from '../../components/forms/SegmentedField';
import SelectField from '../../components/forms/SelectField';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from '../../constants/registration';
import { useAuth } from '../../context/AuthContext';
import { useRegistration } from '../../context/RegistrationContext';
import { colors, spacing, typography } from '../../theme/colors';

// Pestaña 1 del registro. Los datos viven en RegistrationContext (compartido con las otras pestañas);
// aquí solo se decide qué errores mostrar.
export default function PersonalDataScreen() {
  const { user } = useAuth();
  const { personal, setPersonalField, personalErrors, isPersonalComplete } = useRegistration();
  // touched = campos que el conductor ya tocó. El error de un campo solo se muestra cuando está tocado.
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  const errorOf = (field) => (touched[field] ? personalErrors[field] : undefined);

  // CONCEPTO: regla de errores de la pestaña. En campos de texto, el error aparece al SALIR del campo
  // (onBlur), nunca mientras se escribe el primer carácter; una vez visible, se actualiza al escribir.
  // En la foto, la fecha y las listas, el error aparece cuando el conductor ya eligió algo.
  const textProps = (field) => ({
    value: personal[field],
    onChangeText: (text) => setPersonalField(field, text),
    onBlur: () => touch(field),
    error: errorOf(field),
  });
  // Documento y celular solo aceptan dígitos: se descarta cualquier otro carácter al escribir.
  const digitsProps = (field) => ({
    ...textProps(field),
    onChangeText: (text) => setPersonalField(field, text.replace(/\D/g, '')),
    keyboardType: 'number-pad',
  });
  const choose = (field) => (next) => {
    setPersonalField(field, next);
    touch(field);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PhotoField
            label="Foto de perfil"
            shape="circle"
            addText="Agregar foto de perfil"
            helper="Desde la cámara o la galería. Es obligatoria."
            value={personal.photo}
            onChange={choose('photo')}
            error={errorOf('photo')}
          />

          <FormField
            label="Nombre completo"
            placeholder="Como aparece en tu documento"
            maxLength={50}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            {...textProps('fullName')}
          />
          <FormField label="Documento de identidad" placeholder="6 a 10 dígitos" maxLength={10} {...digitsProps('document')} />
          <FormField label="Número de celular" placeholder="10 dígitos" maxLength={10} {...digitsProps('phone')} />

          <DateField
            label="Fecha de nacimiento"
            value={personal.birthDate}
            onChange={choose('birthDate')}
            error={errorOf('birthDate')}
          />
          <SelectField
            label="Género"
            value={personal.gender}
            options={GENDER_OPTIONS}
            onChange={choose('gender')}
            error={errorOf('gender')}
          />

          {/* El correo viene de la cuenta: se muestra, pero no se puede cambiar. */}
          <FormField
            label="Correo electrónico"
            value={user?.email ?? ''}
            editable={false}
            style={styles.readOnly}
          />

          <SegmentedField
            label="Idioma"
            value={personal.language}
            options={LANGUAGE_OPTIONS}

            onChange={(next) => setPersonalField('language', next)}
          />

          {/* Provisional: la barra de envío con el progreso (N de 3) llega en un paso posterior. */}
          <View style={styles.status}>
            <Text style={[styles.statusText, isPersonalComplete && styles.statusDone]}>
              {isPersonalComplete ? '✓ Datos personales completos' : 'Faltan datos por completar'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  readOnly: { backgroundColor: colors.background, color: colors.textMuted },
  status: { alignItems: 'center', paddingVertical: spacing.sm },
  statusText: { ...typography.caption, color: colors.textMuted },
  statusDone: { ...typography.bodyStrong, color: colors.success },
});
