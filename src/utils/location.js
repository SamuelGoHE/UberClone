// CONCEPTO: funciones puras para el seguimiento de ubicación. Se pueden probar sin celular.

// Convierte la posición que entrega el GPS ({ coords: { latitude, longitude, ... } }) en lo que guarda
// la app: lat y lng siempre; heading (rumbo) y accuracy (precisión en metros) si el GPS los da.
export function toCoords(position) {
  const { latitude, longitude, heading, accuracy } = position.coords;
  return {
    lat: latitude,
    lng: longitude,
    // El GPS usa -1 o null cuando el rumbo no está disponible: se guarda null.
    heading: typeof heading === 'number' && heading >= 0 ? heading : null,
    accuracy: typeof accuracy === 'number' ? accuracy : null,
  };
}

// Decide si ya pasó el tiempo mínimo desde el último aviso. El GPS de iPhone ignora la opción timeInterval
// (solo existe en Android), así que el límite de "una escritura cada pocos segundos" se controla aquí.
export function shouldEmit(lastEmitMs, nowMs, minIntervalMs) {
  return lastEmitMs === null || nowMs - lastEmitMs >= minIntervalMs;
}
