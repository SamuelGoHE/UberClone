import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SubmitBar from '../components/registration/SubmitBar';
import TabBadge from '../components/registration/TabBadge';
import PersonalDataScreen from '../screens/Register/PersonalDataScreen';
import VehicleScreen from '../screens/Register/VehicleScreen';
import DocumentsScreen from '../screens/Register/DocumentsScreen';
import { useAuth } from '../context/AuthContext';
import { RegistrationProvider, useRegistration } from '../context/RegistrationContext';
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

// CONCEPTO: el ícono de cada pestaña lee el estado del registro (por eso vive dentro del proveedor) y
// muestra su número o, si la pestaña está completa, un check verde.
function TabIcon({ number, tab, focused }) {
  const { isPersonalComplete, isVehicleComplete } = useRegistration();
  const done = { personal: isPersonalComplete, vehicle: isVehicleComplete, documents: false }[tab];
  return <TabBadge number={number} done={done} focused={focused} />;
}

// CONCEPTO: el registro se divide en tres pestañas (Tab Navigator). Cada pestaña es una pantalla; el
// conductor puede cambiar entre ellas sin perder lo que ya escribió, porque los datos viven en
// RegistrationProvider, que envuelve a las tres. La barra de envío va en un tabBar personalizado:
// así es parte del navegador y se ve igual en todas las pestañas, justo encima de ellas.
export default function RegistrationTabs() {
  return (
    <RegistrationProvider>
      <Tab.Navigator
        tabBar={(props) => (
          <View>
            <SubmitBar />
            <BottomTabBar {...props} />
          </View>
        )}
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
        <Tab.Screen
          name="PersonalData"
          component={PersonalDataScreen}
          options={{
            tabBarLabel: 'Datos personales',
            tabBarIcon: ({ focused }) => <TabIcon number={1} tab="personal" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Vehicle"
          component={VehicleScreen}
          options={{
            tabBarLabel: 'Vehículo',
            tabBarIcon: ({ focused }) => <TabIcon number={2} tab="vehicle" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Documents"
          component={DocumentsScreen}
          options={{
            tabBarLabel: 'Documentos',
            tabBarIcon: ({ focused }) => <TabIcon number={3} tab="documents" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </RegistrationProvider>
  );
}

const styles = StyleSheet.create({
  signOut: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  signOutText: { ...typography.bodyStrong, color: colors.text },
});
