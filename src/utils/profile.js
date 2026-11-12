import { validateExpiryDate } from './documentValidators.js';
import { parseISODate, toISODate } from './formatDate.js';
import { validateCapacity, validateEmail, validateFullName, validatePhone, validateSelection } from './validators.js';

// CONCEPTO: el perfil es el mismo formulario del registro, pero ya guardado. Estas funciones puras convierten el
// perfil guardado (driver) en el formulario, validan el formulario y calculan SOLO los campos que cambiaron. Así
// las reglas (validadores, XL = 6 pasajeros…) siguen viviendo en un solo sitio y todo se puede probar con Node.

// Campos que el conductor puede cambiar. Cualquier otro (status, isAvailable, createdAt, categoría, placa, marca,
// modelo, año, documento de identidad, fecha de nacimiento, correo) es de solo lectura: cambiarlos alteraría las
// tarifas, los documentos exigidos o la identidad de la cuenta. updateDriverProfile rechaza lo que no esté aquí.
// Las fotos tampoco se editan todavía: requieren volver a subir imágenes.
export const EDITABLE_FIELDS = [
  'fullName',
  'phone',
  'gender',
  'language',
  'vehicle.color',
  'vehicle.capacity',
  'documents.mercadoPagoEmail',
  'documents.licenseExpiry',
  'documents.soatExpiry',
  'documents.technicalReview.expiry',
];

// Días antes del vencimiento en que un documento pasa a "Por vencer".
export const EXPIRING_DAYS = 30;
export const DOCUMENT_STATUS = { VALID: 'valid', EXPIRING: 'expiring', EXPIRED: 'expired' };

const DAY_MS = 24 * 3600 * 1000;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Estado de un documento según su vencimiento (un Date o un texto AAAA-MM-DD): vencido (hoy o antes), por vencer
// (en 30 días o menos) o vigente. Devuelve null si no hay fecha válida.
export function documentStatus(expiry, today = new Date()) {
  const date = expiry instanceof Date ? expiry : parseISODate(expiry);
  if (!date || Number.isNaN(date.getTime())) return null;
  const days = Math.round((startOfDay(date) - startOfDay(today)) / DAY_MS);
  if (days <= 0) return DOCUMENT_STATUS.EXPIRED;
  if (days <= EXPIRING_DAYS) return DOCUMENT_STATUS.EXPIRING;
  return DOCUMENT_STATUS.VALID;
}

// Qué partes del perfil existen. Las cuentas antiguas (creadas antes del registro completo) pueden no tener
// vehículo ni documentos: el perfil muestra solo lo que hay en lugar de romperse.
export function profileSections(driver) {
  return {
    hasVehicle: Boolean(driver?.vehicle),
    hasDocuments: Boolean(driver?.documents),
    hasTechnicalReview: Boolean(driver?.documents?.technicalReview),
  };
}

// Perfil guardado -> valores del formulario. Todo texto (también la capacidad), y las fechas como Date.
export function profileToForm(driver = {}) {
  const vehicle = driver.vehicle;
  const documents = driver.documents;
  return {
    fullName: driver.fullName ?? '',
    phone: driver.phone ?? '',
    gender: driver.gender ?? '',
    vehicleColor: vehicle?.color ?? '',
    vehicleCapacity: vehicle?.capacity !== undefined ? String(vehicle.capacity) : '',
    mercadoPagoEmail: documents?.mercadoPagoEmail ?? '',
    licenseExpiry: parseISODate(documents?.licenseExpiry),
    soatExpiry: parseISODate(documents?.soatExpiry),
    techExpiry: parseISODate(documents?.technicalReview?.expiry),
  };
}

const sameDay = (a, b) => toISODate(a) === toISODate(b);

// Valida el formulario con los validadores del registro. Devuelve un mensaje por cada campo inválido; vacío = se
// puede guardar. Reglas cruzadas: la capacidad depende de la categoría guardada (XL exige mínimo 6). Un vencimiento
// solo se valida si el conductor lo CAMBIÓ: si tiene un documento ya vencido y solo corrige su celular, no se le
// bloquea el guardado; el documento seguirá marcado como vencido en pantalla.
export function validateProfileForm(form, driver, today = new Date()) {
  const original = profileToForm(driver);
  const { hasVehicle, hasDocuments, hasTechnicalReview } = profileSections(driver);
  const checks = {
    fullName: validateFullName(form.fullName),
    phone: validatePhone(form.phone),
    gender: validateSelection(form.gender, 'Selecciona una opción.'),
  };
  if (hasVehicle) {
    checks.vehicleColor = validateSelection(form.vehicleColor, 'Selecciona un color.');
    checks.vehicleCapacity = validateCapacity(form.vehicleCapacity, driver.vehicle.category);
  }
  if (hasDocuments) {
    checks.mercadoPagoEmail = validateEmail(form.mercadoPagoEmail);
    const expiries = [['licenseExpiry', true], ['soatExpiry', true], ['techExpiry', hasTechnicalReview]];
    for (const [field, exists] of expiries) {
      if (!exists) continue;
      const changed = !(original[field] && form[field] && sameDay(original[field], form[field]));
      if (changed) checks[field] = validateExpiryDate(form[field], today);
    }
  }
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
}

// Formulario -> SOLO los campos que cambiaron, con el nombre de campo de Firestore (rutas con punto para lo anidado:
// 'vehicle.color' cambia ese dato sin reescribir todo el mapa vehicle). Si no cambió nada devuelve {}.
export function buildProfileUpdates(form, driver) {
  const original = profileToForm(driver);
  const { hasVehicle, hasDocuments, hasTechnicalReview } = profileSections(driver);
  const updates = {};
  const trimmed = (value) => String(value).trim();

  if (trimmed(form.fullName) !== original.fullName) updates.fullName = trimmed(form.fullName);
  if (form.phone !== original.phone) updates.phone = form.phone;
  if (form.gender !== original.gender) updates.gender = form.gender;
  if (hasVehicle) {
    if (form.vehicleColor !== original.vehicleColor) updates['vehicle.color'] = form.vehicleColor;
    if (form.vehicleCapacity !== original.vehicleCapacity) updates['vehicle.capacity'] = Number(form.vehicleCapacity);
  }
  if (hasDocuments) {
    if (trimmed(form.mercadoPagoEmail) !== original.mercadoPagoEmail) {
      updates['documents.mercadoPagoEmail'] = trimmed(form.mercadoPagoEmail);
    }
    const dates = [
      ['licenseExpiry', 'documents.licenseExpiry', true],
      ['soatExpiry', 'documents.soatExpiry', true],
      ['techExpiry', 'documents.technicalReview.expiry', hasTechnicalReview],
    ];
    for (const [field, path, exists] of dates) {
      if (exists && form[field] && !(original[field] && sameDay(original[field], form[field]))) {
        updates[path] = toISODate(form[field]);
      }
    }
  }
  return updates;
}
