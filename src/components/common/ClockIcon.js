import { StyleSheet, View } from 'react-native';

// Reloj dibujado con Views (la app no usa librería de íconos): un círculo con dos manecillas.
// Se usa en el estado "pendiente" del resumen del cobro y en el mensaje de historial vacío.
export default function ClockIcon({ color, size = 28 }) {
  const hand = Math.max(2, size / 11);
  return (
    <View style={[styles.face, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: hand }]}>
      <View style={{ position: 'absolute', width: hand, height: size * 0.32, top: size * 0.1, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: size * 0.25, height: hand, left: size * 0.43, top: size * 0.43, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center' },
});
