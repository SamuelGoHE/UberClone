import { useEffect, useRef } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useAvailability from '../../hooks/useAvailability';
import useDriverLocation from '../../hooks/useDriverLocation';
import { updateDriverLocation } from '../../services/firebase/locations';
import { colors, radius, spacing, typography } from '../../theme/colors';

// Centro de Medellín: el mapa abre aquí mientras llega la ubicación real del conductor.
const FALLBACK_REGION = { latitude: 6.2442, longitude: -75.5812, latitudeDelta: 0.05, longitudeDelta: 0.05 };

// Pantalla de Inicio: el mapa con la ubicación del conductor y el interruptor Disponible / No disponible.
// Mientras está disponible, su ubicación se guarda en Firestore cada pocos segundos; al pasar a
// No disponible o al salir de la pantalla, el seguimiento se detiene (lo hace useDriverLocation).
export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const centeredRef = useRef(false);

  const { available, ready, error: availabilityError, setAvailable } = useAvailability(user.uid);
  const { location, permission } = useDriverLocation({
    active: available,
    onLocation: (coords) => updateDriverLocation(user.uid, coords).catch(() => {}),
  });

  // La primera vez que llega la ubicación, el mapa se centra en el conductor.
  useEffect(() => {
    if (!location || centeredRef.current || !mapRef.current) return;
    centeredRef.current = true;
    mapRef.current.animateToRegion(
      { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      600,
    );
  }, [location]);

  // Sin permiso de ubicación no se puede estar disponible: si el permiso se retira, se apaga el interruptor.
  useEffect(() => {
    if (permission === 'denied' && available) setAvailable(false);
  }, [permission, available, setAvailable]);

  const permissionDenied = permission === 'denied';
  const switchDisabled = !ready || permission !== 'granted';

  let subtitle = 'Activa el interruptor para recibir viajes';
  if (available) subtitle = location ? 'Buscando solicitudes cerca de ti' : 'Obteniendo tu ubicación…';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={FALLBACK_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {/* Halo verde alrededor del conductor mientras está disponible, como en el diseño. */}
        {available && location ? (
          <Circle
            center={{ latitude: location.lat, longitude: location.lng }}
            radius={150}
            fillColor="rgba(6, 193, 103, 0.16)"
            strokeColor="rgba(6, 193, 103, 0.45)"
            strokeWidth={1}
          />
        ) : null}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
        >
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
        </Pressable>
        <View style={styles.pill}>
          <View style={[styles.pillDot, { backgroundColor: available ? colors.success : colors.textMuted }]} />
          <Text style={styles.pillText}>{available ? 'En línea' : 'Fuera de línea'}</Text>
        </View>
        {/* Espacio del mismo ancho que el botón, para que la píldora quede centrada. */}
        <View style={styles.menuSpacer} />
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <View style={styles.headings}>
          <Text style={styles.title}>{available ? 'Estás disponible' : 'No estás disponible'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {permissionDenied ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Necesitamos tu ubicación para ponerte disponible. Actívala en Ajustes.
            </Text>
            <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
              <Text style={styles.warningLink}>Abrir Ajustes</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.switchRow}>
          <View style={styles.switchTexts}>
            <Text style={styles.switchTitle}>{available ? 'Disponible' : 'No disponible'}</Text>
            <Text style={styles.switchHint}>
              {available ? 'Recibirás solicitudes de viaje' : 'No recibirás solicitudes'}
            </Text>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            disabled={switchDisabled}
            trackColor={{ false: colors.border, true: colors.success }}
            ios_backgroundColor={colors.border}
            accessibilityLabel="Disponible"
          />
        </View>

        {availabilityError ? <Text style={styles.error}>{availabilityError}</Text> : null}

        <View style={styles.account}>
          <View style={styles.accountDot} />
          <Text style={styles.accountText}>Cuenta aprobada</Text>
        </View>
      </View>
    </View>
  );
}

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    ...SHADOW,
  },
  menuSpacer: { width: 48 },
  // Las tres rayas del botón de menú, dibujadas con Views (sin librería de íconos).
  menuBar: { width: 18, height: 2, borderRadius: 1, backgroundColor: colors.primary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...SHADOW,
  },
  pillDot: { width: 10, height: 10, borderRadius: 5 },
  pillText: { ...typography.bodyStrong, color: colors.text },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    ...SHADOW,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  headings: { gap: 4 },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted },
  warning: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: '#FDF3E1' },
  warningText: { ...typography.caption, color: colors.text },
  warningLink: { ...typography.bodyStrong, color: colors.text },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  switchTexts: { flex: 1, gap: 2 },
  switchTitle: { ...typography.bodyStrong, color: colors.text },
  switchHint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
  account: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accountDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  accountText: { ...typography.caption, color: colors.textMuted },
});
