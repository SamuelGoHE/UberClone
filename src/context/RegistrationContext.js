import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { validatePersonalData } from '../utils/validators';

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
};

// CONCEPTO: useReducer centraliza cómo cambia el estado. La pantalla no modifica el estado directamente:
// envía una acción (dispatch) y el reducer, una función pura, devuelve el estado nuevo.
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PERSONAL_FIELD':
      return { ...state, personal: { ...state.personal, [action.field]: action.value } };
    default:
      return state;
  }
}

// CONCEPTO: las tres pestañas del registro comparten este estado. Así lo que se escribe en una
// pestaña no se pierde al cambiar a otra, y se puede saber cuáles pestañas están completas.
export function RegistrationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setPersonalField = useCallback(
    (field, value) => dispatch({ type: 'SET_PERSONAL_FIELD', field, value }),
    [],
  );

  // Errores actuales de cada campo (objeto vacío = la pestaña está completa). Se recalculan solo
  // cuando cambian los datos. Qué errores se muestran lo decide cada pantalla.
  const personalErrors = useMemo(() => validatePersonalData(state.personal), [state.personal]);
  const isPersonalComplete = Object.keys(personalErrors).length === 0;

  const value = useMemo(
    () => ({ personal: state.personal, setPersonalField, personalErrors, isPersonalComplete }),
    [state.personal, setPersonalField, personalErrors, isPersonalComplete],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration debe usarse dentro de RegistrationProvider');
  return context;
}
