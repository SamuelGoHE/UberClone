// AI-assisted: see docs/AI_LOG.md #22
import { useEffect, useRef, useState } from 'react';

// CONCEPTO: custom hook de cuenta regresiva. Cuenta desde `seconds` cada vez que `resetKey` cambia (por
// ejemplo, el id de una solicitud nueva) y llama a onExpire una sola vez al llegar a cero.
// Calcula el tiempo restante contra una hora límite en lugar de restar 1 por tick: si el celular pausa la
// app unos segundos, la cuenta no se atrasa. La función de limpieza cancela el intervalo al cambiar la
// solicitud o cerrar la pantalla.
export default function useCountdown(seconds, resetKey, onExpire) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    let expired = false;
    setRemaining(seconds);

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !expired) {
        expired = true;
        clearInterval(interval);
        onExpireRef.current?.();
      }
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [seconds, resetKey]);

  return remaining;
}
