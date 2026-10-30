import { PRICING } from '../config/pricing.js';

// CONCEPTO: función pura (mismas entradas -> mismas salidas, sin efectos). Se usa igual
// para estimar la tarifa en la solicitud entrante y para el cierre del viaje.
// Tarifa = max(mínima, (base + km * valorKm + min * valorMin) * multiplicador), redondeada a 100.
// El conductor se queda con: tarifa - comisión + propina (la propina va completa).
export function calculateFare({
  distanceKm,
  durationMin,
  category,
  tip = 0,
  commissionRate = PRICING.commissionRate,
}) {
  const multiplier = PRICING.categoryMultiplier[category];
  if (multiplier === undefined) {
    throw new Error(`Categoría desconocida: ${category}`);
  }

  const raw = PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMinute;
  const withCategory = Math.max(PRICING.minimumFare, raw * multiplier);

  // El redondeo va antes de calcular la comisión.
  const fare = Math.round(withCategory / PRICING.roundTo) * PRICING.roundTo;
  const commission = Math.round(fare * commissionRate);
  const driverEarnings = fare - commission + tip;

  return { fare, commission, driverEarnings };
}
