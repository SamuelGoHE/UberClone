import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './index';

// CONCEPTO: una liquidación simulada es el pago del saldo al conductor. No se mueve dinero real: se guarda un
// registro (payouts/{id}) y el saldo lo descuenta. Así el saldo siempre se calcula a partir de datos, nunca se
// guarda como un número que pueda quedar desactualizado.
export function subscribeToPayouts(uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'payouts'), where('driverId', '==', uid)),
    (snapshot) => onData(snapshot.docs.map((payoutDoc) => ({ id: payoutDoc.id, ...payoutDoc.data() }))),
    onError,
  );
}

// Solicita la liquidación del monto indicado (el saldo a favor del conductor).
export function requestPayout(uid, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('El monto de la liquidación debe ser positivo.');
  return addDoc(collection(db, 'payouts'), { driverId: uid, amount, createdAt: serverTimestamp() });
}
