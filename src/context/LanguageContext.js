// AI-assisted: see docs/AI_LOG.md #30
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, translate } from '../i18n/translations';
import { updateDriverProfile } from '../services/firebase/drivers';
import { useAuth } from './AuthContext';

// CONCEPTO: Context del idioma. Comparte con toda la app el idioma elegido y la función t() para traducir textos.
// La preferencia se guarda en AsyncStorage (el enunciado lo permite para el idioma: una preferencia, nunca datos
// sensibles) y también en el perfil del conductor (drivers/{uid}.language). Al abrir la app se usa, en orden: lo
// guardado en el celular, el idioma que el conductor eligió al registrarse, y si no hay nada, español.
const STORAGE_KEY = 'uberclone.language';
const LanguageContext = createContext(null);

const isSupported = (value) => LANGUAGES.includes(value);

export function LanguageProvider({ children }) {
  const { user, driver } = useAuth();
  const [language, setLanguageState] = useState('es');
  // Si el conductor ya eligió idioma en esta sesión, no se pisa con lo que llegue después del perfil.
  const chosen = useRef(false);

  // 1. Lo guardado en el celular.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isSupported(stored) && !chosen.current) {
          chosen.current = true;
          setLanguageState(stored);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Si no había nada guardado, el idioma del registro.
  const profileLanguage = driver?.language;
  useEffect(() => {
    if (!chosen.current && isSupported(profileLanguage)) setLanguageState(profileLanguage);
  }, [profileLanguage]);

  const uid = user?.uid;
  const setLanguage = useCallback(
    (next) => {
      if (!isSupported(next)) return;
      chosen.current = true;
      setLanguageState(next); // el cambio se ve al instante
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      // Si no se puede guardar en el perfil no pasa nada grave: la preferencia ya quedó en el celular.
      if (uid && driver) updateDriverProfile(uid, { language: next }).catch(() => {});
    },
    [uid, driver],
  );

  const t = useCallback((key, vars) => translate(language, key, vars), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return context;
}
