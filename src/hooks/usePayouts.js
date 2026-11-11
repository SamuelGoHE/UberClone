import { useEffect, useState } from 'react';
import { subscribeToPayouts } from '../services/firebase/payouts';

// Las liquidaciones ya solicitadas por el conductor, en tiempo real. Si no se pueden leer, la lista queda vacía
// y se avisa con error: el saldo se mostraría más alto de lo real, por eso la pantalla lo advierte.
export default function usePayouts(uid) {
  const [payouts, setPayouts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    return subscribeToPayouts(uid, setPayouts, () => setError('No pudimos cargar tus liquidaciones.'));
  }, [uid]);

  return { payouts, error };
}
