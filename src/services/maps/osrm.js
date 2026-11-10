// CONCEPTO: servicio de rutas. Usa OSRM (https://project-osrm.org), un servicio gratuito basado en
// OpenStreetMap, en lugar de Google Directions (que exige facturación). El resto de la app solo
// conoce getRoute(); si algún día se cambia a Google, solo se reescribe este archivo.
const BASE_URL = 'https://router.project-osrm.org';

// Convierte la respuesta de OSRM en lo que usa la app. Es una función pura: se puede probar sin red.
//   distancia: OSRM la da en metros   -> se guarda en km con un decimal (8918,9 m -> 8,9 km)
//   duración:  OSRM la da en segundos -> se guarda en minutos enteros, mínimo 1
//   ruta:      OSRM entrega [longitud, latitud]; los mapas de la app piden { latitude, longitude }
export function parseOsrmRoute(data) {
  if (data?.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No se encontró una ruta entre esos dos puntos.');
  }
  const route = data.routes[0];
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
  };
}

// Pide la ruta en carro entre dos puntos { lat, lng }. Se llama pocas veces: una al crear la solicitud y
// una al aceptarla (no en cada movimiento), como recomienda el enunciado para cuidar el cupo.
export async function getRoute(origin, destination) {
  const url =
    `${BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    '?overview=full&geometries=geojson';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`El servicio de rutas respondió ${response.status}.`);
  return parseOsrmRoute(await response.json());
}
