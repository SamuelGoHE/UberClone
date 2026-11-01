import { useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '../../utils/formatDate';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Si el campo está vacío, el selector se abre 18 años atrás: abrirlo en hoy obligaría a retroceder décadas.
function defaultStartDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

// CONCEPTO: campo de fecha controlado, igual que SelectField. value es un Date (o null) y el componente
// avisa con onChange(date). La regla de los 18 años NO vive aquí: la valida validateBirthDate.
// iPhone y Android muestran el selector distinto: en iPhone va dentro de una hoja con "Listo",
// en Android el sistema abre su propio cuadro de diálogo.
export default function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = 'DD/MM/AAAA',
  maximumDate = new Date(),
}) {
  const [open, setOpen] = useState(false); // solo iPhone: hoja visible
  const [draft, setDraft] = useState(null); // solo iPhone: fecha que se está girando, aún sin confirmar
  const insets = useSafeAreaInsets();
  const text = formatDate(value);

  function openPicker() {
    Keyboard.dismiss();
    const start = value ?? defaultStartDate();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: start,
        mode: 'date',
        maximumDate,
        onChange: (event, date) => {
          // 'dismissed' = el usuario cerró el diálogo sin elegir: no se cambia nada.
          if (event.type === 'set' && date) onChange(date);
        },
      });
      return;
    }
    setDraft(start);
    setOpen(true);
  }

  function confirm() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.box, error ? styles.boxError : null]}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${text || placeholder}`}
      >
        <Text style={[styles.value, !text && styles.placeholder]} numberOfLines={1}>
          {text || placeholder}
        </Text>
        <View style={styles.calendar}>
          <View style={styles.calendarBar} />
        </View>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar" />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <DateTimePicker
              value={draft ?? defaultStartDate()}
              mode="date"
              display="spinner"
              locale="es-CO"
              maximumDate={maximumDate}
              themeVariant="light"
              textColor={colors.text}
              onChange={(event, date) => {
                if (date) setDraft(date);
              }}
            />
            <View style={styles.actions}>
              <Pressable style={[styles.action, styles.cancel]} onPress={() => setOpen(false)} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.action, styles.accept]} onPress={confirm} accessibilityRole="button">
                <Text style={styles.acceptText}>Listo</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.bodyStrong, color: colors.text },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  boxError: { borderColor: colors.danger },
  value: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  // Ícono de calendario dibujado con Views: un recuadro con una franja arriba (sin librería de íconos).
  calendar: {
    width: 20,
    height: 18,
    borderWidth: 1.8,
    borderColor: colors.textMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  calendarBar: { height: 5, backgroundColor: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md },
  cancel: { backgroundColor: colors.background },
  cancelText: { ...typography.bodyStrong, color: colors.text },
  accept: { backgroundColor: colors.primary },
  acceptText: { ...typography.bodyStrong, color: colors.onPrimary },
});
