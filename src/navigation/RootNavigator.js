import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import CreateAccountScreen from '../screens/Auth/CreateAccountScreen';
import PendingApprovalScreen from '../screens/Register/PendingApprovalScreen';
import DrawerNavigator from './DrawerNavigator';
import RegistrationTabs from './RegistrationTabs';
import TripDetailScreen from '../screens/History/TripDetailScreen';
import SummaryScreen from '../screens/Summary/SummaryScreen';
import TripScreen from '../screens/Trip/TripScreen';
import { useAuth } from '../context/AuthContext';
import { useActiveTrip } from '../context/TripContext';
import { DRIVER_STATUS } from '../constants/driverStatus';
import { TRIP_STATUS } from '../constants/tripStatus';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background } };

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// CONCEPTO: un solo navegador con pantallas definidas según la situación del conductor.
// React Navigation muestra la primera pantalla disponible y cambia solo cuando cambia la sesión
// o el perfil: por eso aquí nunca se llama a navigation.navigate para entrar o salir.
//   cargando            -> Loading
//   sin sesión          -> Login / CreateAccount
//   sesión sin perfil   -> Registration (las 3 pestañas)
//   perfil aprobado     -> Main (el menú lateral, con Inicio) y TripDetail (el detalle de un viaje del Historial,
//                          que se abre encima del menú con navigate('TripDetail', { tripId }))
//   aprobado y con un viaje en marcha -> ActiveTrip (reemplaza al Inicio hasta que el viaje termine)
//   aprobado y con un viaje terminado por cobrar -> TripSummary (el resumen del cobro)
//   perfil en revisión  -> PendingApproval
// El NavigationContainer va una sola vez en toda la app.
export default function RootNavigator() {
  const { user, driver, loading: authLoading } = useAuth();
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  // Se espera también a saber si hay un viaje en marcha, para no mostrar el Inicio un instante y saltar al viaje.
  const loading = authLoading || tripLoading;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          </>
        ) : !driver ? (
          <Stack.Screen name="Registration" component={RegistrationTabs} />
        ) : driver.status === DRIVER_STATUS.APPROVED ? (
          activeTrip ? (
            activeTrip.status === TRIP_STATUS.COMPLETED ? (
              <Stack.Screen name="TripSummary" component={SummaryScreen} />
            ) : (
              <Stack.Screen name="ActiveTrip" component={TripScreen} />
            )
          ) : (
            <>
              <Stack.Screen name="Main" component={DrawerNavigator} />
              <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            </>
          )
        ) : (
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
