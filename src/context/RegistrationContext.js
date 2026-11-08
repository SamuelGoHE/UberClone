import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { REQUIRED_TABS } from '../constants/registration';
import { useAuth } from './AuthContext';
import { uploadImage } from '../services/cloudinary';
import { saveDriverRegistration } from '../services/firebase/drivers';
import { buildDriverRecord } from '../utils/buildDriverRecord';
import { requiresTechnicalReview, validateDocumentsData } from '../utils/documentValidators';
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
  documents: {
    licenseNumber: '',
    licensePhoto: null,
    licenseExpiry: null,
    soatPhoto: null,
    soatExpiry: null,
    techPhoto: null,
    techExpiry: null,
    mercadoPagoEmail: '',
    acceptedTerms: false,
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
    case 'SET_DOCUMENT_FIELD':
      return { ...state, documents: { ...state.documents, [action.field]: action.value } };
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
  const setDocumentField = useCallback(
    (field, value) => dispatch({ type: 'SET_DOCUMENT_FIELD', field, value }),
    [],
  );

  // Errores actuales de cada campo (objeto vacío = la pestaña está completa). Se recalculan solo
  // cuando cambian los datos. Qué errores se muestran lo decide cada pantalla.
  const personalErrors = useMemo(() => validatePersonalData(state.personal), [state.personal]);
  const isPersonalComplete = Object.keys(personalErrors).length === 0;
  const vehicleErrors = useMemo(() => validateVehicleData(state.vehicle), [state.vehicle]);
  const isVehicleComplete = Object.keys(vehicleErrors).length === 0;
  // La revisión técnico-mecánica de Documentos depende del año del vehículo: por eso se pasa vehicle.year.
  const documentsErrors = useMemo(
    () => validateDocumentsData(state.documents, state.vehicle.year),
    [state.documents, state.vehicle.year],
  );
  const isDocumentsComplete = Object.keys(documentsErrors).length === 0;

  // El botón "Enviar registro" solo se habilita cuando las tres pestañas están completas (lo exige el enunciado).
  const completedTabs = (isPersonalComplete ? 1 : 0) + (isVehicleComplete ? 1 : 0) + (isDocumentsComplete ? 1 : 0);
  const canSubmit = completedTabs === REQUIRED_TABS;

  // Envía el registro: sube todas las fotos a Cloudinary, guarda el documento en Firestore con
  // status pending y listo. Al existir el documento, AuthContext lo detecta y la navegación lleva
  // sola a "En revisión": por eso no hay navigate aquí ni se vuelve a poner submitting en false.
  const submit = useCallback(async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // La foto de la revisión técnico-mecánica solo existe si el vehículo la exige.
      const needsTechnicalReview = requiresTechnicalReview(state.vehicle.year);
      // CONCEPTO: Promise.all lanza todas las subidas a la vez y espera a que terminen: es más rápido
      // que subirlas una por una, y si una falla, todo el envío falla y se puede reintentar.
      const [photoUrl, vehiclePhotoUrl, licensePhotoUrl, soatPhotoUrl, techPhotoUrl] = await Promise.all([
        uploadImage(state.personal.photo),
        uploadImage(state.vehicle.photo),
        uploadImage(state.documents.licensePhoto),
        uploadImage(state.documents.soatPhoto),
        needsTechnicalReview ? uploadImage(state.documents.techPhoto) : Promise.resolve(null),
      ]);
      const record = buildDriverRecord({
        personal: state.personal,
        vehicle: state.vehicle,
        documents: state.documents,
        email: user.email,
        photoUrl,
        vehiclePhotoUrl,
        documentUrls: { licensePhotoUrl, soatPhotoUrl, techPhotoUrl },
      });
      await saveDriverRegistration(user.uid, record);
    } catch (error) {
      if (__DEV__) console.warn('Enviar registro:', error.message);
      setSubmitError('No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.');
      setSubmitting(false);
    }
  }, [submitting, canSubmit, state.personal, state.vehicle, state.documents, user]);

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
      documents: state.documents,
      setDocumentField,
      documentsErrors,
      isDocumentsComplete,
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
      state.documents,
      setDocumentField,
      documentsErrors,
      isDocumentsComplete,
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
