import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme/colors';

// Pestaña 1 del registro. Pantalla vacía: el formulario llega en un paso posterior.
export default function PersonalDataScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Datos personales</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading, color: colors.text },
});
