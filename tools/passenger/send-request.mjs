// AI-assisted: see docs/AI_LOG.md #21
// SIMULADOR DE PASAJERO. Esta app es solo la del conductor, así que no existe quien pida los viajes.
// Este script hace de pasajero: crea una solicitud en Firestore (colección trips) dirigida al conductor
// que esté disponible. Reutiliza calculateFare, la misma función de tarifa de la app. La distancia y la
// duración son una estimación local (estimate.mjs), no una ruta real.
//
// Uso (desde la raíz del proyecto, con el conductor "Disponible" en la app):
//   npm run request                          solicitud al azar
//   npm run request -- --category xl --payment cash --tip 2000
//   npm run request -- --dest 3              destino número 3 de la lista
//   npm run request -- --dry-run             muestra la solicitud sin guardarla
//
// Modelo del viaje (trips/{id}), según el enunciado:
//   status             'requested' (luego accepted, driver_arriving, in_progress, completed, paid, cancelled, rejected)
//   candidateDriverId  conductor al que se le ofrece la solicitud
//   driverId           null hasta que un conductor la acepte
//   passengerId, passengerName, passengerRating
//   origin, destination   { lat, lng, address }
//   distanceKm, durationMin, category ('economy' | 'xl' | 'premium'), paymentMethod ('mercadopago' | 'cash'), tip
//   createdAt
// La tarifa, la comisión y la ganancia NO se guardan aquí: las calcula la app del conductor con calculateFare.
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { calculateFare } from '../../src/utils/calculateFare.js';
import { estimateTrip } from './estimate.mjs';

// Lugares de Medellín (coordenadas aproximadas) para usar como destino.
const PLACES = [
  { address: 'Estadio Atanasio Girardot, Laureles', lat: 6.2567, lng: -75.5906 },
  { address: 'Parque Lleras, El Poblado', lat: 6.2088, lng: -75.5665 },
  { address: 'Centro Comercial Oviedo, El Poblado', lat: 6.199, lng: -75.5741 },
  { address: 'Universidad EAFIT, El Poblado', lat: 6.2005, lng: -75.5783 },
  { address: 'Aeropuerto Olaya Herrera', lat: 6.2205, lng: -75.59 },
  { address: 'Plaza Mayor, La Candelaria', lat: 6.2425, lng: -75.5702 },
];
const PASSENGERS = ['Carlos Ramírez', 'Laura Mejía', 'Andrés Cardona', 'Sofía Londoño'];
const FALLBACK_LOCATION = { lat: 6.2088, lng: -75.5665 }; // si el conductor aún no tiene ubicación guardada
const CATEGORIES = ['economy', 'xl', 'premium'];
const PAYMENTS = ['mercadopago', 'cash'];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Lee los argumentos: --category xl --payment cash --tip 2000 --dest 3 --driver <uid> --dry-run
function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const money = (n) => `$${n.toLocaleString('es-CO')}`;

async function main() {
  const args = readArgs(process.argv.slice(2));
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  const missing = Object.entries(config).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error(`Faltan variables en el .env: ${missing.join(', ')}`);
  const db = getFirestore(initializeApp(config));

  const category = args.category ?? pick(CATEGORIES);
  const paymentMethod = args.payment ?? pick(PAYMENTS);
  const tip = Number(args.tip ?? 0);
  if (!CATEGORIES.includes(category)) throw new Error(`Categoría no válida. Usa: ${CATEGORIES.join(', ')}`);
  if (!PAYMENTS.includes(paymentMethod)) throw new Error(`Método de pago no válido. Usa: ${PAYMENTS.join(', ')}`);
  if (!Number.isInteger(tip) || tip < 0) throw new Error('La propina debe ser un entero en pesos (0 o más).');

  // 1. El conductor al que se le ofrece la solicitud: el indicado o el primero que esté disponible.
  let driverId = typeof args.driver === 'string' ? args.driver : null;
  if (!driverId) {
    const snapshot = await getDocs(query(collection(db, 'drivers'), where('isAvailable', '==', true), limit(1)));
    if (!snapshot.empty) driverId = snapshot.docs[0].id;
  }
  if (!driverId && !args['dry-run']) {
    throw new Error('No hay ningún conductor disponible. Enciende el interruptor "Disponible" en la app.');
  }

  // 2. Dónde está el conductor, para crear la recogida cerca de él (a unos 800 m).
  const locationSnap = driverId ? await getDoc(doc(db, 'driverLocations', driverId)) : null;
  const driverLocation = locationSnap?.exists() ? locationSnap.data() : FALLBACK_LOCATION;
  const origin = {
    lat: driverLocation.lat + 0.007,
    lng: driverLocation.lng + 0.004,
    address: 'Punto de recogida cerca de ti (simulado)',
  };

  // 3. El destino y una estimación de la distancia y la duración entre los dos puntos.
  const destination = args.dest ? PLACES[Number(args.dest) - 1] : pick(PLACES);
  if (!destination) throw new Error(`El destino debe ser un número del 1 al ${PLACES.length}.`);
  const route = estimateTrip(origin, destination);

  const trip = {
    status: 'requested',
    candidateDriverId: driverId,
    driverId: null,
    passengerId: 'simulated-passenger',
    passengerName: pick(PASSENGERS),
    passengerRating: 4.9,
    origin,
    destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    category,
    paymentMethod,
    tip,
  };

  const estimate = calculateFare({ distanceKm: trip.distanceKm, durationMin: trip.durationMin, category, tip });
  console.log(`Pasajero:  ${trip.passengerName}`);
  console.log(`Recogida:  ${origin.address}`);
  console.log(`Destino:   ${destination.address}`);
  console.log(`Viaje:     ${trip.distanceKm} km · ${trip.durationMin} min · ${category} · ${paymentMethod}`);
  console.log(`Estimado:  tarifa ${money(estimate.fare)} · comisión ${money(estimate.commission)} · ganancia neta ${money(estimate.driverEarnings)}`);
  console.log(`Conductor: ${driverId ?? '(ninguno, simulacro)'}`);

  if (args['dry-run']) {
    console.log('\n[dry-run] No se guardó nada en Firestore.');
    return;
  }
  const created = await addDoc(collection(db, 'trips'), { ...trip, createdAt: serverTimestamp() });
  console.log(`\nSolicitud creada: trips/${created.id}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  });
