// AI-assisted: see docs/AI_LOG.md #21
// CONCEPTO: estimación local de un viaje, sin servicios externos. Se usa solo en el simulador de pasajero.
// El viaje real (la ruta que dibuja la app) se calcula más adelante con un servicio de rutas.
const EARTH_RADIUS_KM = 6371;
const ROAD_FACTOR = 1.35; // las calles son más largas que la línea recta entre dos puntos
const AVERAGE_SPEED_KMH = 25; // velocidad promedio de una ciudad con tráfico

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Distancia en línea recta entre dos puntos { lat, lng } (fórmula de Haversine), en km.
export function straightLineKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Devuelve { distanceKm, durationMin }: distancia con un decimal y duración en minutos enteros (mínimo 1).
export function estimateTrip(origin, destination) {
  const distanceKm = Math.round(straightLineKm(origin, destination) * ROAD_FACTOR * 10) / 10;
  const durationMin = Math.max(1, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));
  return { distanceKm, durationMin };
}
