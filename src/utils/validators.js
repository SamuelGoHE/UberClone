import { CATEGORIES } from '../constants/categories.js';

// CONCEPTO: cada validador es una función pura. Recibe un valor y devuelve null si es válido
// o el mensaje de error que se muestra debajo del campo (nunca en un Alert).
const REQUIRED = 'Este campo es obligatorio.';
const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

// El enunciado exige que la categoría XL tenga capacidad para 6 pasajeros como mínimo.
const XL_MIN_PASSENGERS = 6;
const ADULT_AGE = 18;

// ---------- Crear cuenta ----------

export function validateEmail(value) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim())) return 'El correo no es válido.';
  return null;
}

// Firebase exige 6 caracteres como mínimo: no se inventa una regla más estricta.
export function validatePassword(value) {
  if (value === undefined || value === null || value === '') return REQUIRED;
  if (String(value).length < 6) return 'Mínimo 6 caracteres.';
  return null;
}

export function validateConfirmPassword(password, confirmation) {
  if (confirmation === undefined || confirmation === null || confirmation === '') return REQUIRED;
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}

// ---------- Datos personales ----------

export function validateFullName(value) {
  if (isEmpty(value)) return REQUIRED;
  const name = String(value).trim();
  if (name.length > 50) return 'Máximo 50 caracteres.';
  // \p{L} = cualquier letra (incluye tildes y la ñ).
  if (!/^[\p{L}\s]+$/u.test(name)) return 'Solo letras y espacios.';
  return null;
}

export function validateDocument(value) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^\d{6,10}$/.test(String(value).trim())) return 'Debe tener entre 6 y 10 dígitos.';
  return null;
}

export function validatePhone(value) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^\d{10}$/.test(String(value).trim())) return 'Debe tener 10 dígitos.';
  return null;
}

// El conductor debe tener 18 años cumplidos. Se compara con la fecha completa (no solo el año):
// quien cumple 18 mañana todavía no es mayor de edad.
export function validateBirthDate(value, today = new Date()) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return REQUIRED;
  const adultSince = new Date(value.getFullYear() + ADULT_AGE, value.getMonth(), value.getDate());
  if (adultSince > today) return 'Debes ser mayor de 18 años.';
  return null;
}

// Para listas desplegables (género, categoría, color) y otros campos de selección obligatoria.
export function validateSelection(value, message = 'Selecciona una opción.') {
  return isEmpty(value) ? message : null;
}

export function validateImage(uri, message = 'Agrega una foto.') {
  return isEmpty(uri) ? message : null;
}

// Valida todos los datos personales juntos. Devuelve un objeto con un mensaje por cada campo
// inválido; si todo está bien, devuelve un objeto vacío (la pestaña está completa).
export function validatePersonalData(data) {
  const checks = {
    photo: validateImage(data.photo, 'Agrega tu foto de perfil.'),
    fullName: validateFullName(data.fullName),
    document: validateDocument(data.document),
    phone: validatePhone(data.phone),
    birthDate: validateBirthDate(data.birthDate),
    gender: validateSelection(data.gender),
  };
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
}

// ---------- Vehículo ----------

// La placa se pasa a mayúsculas antes de validar, como pide el enunciado.
export function normalizePlate(value) {
  return String(value ?? '').trim().toUpperCase();
}

// Formato colombiano de carro: tres letras y tres números (ABC123).
export function validatePlate(value) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^[A-Z]{3}\d{3}$/.test(normalizePlate(value))) return 'Formato de placa no válido (ejemplo: ABC123).';
  return null;
}

// Marca y modelo: texto de máximo 30 caracteres cada uno.
export function validateShortText(value) {
  if (isEmpty(value)) return REQUIRED;
  if (String(value).trim().length > 30) return 'Máximo 30 caracteres.';
  return null;
}
export function validateYear(value, today = new Date()) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^\d{4}$/.test(String(value).trim())) return 'Debe tener 4 dígitos.';
  if (Number(value) > today.getFullYear() + 1) return 'El año no puede ser mayor al siguiente.';
  return null;
}

export function validateCapacity(value, category) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^\d+$/.test(String(value).trim())) return 'Debe ser un número.';
  const passengers = Number(value);
  if (passengers < 1) return 'Debe ser al menos 1.';
  if (category === CATEGORIES.XL && passengers < XL_MIN_PASSENGERS) {
    return `XL exige mínimo ${XL_MIN_PASSENGERS} pasajeros.`;
  }
  return null;
}

// Valida todos los datos del vehículo juntos. Devuelve un objeto con un mensaje por cada campo
// inválido; si todo está bien, devuelve un objeto vacío (la pestaña está completa).
// La capacidad depende de la categoría (XL exige mínimo 6), por eso recibe data.category.
export function validateVehicleData(data, today = new Date()) {
  const checks = {
    category: validateSelection(data.category, 'Selecciona una categoría.'),
    plate: validatePlate(data.plate),
    brand: validateShortText(data.brand),
    model: validateShortText(data.model),
    year: validateYear(data.year, today),
    color: validateSelection(data.color),
    capacity: validateCapacity(data.capacity, data.category),
    photo: validateImage(data.photo, 'Agrega la foto del vehículo.'),
  };
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
}
