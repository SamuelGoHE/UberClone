import { DRIVER_STATUS } from '../constants/driverStatus.js';
import { toISODate } from './formatDate.js';
import { normalizePlate } from './validators.js';

// CONCEPTO: función pura que arma el documento que se guarda en Firestore (drivers/{uid}) a partir de lo
// que el conductor llenó. Convierte lo que son números (año, capacidad), deja la fecha como texto
// AAAA-MM-DD y la placa en mayúsculas, y marca la cuenta como pending: queda en revisión hasta que
// alguien cambie status a approved en la base de datos.
export function buildDriverRecord({ personal, vehicle, email, photoUrl, vehiclePhotoUrl }) {
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
    status: DRIVER_STATUS.PENDING,
    isAvailable: false,
  };
}
