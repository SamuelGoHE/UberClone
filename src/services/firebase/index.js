import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CONCEPTO: la configuración de Firebase se lee del .env (variables con prefijo EXPO_PUBLIC_).
// Esas llaves son públicas por diseño: la seguridad real la dan las reglas de Firestore.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Si falta una variable, Firebase falla más adelante con mensajes poco claros: se avisa aquí.
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length > 0) {
  throw new Error(`Faltan variables de Firebase en el .env: ${missing.join(', ')}`);
}

// Con la recarga rápida este archivo se ejecuta varias veces: se reutiliza la app ya creada.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// CONCEPTO: en React Native la sesión de Auth se guarda en AsyncStorage para que siga
// abierta al cerrar y volver a abrir la app.
function createAuth() {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // Con la recarga rápida ya estaba inicializado: se devuelve la instancia existente.
    if (error.code === 'auth/already-initialized') return getAuth(app);
    // Cualquier otro error es real: se relanza para no esconderlo.
    throw error;
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
