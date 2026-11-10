import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './index';

// CONCEPTO: la ubicación del conductor se guarda en su propio documento (driverLocations/{uid}), no en
// drivers/{uid}. Cambia cada pocos segundos y AuthContext escucha drivers/{uid}: si la ubicación viviera
// ahí, toda la app se volvería a dibujar con cada cambio. Un documento por conductor, que se sobrescribe.
export function updateDriverLocation(uid, coords) {
  return setDoc(doc(db, 'driverLocations', uid), { ...coords, updatedAt: serverTimestamp() });
}
