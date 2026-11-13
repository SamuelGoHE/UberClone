// AI-assisted: see docs/AI_LOG.md #29
// Puntos que se guardan de cada ruta. Un documento de Firestore pesa como máximo 1 MiB y OSRM devuelve cientos de
// puntos por ruta (y miles en un viaje largo): con ~100 se dibuja igual de bien y el documento se mantiene liviano.
export const MAX_SAVED_POINTS = 100;

const round5 = (value) => Math.round(value * 1e5) / 1e5; // 5 decimales ≈ 1 metro

// CONCEPTO: reduce una ruta a un máximo de maxPoints puntos, repartidos parejos a lo largo del trayecto, sin perder
// nunca el primero ni el último. Convierte del formato de OSRM y del mapa { latitude, longitude } al de Firestore
// { lat, lng } (el mismo de origin y destination) y redondea a 5 decimales. Función pura, probada con Node.
export function reduceRoute(coordinates, maxPoints = MAX_SAVED_POINTS) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return [];
  const last = coordinates.length - 1;
  const count = Math.min(coordinates.length, maxPoints);
  const indexes = new Set();
  for (let i = 0; i < count; i++) indexes.add(Math.round((i * last) / Math.max(1, count - 1)));
  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => ({ lat: round5(coordinates[index].latitude), lng: round5(coordinates[index].longitude) }));
}

// De vuelta al formato que pide el mapa para dibujar la Polyline.
export const toMapCoordinates = (points) => points.map((point) => ({ latitude: point.lat, longitude: point.lng }));
