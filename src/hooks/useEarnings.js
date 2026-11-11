import { useMemo } from 'react';
import { computeBalance, summarizeEarnings } from '../utils/earnings';
import useDriverTrips from './useDriverTrips';
import usePayouts from './usePayouts';

// CONCEPTO: custom hook de las ganancias. Junta los viajes y las liquidaciones del conductor (que llegan en
// tiempo real desde Firestore) y calcula, con useMemo, los totales del periodo y el saldo. useMemo hace que
// las cuentas solo se rehagan cuando cambian los viajes, las liquidaciones o el periodo, no con cada dibujo de
// la pantalla. La pantalla solo muestra lo que este hook devuelve.
//   summary: { count, fares, commissions, tips, net, average } del periodo (PERIODS.DAY, WEEK o MONTH)
//   balance: saldo acumulado del conductor
//   payoutsError: si no se pudieron leer las liquidaciones, el saldo se vería más alto de lo real
export default function useEarnings(uid, period) {
  const { trips, loading, error } = useDriverTrips(uid);
  const { payouts, error: payoutsError } = usePayouts(uid);

  const summary = useMemo(() => summarizeEarnings(trips, period), [trips, period]);
  const balance = useMemo(() => computeBalance(trips, payouts), [trips, payouts]);

  return { summary, balance, loading, error, payoutsError };
}
