import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { REQUIRED_TABS } from '../constants/registration';
import { useAuth } from './AuthContext';
import { uploadImage } from '../services/cloudinary';
import { saveDriverRegistration } from '../services/firebase/drivers';
import { buildDriverRecord } from '../utils/buildDriverRecord';
import { validatePersonalData, validateVehicleData } from '../utils/validators';

const RegistrationContext = createContext(null);

const initialState = {
  personal: {
    photo: null,
    fullName: '',
    document: '',
    phone: '',
    birthDate: null,
    gender: '',
    language: 'es',
  },
  vehicle: {
    category: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    capacity: '',
    photo: null,
  },
};

// CONCEPTO: useReducer centraliza cómo cambia el estado. La pantalla no modifica el estado directamente:
// envía una acción (dispatch) y el reducer, una función pura, devuelve el estado nuevo.
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PERSONAL_FIELD':
      return { ...state, personal: { ...state.personal, [action.field]: action.value } };
    case 'SET_VEHICLE_FIELD':
      return { ...state, vehicle: { ...state.vehicle, [action.field]: action.value } };
    default:
      return state;
  }
}

// CONCEPTO: las pestañas del registro comparten este estado. Así lo que se escribe en una
// pestaña no se pierde al cambiar a otra, se sabe cuáles están completas y se puede enviar todo junto.
export function RegistrationProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const setPersonalField = useCallback(
    (field, value) => dispatch({ type: 'SET_PERSONAL_FIELD', field, value }),
    [],
  );
  const setVehicleField = useCallback(
    (field, value) => dispatch({ type: 'SET_VEHICLE_FIELD', field, value }),
    [],
  );

  // Errores actuales de cada campo (objeto vacío = la pestaña está completa). Se recalculan solo
  // cuando cambian los datos. Qué errores se muestran lo decide cada pantalla.
  const personalErrors = useMemo(() => validatePersonalData(state.personal), [state.personal]);
  const isPersonalComplete = Object.keys(personalErrors).length === 0;
  const vehicleErrors = useMemo(() => validateVehicleData(state.vehicle), [state.vehicle]);
  const isVehicleComplete = Object.keys(vehicleErrors).length === 0;

  // El botón "Enviar registro" solo se habilita cuando las pestañas requeridas están completas.
  const completedTabs = (isPersonalComplete ? 1 : 0) + (isVehicleComplete ? 1 : 0);
  const canSubmit = completedTabs === REQUIRED_TABS;

  // Envía el registro: sube las dos fotos a Cloudinary, guarda el documento en Firestore con
  // status pending y listo. Al existir el documento, AuthContext lo detecta y la navegación lleva
  // sola a "En revisión": por eso no hay navigate aquí ni se vuelve a poner submitting en false.
  const submit = useCallback(async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [photoUrl, vehiclePhotoUrl] = await Promise.all([
        uploadImage(state.personal.photo),
        uploadImage(state.vehicle.photo),
      ]);
      const record = buildDriverRecord({
        personal: state.personal,
        vehicle: state.vehicle,
        email: user.email,
        photoUrl,
        vehiclePhotoUrl,
      });
      await saveDriverRegistration(user.uid, record);
    } catch (error) {
      if (__DEV__) console.warn('Enviar registro:', error.message);
      setSubmitError('No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.');
      setSubmitting(false);
    }
  }, [submitting, canSubmit, state.personal, state.vehicle, user]);

  const value = useMemo(
    () => ({
      personal: state.personal,
      setPersonalField,
      personalErrors,
      isPersonalComplete,
      vehicle: state.vehicle,
      setVehicleField,
      vehicleErrors,
      isVehicleComplete,
      completedTabs,
      canSubmit,
      submitting,
      submitError,
      submit,
    }),
    [
      state.personal,
      setPersonalField,
      personalErrors,
      isPersonalComplete,
      state.vehicle,
      setVehicleField,
      vehicleErrors,
      isVehicleComplete,
      completedTabs,
      canSubmit,
      submitting,
      submitError,
      submit,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration debe usarse dentro de RegistrationProvider');
  return context;
}
