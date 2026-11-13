// AI-assisted: see docs/AI_LOG.md #29
// SIMULADOR DE PASAJERO: CALIFICAR UN VIAJE. El pasajero califica el viaje al terminar (1 a 5 estrellas). Como la
// app del pasajero no existe, este script escribe esa calificación en el viaje (campo rating, del modelo del
// enunciado). No confundir con passengerRating, que es la reputación del pasajero y la guarda send-request.mjs.
// El detalle del Historial muestra rating como estrellas.
//
// Uso (desde la raíz del proyecto):
//   npm run rate                          califica con 4 o 5 estrellas el viaje terminado más reciente sin calificación
//   npm run rate -- --stars 3             con esa cantidad de estrellas
//   npm run rate -- --trip <id> --stars 5 un viaje concreto (el id está en Firebase > trips)
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';

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

async function main() {
  const args = readArgs(process.argv.slice(2));
  const stars = args.stars === undefined ? 4 + Math.round(Math.random()) : Number(args.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error('--stars debe ser un entero de 1 a 5.');

  const db = getFirestore(
    initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    }),
  );

  let tripRef;
  if (typeof args.trip === 'string') {
    tripRef = doc(db, 'trips', args.trip);
  } else {
    // El viaje terminado más reciente que todavía no tenga calificación.
    const recent = await getDocs(query(collection(db, 'trips'), orderBy('completedAt', 'desc'), limit(20)));
    const target = recent.docs.find((tripDoc) => tripDoc.data().rating === undefined);
    if (!target) throw new Error('No hay viajes terminados sin calificación entre los 20 más recientes.');
    tripRef = target.ref;
  }

  const snapshot = await getDoc(tripRef);
  if (!snapshot.exists()) throw new Error(`El viaje ${tripRef.id} no existe.`);
  const trip = snapshot.data();
  if (!['completed', 'paid'].includes(trip.status)) {
    throw new Error(`El viaje ${tripRef.id} está en estado "${trip.status}": solo se califican viajes terminados.`);
  }

  await updateDoc(tripRef, { rating: stars, ratedAt: serverTimestamp() });
  console.log(`Viaje ${tripRef.id} (${trip.passengerName ?? 'pasajero'} → ${trip.destination?.address ?? ''})`);
  console.log(`Calificación: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} (${stars}/5)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  });
