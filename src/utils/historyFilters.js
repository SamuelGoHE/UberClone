// AI-assisted: see docs/AI_LOG.md #29
import { PERIODS, periodStart } from './earnings.js';

// Filtros de periodo del Historial: los mismos de Ganancias más el rango de fechas.
export const HISTORY_PERIODS = { ...PERIODS, RANGE: 'range' };

// Convierte los filtros de la pantalla en los límites de la consulta, en milisegundos:
//   fromMs: desde (inclusive)      toMs: hasta (NO inclusive); null = sin límite
// Hoy, Semana y Mes reutilizan periodStart de Ganancias, para que los dos cuenten igual. En el rango, el día
// final es inclusivo: se consulta "hasta el inicio del día siguiente, sin incluirlo". ready es false mientras
// el rango esté incompleto o sea inválido (el fin no puede ser antes del inicio): no se consulta nada.
export function buildHistoryRange({ period, rangeFrom, rangeTo }, now = Date.now()) {
  if (period !== HISTORY_PERIODS.RANGE) {
    return { ready: true, fromMs: periodStart(period, now), toMs: null, error: null };
  }
  if (!rangeFrom || !rangeTo) return { ready: false, fromMs: null, toMs: null, error: null };

  const from = new Date(rangeFrom);
  from.setHours(0, 0, 0, 0);
  const toExclusive = new Date(rangeTo);
  toExclusive.setHours(0, 0, 0, 0);
  toExclusive.setDate(toExclusive.getDate() + 1); // setDate y no "+ 24 h": así no falla en cambios de hora
  if (toExclusive.getTime() <= from.getTime()) {
    return { ready: false, fromMs: null, toMs: null, error: 'La fecha final no puede ser anterior a la inicial.' };
  }
  return { ready: true, fromMs: from.getTime(), toMs: toExclusive.getTime(), error: null };
}
