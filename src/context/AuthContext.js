import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { subscribeToDriver } from '../services/firebase/drivers';

// CONCEPTO: un Context comparte datos con toda la app sin pasarlos pantalla por pantalla.
// Aquí se comparte quién está logueado (user), su perfil de conductor (driver) y si aún se está cargando.
const AuthContext = createContext(null);

// Códigos de error de Firebase -> mensaje que se muestra debajo del campo (nunca en un Alert).
const AUTH_ERRORS = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde.',
  'auth/network-request-failed': 'No hay conexión. Revisa tu internet.',
};
const UNKNOWN_ERROR = 'No pudimos iniciar sesión. Inténtalo de nuevo.';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  // loading = true mientras se restaura la sesión guardada y se trae el perfil del conductor.
  const [loading, setLoading] = useState(true);

  // CONCEPTO: onAuthStateChanged avisa cuando hay sesión, incluida la que se restaura al abrir la app.
  // Devuelve la función para cancelar la suscripción: el useEffect la retorna como limpieza.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true); // falta traer el perfil
      } else {
        setDriver(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Con sesión, se escucha en tiempo real el documento del conductor. Depende del uid:
  // si cambia el usuario, se cancela la suscripción anterior y se abre otra.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    const unsubscribe = subscribeToDriver(
      uid,
      (data) => {
        setDriver(data);
        setLoading(false);
      },
      () => {
        setDriver(null);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  // Devuelve null si salió bien o el mensaje de error. Si sale bien, onAuthStateChanged hace el resto.
  const signIn = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return null;
    } catch (error) {
      // Solo en desarrollo: muestra en la terminal el error real cuando no es uno conocido.
      if (__DEV__ && !AUTH_ERRORS[error.code]) console.warn('signIn error:', error.code, error.message);
      return AUTH_ERRORS[error.code] ?? UNKNOWN_ERROR;
    }
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  const value = useMemo(
    () => ({ user, driver, loading, signIn, signOut }),
    [user, driver, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
