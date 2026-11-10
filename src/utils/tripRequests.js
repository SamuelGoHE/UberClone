// Una solicitud sin atender no debe saltarle al conductor horas después, cuando se ponga disponible.
export const REQUEST_MAX_AGE_MS = 2 * 60 * 1000;

// De todas las solicitudes que llegan de Firestore deja las vigentes, la más antigua primero: esa es la que
// se muestra y las demás esperan su turno. Si createdAtMs es null, el servidor aún está escribiendo la
// fecha (la solicitud acaba de nacer): se trata como "ahora".
export function selectPendingRequests(trips, now = Date.now(), maxAgeMs = REQUEST_MAX_AGE_MS) {
  return trips
    .map((trip) => ({ ...trip, createdAtMs: trip.createdAtMs ?? now }))
    .filter((trip) => now - trip.createdAtMs <= maxAgeMs)
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
}
