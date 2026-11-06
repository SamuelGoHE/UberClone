// Opciones de las listas del registro. value es lo que se guarda (no cambia con el idioma);
// label es lo que lee el conductor. El PDF no define el género: son las opciones acordadas.
export const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro / Prefiero no decirlo' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

// Categorías que elige el conductor al registrar su vehículo (las mismas que elige el pasajero).
export const CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Económico' },
  { value: 'xl', label: 'XL' },
  { value: 'premium', label: 'Premium' },
];

// El PDF pide una lista desplegable de colores sin definir las opciones: estas son las habituales.
export const VEHICLE_COLORS = [
  { value: 'white', label: 'Blanco' },
  { value: 'black', label: 'Negro' },
  { value: 'gray', label: 'Gris' },
  { value: 'silver', label: 'Plateado' },
  { value: 'red', label: 'Rojo' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'orange', label: 'Naranja' },
  { value: 'brown', label: 'Café' },
  { value: 'other', label: 'Otro' },
];

// PROVISIONAL: el enunciado exige las tres pestañas (Datos personales, Vehículo y Documentos) completas
// para habilitar "Enviar registro". Como Documentos aún no existe, por ahora bastan las dos primeras.
// Cuando se construya Documentos, este número pasa a 3 y se suma su validación al contexto.
export const REQUIRED_TABS = 2;
