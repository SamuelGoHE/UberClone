import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config.js';

// CONCEPTO: Firebase Admin entra con la clave de servicio, con permisos de administrador. Por eso solo se usa
// en el backend: esa clave jamás va en la app. La app usa el SDK normal, sujeto a las reglas de Firestore.
const serviceAccount = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

export const db = getFirestore();
