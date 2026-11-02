import { useRef, useState } from 'react';
import { Image, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/colors';

// CONCEPTO: campo de foto controlado, igual que SelectField y DateField. value es la ruta de la foto
// en el celular (o null) y el componente avisa con onChange(uri). La foto todavía NO se sube a ningún
// lado: eso lo hace otro paso. shape 'circle' sirve para el perfil y 'rect' para el vehículo.
export default function PhotoField({
  label,
  value,
  onChange,
  error,
  shape = 'rect',
  addText = 'Agregar foto',
  helper,
}) {
  const [open, setOpen] = useState(false);
  const [pickerError, setPickerError] = useState(null);
  const insets = useSafeAreaInsets();
  const circle = shape === 'circle';
  // La foto del perfil se recorta cuadrada (va en un círculo); la del vehículo, apaisada.
  const aspect = circle ? [1, 1] : [4, 3];
  const shownError = error ?? pickerError;

  function openSheet() {
    Keyboard.dismiss();
    setPickerError(null);
    setOpen(true);
  }

  // CONCEPTO: en iPhone no se puede abrir la cámara o la galería mientras la hoja todavía se está
  // cerrando: la petición se pierde sin dar error. Por eso la acción se guarda y se ejecuta cuando
  // el Modal avisa que ya terminó de cerrarse (onDismiss). Android no tiene ese aviso ni lo necesita.
  const pendingAction = useRef(null);

  function closeThen(action) {
    if (Platform.OS === 'ios') {
      pendingAction.current = action;
      setOpen(false);
    } else {
      setOpen(false);
      action();
    }
  }

  function handleDismiss() {
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) action();
  }

  // Los permisos y errores se muestran debajo del campo, no en un Alert.
  async function takePhoto() {
    try {
      // La cámara siempre pide permiso al usuario.
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPickerError('Necesitamos permiso para usar la cámara. Actívalo en Ajustes.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect, quality: 0.7 });
      if (!result.canceled) onChange(result.assets[0].uri);
    } catch (error) {
      // Por ejemplo, el simulador de Mac no tiene cámara.
      if (__DEV__) console.warn('PhotoField cámara:', error.message);
      setPickerError('No pudimos abrir la cámara en este dispositivo.');
    }
  }

  async function chooseFromGallery() {
    try {
      // Para fotos, la galería no necesita permiso previo.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 0.7,
      });
      if (!result.canceled) onChange(result.assets[0].uri);
    } catch (error) {
      if (__DEV__) console.warn('PhotoField galería:', error.message);
      setPickerError('No pudimos abrir la galería.');
    }
  }

  function removePhoto() {
    setOpen(false);
    onChange(null);
  }

  const cameraIcon = (
    <View style={styles.cameraBody}>
      <View style={styles.cameraLens} />
    </View>
  );

  return (
    <View style={[styles.container, circle && styles.containerCircle]}>
      {circle ? null : <Text style={styles.label}>{label}</Text>}

      {circle ? (
        <Pressable
          style={[styles.avatar, !value && styles.dashed, shownError ? styles.boxError : null]}
          onPress={openSheet}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? 'foto seleccionada' : 'sin foto'}`}
        >
          {value ? <Image source={{ uri: value }} style={styles.avatarImage} /> : cameraIcon}
        </Pressable>
      ) : (
        <Pressable
          style={[styles.box, !value && styles.dashed, value && styles.boxFilled, shownError ? styles.boxError : null]}
          onPress={openSheet}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? 'foto seleccionada' : 'sin foto'}`}
        >
          {value ? (
            <>
              <Image source={{ uri: value }} style={styles.thumbnail} />
              <View style={styles.info}>
                <Text style={styles.strong}>Foto seleccionada</Text>
                <Text style={styles.caption}>Cambiar foto</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyContent}>
              {cameraIcon}
              <Text style={styles.strong}>{addText}</Text>
              {helper ? <Text style={styles.caption}>{helper}</Text> : null}
            </View>
          )}
        </Pressable>
      )}

      {circle ? (
        <View style={styles.circleTexts}>
          <Text style={styles.strong}>{value ? 'Cambiar foto' : addText}</Text>
          {helper && !value ? <Text style={styles.captionCenter}>{helper}</Text> : null}
        </View>
      ) : null}

      {shownError ? (
        <Text style={[styles.error, circle && styles.captionCenter]} accessibilityLiveRegion="polite">
          {shownError}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        onDismiss={handleDismiss}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{label}</Text>
          <Pressable style={styles.option} onPress={() => closeThen(takePhoto)} accessibilityRole="button">
            <Text style={styles.optionText}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => closeThen(chooseFromGallery)} accessibilityRole="button">
            <Text style={styles.optionText}>Elegir de la galería</Text>
          </Pressable>
          {value ? (
            <Pressable style={styles.option} onPress={removePhoto} accessibilityRole="button">
              <Text style={[styles.optionText, styles.remove]}>Quitar foto</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.cancel} onPress={() => setOpen(false)} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  containerCircle: { alignItems: 'center' },
  label: { ...typography.bodyStrong, color: colors.text },
  dashed: { borderStyle: 'dashed' },
  boxError: { borderColor: colors.danger },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { flexDirection: 'row', justifyContent: 'flex-start', gap: spacing.md, padding: spacing.md },
  emptyContent: { alignItems: 'center', gap: spacing.xs },
  thumbnail: { width: 96, height: 72, borderRadius: radius.md, backgroundColor: colors.border },
  info: { gap: 2 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 96, height: 96 },
  circleTexts: { alignItems: 'center', gap: 2, marginTop: spacing.xs },
  strong: { ...typography.bodyStrong, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  captionCenter: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  error: { ...typography.caption, color: colors.danger },
  // Ícono de cámara dibujado con Views: un cuerpo redondeado con un círculo (el lente) dentro.
  cameraBody: {
    width: 30,
    height: 22,
    borderWidth: 1.8,
    borderColor: colors.textMuted,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.8, borderColor: colors.textMuted },
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
  option: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  optionText: { ...typography.body, color: colors.text },
  remove: { color: colors.danger },
  cancel: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  cancelText: { ...typography.bodyStrong, color: colors.text },
});
