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

// El enunciado exige las tres pestañas (Datos personales, Vehículo y Documentos) completas y válidas
// para habilitar "Enviar registro".
export const REQUIRED_TABS = 3;

// El enunciado pide la revisión técnico-mecánica "si aplica según el año del vehículo", sin decir desde
// cuándo. Valor didáctico: un carro particular la necesita pasados 6 años desde su modelo.
// Es una suposición: conviene confirmarla con la profesora.
export const TECHNICAL_REVIEW_AFTER_YEARS = 6;
