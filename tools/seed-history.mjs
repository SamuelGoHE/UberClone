// DATOS DE PRUEBA PARA EL HISTORIAL. Crea viajes ya cobrados (status "paid") con fechas repartidas en los últimos
// 70 días, para poder probar la paginación (20 por carga) y los filtros. Todos llevan simulated: true, y el
// comando --clear los borra sin tocar tus viajes reales.
//
// Uso (desde la raíz del proyecto):
//   npm run seed:history -- --driver <uid>            crea 45 viajes
//   npm run seed:history -- --driver <uid> --count 60 crea 60
//   npm run seed:history -- --driver <uid> --clear    borra los viajes simulados de ese conductor
//
// OJO: estos viajes cuentan en Ganancias y en el saldo, porque son viajes cobrados de verdad para la app. Bórralos
// con --clear cuando termines de probar.
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { calculateFare } from '../src/utils/calculateFare.js';

const PLACES = [
  'Estadio Atanasio Girardot, Laureles',
  'Parque Lleras, El Poblado',
  'Centro Comercial Oviedo, El Poblado',
  'Universidad EAFIT, El Poblado',
  'Aeropuerto Olaya Herrera',
  'Plaza Mayor, La Candelaria',
  'Parque Explora, Aranjuez',
  'Jardín Botánico, Sevilla',
];
const PASSENGERS = ['Carlos Ramírez', 'Laura Mejía', 'Andrés Cardona', 'Sofía Londoño', 'Camila Torres'];
const CATEGORIES = ['economy', 'xl', 'premium'];
const DAY_MS = 24 * 3600 * 1000;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);

function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[argv[i].slice(2)] = true;
    else {
      args[argv[i].slice(2)] = next;
      i++;
    }
  }
  return args;
}

function buildTrip(driverId, completedMs) {
  const distanceKm = Math.round(between(2, 16) * 10) / 10;
  const durationMin = Math.max(5, Math.round(distanceKm * 2.4));
  const category = pick(CATEGORIES);
  const tip = pick([0, 0, 0, 1000, 2000, 3000]);
  const paymentMethod = Math.random() < 0.5 ? 'cash' : 'mercadopago';
  const { fare, commission, driverEarnings } = calculateFare({ distanceKm, durationMin, category, tip });
  const [origin, destination] = [pick(PLACES), pick(PLACES)];
  return {
    simulated: true,
    status: 'paid',
    driverId,
    passengerId: 'simulated-passenger',
    passengerName: pick(PASSENGERS),
    passengerRating: 4.8,
    origin: { lat: 6.2088, lng: -75.5665, address: origin },
    destination: { lat: 6.2567, lng: -75.5906, address: destination },
    distanceKm,
    durationMin,
    category,
    tip,
    fare,
    commission,
    commissionRate: 0.2,
    driverEarnings,
    paymentMethod,
    paymentStatus: paymentMethod === 'cash' ? 'cash' : 'approved',
    ...(paymentMethod === 'mercadopago' ? { paymentId: `sim-${Math.floor(Math.random() * 1e9)}` } : {}),
    createdAt: Timestamp.fromMillis(completedMs - 20 * 60 * 1000),
    completedAt: Timestamp.fromMillis(completedMs),
    paidAt: Timestamp.fromMillis(completedMs + 2 * 60 * 1000),
  };
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (typeof args.driver !== 'string') throw new Error('Falta --driver <uid> (el uid del conductor, está en Firebase > drivers).');
  const db = getFirestore(
    initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    }),
  );

  if (args.clear) {
    const snapshot = await getDocs(
      query(collection(db, 'trips'), where('driverId', '==', args.driver), where('simulated', '==', true)),
    );
    for (let i = 0; i < snapshot.docs.length; i += 400) {
      const batch = writeBatch(db);
      snapshot.docs.slice(i, i + 400).forEach((tripDoc) => batch.delete(tripDoc.ref));
      await batch.commit();
    }
    console.log(`Borrados ${snapshot.size} viajes simulados de ${args.driver}.`);
    return;
  }

  const count = Number(args.count ?? 45);
  if (!Number.isInteger(count) || count < 1 || count > 400) throw new Error('--count debe ser un entero entre 1 y 400.');
  const now = Date.now();
  const batch = writeBatch(db);
  for (let i = 0; i < count; i++) {
    // Fechas repartidas en los últimos 70 días, a distintas horas del día; las últimas 3 son de hoy.
    const completedMs = i < 3 ? now - Math.floor(between(1, 8)) * 3600 * 1000 : now - between(0.2, 70) * DAY_MS;
    batch.set(doc(collection(db, 'trips')), buildTrip(args.driver, Math.round(completedMs)));
  }
  await batch.commit();
  console.log(`Creados ${count} viajes simulados cobrados para ${args.driver}.`);
  console.log('Para borrarlos: npm run seed:history -- --driver ' + args.driver + ' --clear');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  });
