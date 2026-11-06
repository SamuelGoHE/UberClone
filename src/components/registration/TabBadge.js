import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme/colors';

// CONCEPTO: ícono de una pestaña del registro, igual que en el diseño. Tiene tres estados:
//   completa  -> círculo verde con un check
//   activa    -> círculo negro con el número (la pestaña que se está viendo)
//   pendiente -> círculo claro con borde y el número
// Es un componente de presentación: recibe todo por props y no sabe nada del registro.
export default function TabBadge({ number, done, focused }) {
  return (
    <View style={[styles.badge, done ? styles.done : focused ? styles.active : styles.pending]}>
      {done ? (
        <View style={styles.check} />
      ) : (
        <Text style={[styles.number, focused ? styles.numberActive : styles.numberPending]}>{number}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { backgroundColor: colors.success },
  active: { backgroundColor: colors.primary },
  pending: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  number: { ...typography.caption, fontWeight: '600' },
  numberActive: { color: colors.onPrimary },
  numberPending: { color: colors.textMuted },
  // Check dibujado con dos bordes de un rectángulo girado (sin librería de íconos).
  check: {
    width: 6,
    height: 11,
    marginTop: -2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.onPrimary,
    transform: [{ rotate: '45deg' }],
  },
});
