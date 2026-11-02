import { Pressable, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/Register/PersonalDataScreen';
import VehicleScreen from '../screens/Register/VehicleScreen';
import DocumentsScreen from '../screens/Register/DocumentsScreen';
import { useAuth } from '../context/AuthContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import { colors, spacing, typography } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Provisional: sin esta salida, quien se equivoca de cuenta durante el registro no podría cerrar sesión.
function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Pressable onPress={signOut} style={styles.signOut} accessibilityRole="button">
      <Text style={styles.signOutText}>Cerrar sesión</Text>
    </Pressable>
  );
}

// CONCEPTO: el registro se divide en tres pestañas (Tab Navigator). Cada pestaña es una
// pantalla; el conductor puede cambiar entre ellas sin perder lo que ya escribió en las otras,
// porque los datos viven en RegistrationProvider, que envuelve a las tres.
// Los números y el check del diseño se agregan cuando exista la barra de progreso.
export default function RegistrationTabs() {
  return (
    <RegistrationProvider>
      <Tab.Navigator
        screenOptions={{
          headerTitle: 'Registro de conductor',
          headerRight: () => <SignOutButton />,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { ...typography.heading, color: colors.text },
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { ...typography.caption },
        }}
      >
        <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={{ tabBarLabel: 'Datos personales' }} />
        <Tab.Screen name="Vehicle" component={VehicleScreen} options={{ tabBarLabel: 'Vehículo' }} />
        <Tab.Screen name="Documents" component={DocumentsScreen} options={{ tabBarLabel: 'Documentos' }} />
      </Tab.Navigator>
    </RegistrationProvider>
  );
}

const styles = StyleSheet.create({
  signOut: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  signOutText: { ...typography.bodyStrong, color: colors.text },
});
