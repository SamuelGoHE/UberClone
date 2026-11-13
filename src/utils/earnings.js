// AI-assisted: see docs/AI_LOG.md #28
import { PAYMENT_METHODS } from '../constants/paymentMethods.js';
import { TRIP_STATUS } from '../constants/tripStatus.js';

// Periodos del selector de Ganancias.
export const PERIODS = { DAY: 'day', WEEK: 'week', MONTH: 'month' };

// Inicio de cada periodo, en la hora del celular: hoy desde las 00:00, la semana desde el lunes a las 00:00
// (así cuentan las semanas en Colombia) y el mes desde el día 1.
export function periodStart(period, now = Date.now()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  if (period === PERIODS.WEEK) date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // getDay: 0 = domingo
  if (period === PERIODS.MONTH) date.setDate(1);
  return date.getTime();
}

// El día en que se hizo el viaje: cuando terminó. Si falta ese dato (viajes viejos), el de cobro o el de creación.
export const tripTimeMs = (trip) => trip.completedAtMs ?? trip.paidAtMs ?? trip.createdAtMs ?? 0;

// Solo cuentan los viajes ya cobrados: los que siguen por cobrar viven en el resumen del cobro.
const paidTrips = (trips) => trips.filter((trip) => trip.status === TRIP_STATUS.PAID);

// CONCEPTO: función pura (mismas entradas -> mismas salidas, sin efectos): por eso se puede probar sin la app y
// se calcula con useMemo en la pantalla. Totales de los viajes cobrados desde el inicio del periodo:
//   fares       tarifas facturadas (sin propina)
//   commissions comisión de la plataforma
//   tips        propinas, que van completas al conductor
//   net         ganancia neta = tarifas - comisiones + propinas
export function summarizeEarnings(trips, period, now = Date.now()) {
  const start = periodStart(period, now);
  const inPeriod = paidTrips(trips).filter((trip) => tripTimeMs(trip) >= start);
  const sum = (pick) => inPeriod.reduce((total, trip) => total + (pick(trip) ?? 0), 0);
  const count = inPeriod.length;
  const net = sum((trip) => trip.driverEarnings);
  return {
    count,
    fares: sum((trip) => trip.fare),
    commissions: sum((trip) => trip.commission),
    tips: sum((trip) => trip.tip),
    net,
    average: count > 0 ? Math.round(net / count) : 0,
  };
}

// CONCEPTO: saldo del conductor (acumulado, no depende del periodo). Es lo que la plataforma le debe:
//   viaje por pasarela: la plataforma recibió el dinero y le debe su ganancia neta (+)
//   viaje en efectivo:  el conductor se quedó con todo el dinero y le debe la comisión a la plataforma (-)
// A eso se le restan las liquidaciones ya solicitadas. Puede quedar negativo, como pide el enunciado.
export function computeBalance(trips, payouts = []) {
  const fromTrips = paidTrips(trips).reduce(
    (total, trip) =>
      trip.paymentMethod === PAYMENT_METHODS.CASH ? total - (trip.commission ?? 0) : total + (trip.driverEarnings ?? 0),
    0,
  );
  return fromTrips - payouts.reduce((total, payout) => total + (payout.amount ?? 0), 0);
}
