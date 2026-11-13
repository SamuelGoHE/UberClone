// AI-assisted: see docs/AI_LOG.md #12, #17, #29, #30
// CONCEPTO: convierte un Date en el texto DD/MM/AAAA que se muestra en pantalla (14/03/1995).
// padStart agrega ceros a la izquierda: 5 -> "05". Se usan los getters locales (getDate, getMonth)
// y no los UTC, para que la fecha mostrada sea la que el usuario eligió y no "corra" un día.
export function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // los meses de Date empiezan en 0
  return `${day}/${month}/${date.getFullYear()}`;
}

// CONCEPTO: para guardar una fecha en la base de datos se usa texto AAAA-MM-DD (1995-03-14) y no un
// Date: así la zona horaria no puede "correr" el día. Usa los getters locales, igual que formatDate.
export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// CONCEPTO: lee un texto AAAA-MM-DD (como se guardan las fechas en Firestore) y lo convierte en un Date. Arma la
// fecha con año, mes y día por separado, en hora LOCAL. NO se usa new Date('1995-03-14'): JavaScript lo interpreta
// en UTC y en Colombia (UTC-5) mostraría el día anterior. Devuelve null si el texto no es una fecha real
// (por ejemplo 2026-02-31, que new Date convertiría en marzo sin avisar).
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Fecha y hora cortas de un viaje, a partir de milisegundos: "08 nov · 14:32". Se arma a mano (y no con
// toLocaleString) para que se vea igual en cualquier celular. Devuelve '' si no hay fecha.
export function formatDateTime(ms) {
  if (typeof ms !== 'number') return '';
  const date = new Date(ms);
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${MONTHS[date.getMonth()]} · ${hours}:${minutes}`;
}
