import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import CreateAccountScreen from '../screens/Auth/CreateAccountScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import PendingApprovalScreen from '../screens/Register/PendingApprovalScreen';
import RegistrationTabs from './RegistrationTabs';
import { useAuth } from '../context/AuthContext';
import { DRIVER_STATUS } from '../constants/driverStatus';
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
//   perfil aprobado     -> Home
//   perfil en revisión  -> PendingApproval
// El NavigationContainer va una sola vez en toda la app.
export default function RootNavigator() {
  const { user, driver, loading } = useAuth();

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
          <Stack.Screen name="Home" component={HomeScreen} />
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
