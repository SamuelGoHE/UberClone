// AI-assisted: see docs/AI_LOG.md #17, #19
import { PRICING } from '../config/pricing.js';
import { DRIVER_STATUS } from '../constants/driverStatus.js';
import { requiresTechnicalReview } from './documentValidators.js';
import { toISODate } from './formatDate.js';
import { normalizePlate } from './validators.js';

// CONCEPTO: función pura que arma el documento que se guarda en Firestore (drivers/{uid}) a partir de lo
// que el conductor llenó. Convierte lo que son números (año, capacidad), deja las fechas como texto
// AAAA-MM-DD y la placa en mayúsculas, y marca la cuenta como pending: queda en revisión hasta que
// alguien cambie status a approved en la base de datos.
// Las fotos ya vienen subidas a Cloudinary: aquí solo se guardan sus enlaces, nunca las rutas locales.
export function buildDriverRecord({ personal, vehicle, documents, email, photoUrl, vehiclePhotoUrl, documentUrls }) {
  return {
    fullName: personal.fullName.trim(),
    document: personal.document,
    phone: personal.phone,
    birthDate: toISODate(personal.birthDate),
    gender: personal.gender,
    language: personal.language,
    email,
    photoUrl,
    vehicle: {
      category: vehicle.category,
      plate: normalizePlate(vehicle.plate),
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      color: vehicle.color,
      capacity: Number(vehicle.capacity),
      photoUrl: vehiclePhotoUrl,
    },
    documents: {
      licenseNumber: documents.licenseNumber.trim().toUpperCase(),
      licensePhotoUrl: documentUrls.licensePhotoUrl,
      licenseExpiry: toISODate(documents.licenseExpiry),
      soatPhotoUrl: documentUrls.soatPhotoUrl,
      soatExpiry: toISODate(documents.soatExpiry),
      // La revisión técnico-mecánica solo existe si el año del vehículo la exige.
      technicalReview: requiresTechnicalReview(vehicle.year)
        ? { photoUrl: documentUrls.techPhotoUrl, expiry: toISODate(documents.techExpiry) }
        : null,
      mercadoPagoEmail: documents.mercadoPagoEmail.trim(),
      acceptedTerms: true,
      // Se guarda la comisión que el conductor aceptó, por si la tarifa cambia después.
      acceptedCommissionRate: PRICING.commissionRate,
    },
    status: DRIVER_STATUS.PENDING,
    isAvailable: false,
  };
}
