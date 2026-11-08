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
