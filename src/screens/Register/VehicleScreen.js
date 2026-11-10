import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryField from '../../components/forms/CategoryField';
import FormField from '../../components/forms/FormField';
import PhotoField from '../../components/forms/PhotoField';
import SelectField from '../../components/forms/SelectField';
import { CATEGORY_OPTIONS, VEHICLE_COLORS } from '../../constants/registration';
import { useRegistration } from '../../context/RegistrationContext';
import { normalizePlate } from '../../utils/validators';
import { colors, spacing, typography } from '../../theme/colors';

// Pestaña 2 del registro. Los datos viven en RegistrationContext (compartido con las otras pestañas);
// aquí solo se decide qué errores mostrar. Misma regla que Datos personales: en campos de texto el
// error aparece al salir del campo; en las listas, la foto y las tarjetas, al elegir.
export default function VehicleScreen() {
  const { vehicle, setVehicleField, vehicleErrors, isVehicleComplete } = useRegistration();
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  const errorOf = (field) => (touched[field] ? vehicleErrors[field] : undefined);

  const textProps = (field) => ({
    value: vehicle[field],
    onChangeText: (text) => setVehicleField(field, text),
    onBlur: () => touch(field),
    error: errorOf(field),
  });
  const digitsProps = (field) => ({
    ...textProps(field),
    onChangeText: (text) => setVehicleField(field, text.replace(/\D/g, '')),
    keyboardType: 'number-pad',
  });
  const choose = (field) => (next) => {
    setVehicleField(field, next);
    touch(field);
  };

  // La capacidad depende de la categoría (XL exige mínimo 6): si el conductor ya escribió una
  // capacidad y cambia de categoría, el error se evalúa de inmediato.
  function chooseCategory(next) {
    setVehicleField('category', next);
    touch('category');
    if (vehicle.capacity !== '') touch('capacity');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <CategoryField
            label="Categoría"
            value={vehicle.category}
            options={CATEGORY_OPTIONS}
            onChange={chooseCategory}
            error={errorOf('category')}
            hint="XL exige una capacidad mínima de 6 pasajeros."
          />

          <FormField
            label="Placa"
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            {...textProps('plate')}
            // La placa se guarda en mayúsculas y sin espacios, como pide el enunciado.
            onChangeText={(text) => setVehicleField('plate', normalizePlate(text).replace(/\s/g, ''))}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Marca" placeholder="Chevrolet" maxLength={30} {...textProps('brand')} />
            </View>
            <View style={styles.half}>
              <FormField label="Modelo" placeholder="Spark GT" maxLength={30} {...textProps('model')} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Año" placeholder="2021" maxLength={4} {...digitsProps('year')} />
            </View>
            <View style={styles.half}>
              <SelectField
                label="Color"
                value={vehicle.color}
                options={VEHICLE_COLORS}
                onChange={choose('color')}
                error={errorOf('color')}
                placeholder="Elige"
              />
            </View>
          </View>

          <FormField
            label="Capacidad de pasajeros"
            placeholder="Número de pasajeros"
            maxLength={2}
            {...digitsProps('capacity')}
          />

          <PhotoField
            label="Foto del vehículo"
            addText="Agregar foto del vehículo"
            helper="Debe verse la placa."
            value={vehicle.photo}
            onChange={choose('photo')}
            error={errorOf('photo')}
          />

          {/* Provisional: la barra de envío con el progreso (N de 3) llega en un paso posterior. */}
          <View style={styles.status}>
            <Text style={[styles.statusText, isVehicleComplete && styles.statusDone]}>
              {isVehicleComplete ? '✓ Vehículo completo' : 'Faltan datos por completar'}
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
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  half: { flex: 1 },
  status: { alignItems: 'center', paddingVertical: spacing.sm },
  statusText: { ...typography.caption, color: colors.textMuted },
  statusDone: { ...typography.bodyStrong, color: colors.success },
});
