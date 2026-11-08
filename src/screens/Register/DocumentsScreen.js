import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckboxField from '../../components/forms/CheckboxField';
import DateField from '../../components/forms/DateField';
import FormField from '../../components/forms/FormField';
import PhotoField from '../../components/forms/PhotoField';
import { PRICING } from '../../config/pricing';
import { useRegistration } from '../../context/RegistrationContext';
import { requiresTechnicalReview } from '../../utils/documentValidators';
import { colors, spacing, typography } from '../../theme/colors';

// Pestaña 3 del registro. Los datos viven en RegistrationContext; aquí solo se decide qué errores mostrar.
// Misma regla que las otras pestañas: en campos de texto el error aparece al salir del campo; en las
// fotos, las fechas y la casilla, al elegir.
export default function DocumentsScreen() {
  const { documents, setDocumentField, documentsErrors, isDocumentsComplete, vehicle } = useRegistration();
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  const errorOf = (field) => (touched[field] ? documentsErrors[field] : undefined);
  const choose = (field) => (next) => {
    setDocumentField(field, next);
    touch(field);
  };
  const textProps = (field) => ({
    value: documents[field],
    onChangeText: (text) => setDocumentField(field, text),
    onBlur: () => touch(field),
    error: errorOf(field),
  });

  const needsTechnicalReview = requiresTechnicalReview(vehicle.year);
  // La comisión sale de la configuración de tarifas: si cambia allá, cambia aquí.
  const commissionPercent = `${Math.round(PRICING.commissionRate * 100)} %`;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Licencia de conducción</Text>
          <FormField
            label="Número de licencia"
            placeholder="Como aparece en tu licencia"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            {...textProps('licenseNumber')}
          />
          <PhotoField
            label="Foto de la licencia"
            addText="Agregar foto de la licencia"
            helper="Que se lean los datos."
            value={documents.licensePhoto}
            onChange={choose('licensePhoto')}
            error={errorOf('licensePhoto')}
          />
          <DateField
            label="Vencimiento de la licencia"
            kind="expiry"
            value={documents.licenseExpiry}
            onChange={choose('licenseExpiry')}
            error={errorOf('licenseExpiry')}
          />

          <Text style={styles.section}>SOAT</Text>
          <PhotoField
            label="Foto del SOAT"
            addText="Agregar foto del SOAT"
            helper="Que se vea la fecha de vigencia."
            value={documents.soatPhoto}
            onChange={choose('soatPhoto')}
            error={errorOf('soatPhoto')}
          />
          <DateField
            label="Vencimiento del SOAT"
            kind="expiry"
            value={documents.soatExpiry}
            onChange={choose('soatExpiry')}
            error={errorOf('soatExpiry')}
          />

          <Text style={styles.section}>Revisión técnico-mecánica</Text>
          {needsTechnicalReview ? (
            <>
              <PhotoField
                label="Foto de la revisión"
                addText="Agregar foto de la revisión"
                value={documents.techPhoto}
                onChange={choose('techPhoto')}
                error={errorOf('techPhoto')}
              />
              <DateField
                label="Vencimiento de la revisión"
                kind="expiry"
                value={documents.techExpiry}
                onChange={choose('techExpiry')}
                error={errorOf('techExpiry')}
              />
            </>
          ) : (
            <Text style={styles.note}>
              {vehicle.year
                ? `No aplica para tu vehículo (modelo ${vehicle.year}).`
                : 'Completa el año de tu vehículo (pestaña Vehículo) para saber si aplica.'}
            </Text>
          )}

          <Text style={styles.section}>Pagos</Text>
          <FormField
            label="Correo de tu cuenta de Mercado Pago"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            {...textProps('mercadoPagoEmail')}
          />
          <Text style={styles.note}>
            Aquí recibirás tus pagos. No guardamos números de tarjeta ni de cuenta bancaria.
          </Text>

          <CheckboxField
            label="Acepto los términos y condiciones"
            detail={`La plataforma cobra una comisión del ${commissionPercent} sobre la tarifa de cada viaje. Las propinas son completas para ti.`}
            checked={documents.acceptedTerms}
            onChange={choose('acceptedTerms')}
            error={errorOf('acceptedTerms')}
          />

          <View style={styles.status}>
            <Text style={[styles.statusText, isDocumentsComplete && styles.statusDone]}>
              {isDocumentsComplete ? '✓ Documentos completos' : 'Faltan datos por completar'}
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
  section: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  note: { ...typography.caption, color: colors.textMuted },
  status: { alignItems: 'center', paddingVertical: spacing.sm },
  statusText: { ...typography.caption, color: colors.textMuted },
  statusDone: { ...typography.bodyStrong, color: colors.success },
});
