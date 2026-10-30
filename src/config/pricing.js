// CONCEPTO: todos los valores de tarifa viven en un solo archivo para poder cambiarlos
// sin tocar la lógica. Son pesos colombianos enteros (sin decimales) para evitar errores de coma flotante.
// Valores didácticos del enunciado, no tarifas reales.
export const PRICING = {
  baseFare: 3500,
  perKm: 1200,
  perMinute: 250,
  minimumFare: 6000,
  // Redondeo del valor final al múltiplo de 100 COP más cercano.
  roundTo: 100,
  // Comisión de la plataforma sobre la tarifa. Cada viaje guarda la que se aplicó (commissionRate).
  commissionRate: 0.2,
  categoryMultiplier: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
};
