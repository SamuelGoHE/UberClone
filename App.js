import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TripProvider } from './src/context/TripContext';
import RootNavigator from './src/navigation/RootNavigator';

// CONCEPTO: los proveedores envuelven la app de afuera hacia adentro. RootNavigator queda dentro
// de AuthProvider porque lee la sesión con useAuth, y TripProvider va dentro de AuthProvider porque
// necesita saber quién es el conductor para buscar su viaje en marcha.
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <TripProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
