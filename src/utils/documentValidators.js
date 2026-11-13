// AI-assisted: see docs/AI_LOG.md #19
import { TECHNICAL_REVIEW_AFTER_YEARS } from '../constants/registration.js';
import { validateEmail, validateImage } from './validators.js';

// CONCEPTO: validadores de la pestaña Documentos. Como el resto, son funciones puras: devuelven null si el
// valor es válido o el mensaje que se muestra debajo del campo.
const REQUIRED = 'Este campo es obligatorio.';
const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

// El enunciado pide número de licencia sin definir su formato: solo letras y números, de 5 a 20 caracteres.
export function validateLicenseNumber(value) {
  if (isEmpty(value)) return REQUIRED;
  if (!/^[A-Za-z0-9]{5,20}$/.test(String(value).trim())) return 'Usa de 5 a 20 letras o números.';
  return null;
}

// Licencia, SOAT y técnico-mecánica: la fecha de vencimiento debe ser posterior a hoy.
export function validateExpiryDate(value, today = new Date()) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return REQUIRED;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (value <= startOfToday) return 'La fecha de vencimiento debe ser posterior a hoy.';
  return null;
}

// La revisión técnico-mecánica solo se exige a vehículos con cierta antigüedad (según su año).
export function requiresTechnicalReview(vehicleYear, today = new Date()) {
  if (!/^\d{4}$/.test(String(vehicleYear ?? '').trim())) return false;
  return today.getFullYear() - Number(vehicleYear) >= TECHNICAL_REVIEW_AFTER_YEARS;
}

export function validateTerms(accepted) {
  return accepted ? null : 'Debes aceptar los términos para continuar.';
}

// Valida toda la pestaña. Devuelve un objeto con un mensaje por cada campo inválido (vacío = completa).
// La revisión técnico-mecánica solo cuenta si el año del vehículo (pestaña Vehículo) la exige.
export function validateDocumentsData(data, vehicleYear, today = new Date()) {
  const checks = {
    licenseNumber: validateLicenseNumber(data.licenseNumber),
    licensePhoto: validateImage(data.licensePhoto, 'Agrega la foto de la licencia.'),
    licenseExpiry: validateExpiryDate(data.licenseExpiry, today),
    soatPhoto: validateImage(data.soatPhoto, 'Agrega la foto del SOAT.'),
    soatExpiry: validateExpiryDate(data.soatExpiry, today),
    mercadoPagoEmail: validateEmail(data.mercadoPagoEmail),
    acceptedTerms: validateTerms(data.acceptedTerms),
  };
  if (requiresTechnicalReview(vehicleYear, today)) {
    checks.techPhoto = validateImage(data.techPhoto, 'Agrega la foto de la revisión.');
    checks.techExpiry = validateExpiryDate(data.techExpiry, today);
  }
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
}
