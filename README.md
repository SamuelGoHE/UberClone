# UberClone — Versión Conductor

App móvil multiplataforma (React Native + Expo) inspirada en la versión de conductor de Uber. Proyecto final de Desarrollo Móvil. El enunciado completo está en el PDF "UberClone — Versión Conductor".

El conductor se registra, espera su aprobación, se pone disponible, recibe solicitudes con un temporizador de 15 segundos, lleva al pasajero siguiendo la ruta, cobra el viaje con Mercado Pago (modo de prueba) o en efectivo, y consulta sus ganancias, su historial y su perfil.

## Estado del proyecto

| Funcionalidad del enunciado | Estado |
|---|---|
| Inicio de sesión, crear cuenta y sesión persistente (Firebase Auth) | Hecho |
| Registro en tres pestañas (datos personales, vehículo, documentos), fotos en Cloudinary, cuenta `pending` | Hecho |
| Inicio con mapa, disponibilidad (AsyncStorage + Firestore) y ubicación en tiempo real | Hecho |
| Solicitudes con temporizador de 15 s, aceptar y rechazar | Hecho |
| Viaje: ruta a la recogida, pasajero a bordo, ruta al destino, finalizar | Hecho |
| Tarifa, comisión y ganancia neta (`calculateFare`) | Hecho |
| Cobro con Mercado Pago (Checkout Pro, modo de prueba) y en efectivo, con las cuatro variantes del resumen | Hecho |
| Ganancias por día, semana y mes, y saldo del conductor | Hecho |
| Historial con filtros, paginación y detalle con la ruta dibujada | Hecho |
| Perfil editable, idioma español / inglés y cierre de sesión | Hecho (idioma parcial, ver limitaciones) |
| Notificaciones push con la app en segundo plano (FCM) | **No implementado** (ver limitaciones) |

## Tecnologías

- Expo SDK 58 y React Native 0.88 (JavaScript)
- React Navigation: Stack, Bottom Tabs y Drawer
- Firebase: Authentication y Cloud Firestore (tiempo real con `onSnapshot`)
- Cloudinary para las fotos (con un *upload preset* sin firmar, sin llaves secretas en la app)
- `react-native-maps` (Apple Maps en iPhone), `expo-location`, `expo-web-browser`
- OSRM para las rutas (gratuito, basado en OpenStreetMap)
- Mercado Pago Checkout Pro, a través de un backend propio en Node.js + Express
- Context + `useReducer` para el estado global; `AsyncStorage` solo para preferencias (disponibilidad e idioma)

## Requisitos previos

- Node.js 20.6 o superior y npm
- La app **Expo Go** en un celular (la cámara y el GPS solo se prueban en un dispositivo real)
- Un proyecto de **Firebase**, una cuenta de **Cloudinary** y cuentas de prueba de **Mercado Pago** (vendedor y comprador)
- El computador y el celular en **la misma red Wi-Fi** (el celular llega al backend por la IP del computador)

## Instalación

```bash
git clone https://github.com/SamuelGoHE/UberClone.git
cd UberClone
npm install                    # la app
cd backend && npm install      # el backend de pagos
cd ..
cp .env.example .env                    # y completa las variables
cp backend/.env.example backend/.env    # y completa las variables
```

### Configurar Firebase

1. En la consola de Firebase crea un proyecto y registra una app web; copia su configuración al `.env`.
2. **Authentication**: habilita *Correo electrónico/contraseña*.
3. **Firestore Database**: créala. Colecciones que usa la app: `drivers`, `driverLocations`, `trips` y `payouts`.
4. **Índices compuestos** (el Historial los necesita): en Firestore → Índices, crea para la colección `trips`:
   - `driverId` (ascendente) + `completedAt` (descendente)
   - `driverId` (ascendente) + `paymentMethod` (ascendente) + `completedAt` (descendente)

   Si falta alguno, la app muestra un error y la consola de la terminal imprime un enlace que lo crea con un clic.
5. **Clave de servicio** para el backend: Configuración del proyecto → Cuentas de servicio → *Generar nueva clave privada*. Guárdala dentro de `backend/` (por ejemplo `backend/src/services/serviceAccount.json`) y pon su ruta en `FIREBASE_SERVICE_ACCOUNT_PATH`. El `.gitignore` ya excluye `serviceAccount*.json`: **nunca la subas**.

### Configurar Cloudinary

1. Crea una cuenta gratuita y copia el *Cloud name*.
2. En *Settings → Upload → Upload presets* crea un preset con *Signing mode: Unsigned*.

### Configurar Mercado Pago (pruebas)

Crea una cuenta de prueba de **vendedor** y una de **comprador** en el panel de desarrolladores de Mercado Pago. El *access token* de la cuenta de vendedor va en `backend/.env`. Para pagar en el checkout se usan tarjetas de prueba (consulta la página oficial de tarjetas de prueba de Mercado Pago Colombia). En las pruebas del proyecto, la Mastercard `5254 1336 7440 3564`, código `123` y vencimiento `11/30` aprobó el pago con el titular **APRO** y lo rechazó con el titular **OTHE**. El checkout reutiliza las tarjetas guardadas del comprador: para probar un rechazo, elige "otro medio de pago" y escribe la tarjeta de nuevo.

## Variables de entorno

Se copian de `.env.example` a `.env` (que **no se sube a git**). El formato es `NOMBRE=valor`, **sin espacios alrededor del `=`, sin comillas y sin comas**.

**App (`.env`)**

| Variable | Qué es |
|---|---|
| `EXPO_PUBLIC_FIREBASE_*` (6 variables) | Configuración de la app web de Firebase |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nombre de tu nube de Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Nombre del preset sin firmar |
| `EXPO_PUBLIC_BACKEND_URL` | Dirección del backend: `http://<IP del computador>:3000` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Reservada; no se usa (los mapas usan Apple Maps y las rutas, OSRM) |

**Backend (`backend/.env`)** — contiene secretos y **nunca** va en la app ni en git

| Variable | Qué es |
|---|---|
| `PORT` | Puerto del servidor (3000) |
| `PUBLIC_URL` | `http://<IP del computador>:3000`, la misma de `EXPO_PUBLIC_BACKEND_URL` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de la cuenta de vendedor **de prueba** |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Ruta a la clave de servicio, relativa a `backend/` |

La IP del computador se obtiene con `ipconfig getifaddr en0` (macOS). **Cambia cuando te cambias de red Wi-Fi**: hay que actualizarla en los dos `.env` y reiniciar.

## Ejecutar

En dos terminales:

```bash
cd backend && npm run dev     # 1. el backend de pagos (puerto 3000)
npx expo start -c             # 2. la app; escanea el QR con Expo Go
```

Usa `-c` la primera vez y cada vez que cambies un `.env`: Expo guarda las variables en caché. Para comprobar la conexión, abre `http://<IP>:3000/health` en el navegador del celular: debe responder `{"ok":true}`.

## Cómo probar el flujo completo

1. **Registro.** Pulsa *Crear cuenta*, completa las tres pestañas (los errores salen debajo de cada campo) y toca *Enviar registro*. Las fotos suben a Cloudinary y el perfil queda en `drivers/{uid}` con `status: pending` ("Tu registro está en revisión").
2. **Aprobar.** En Firestore → `drivers` → tu documento, cambia `status` a `approved`. La app, abierta, pasa sola al Inicio.
3. **Disponible.** Activa el interruptor en el Inicio y acepta el permiso de ubicación.
4. **Solicitud.** En otra terminal, `npm run request`. Aparece la tarjeta con el temporizador de 15 s. Acepta.
5. **Viaje.** Sigue la ruta a la recogida, toca *Pasajero a bordo*, sigue la ruta al destino y toca *Finalizar viaje*.
6. **Cobro.** En efectivo, toca *Marcar cobro recibido*. Con Mercado Pago se abre el checkout: paga con una tarjeta de prueba, cierra el navegador y la app muestra el resultado (*Actualizar estado* y *Reintentar cobro* si hace falta).
7. **Ganancias, Historial y Perfil** desde el menú lateral. `npm run rate` simula que el pasajero califica el viaje terminado más reciente.
8. **Datos para el historial.** `npm run seed:history -- --driver <uid>` crea 45 viajes cobrados de ejemplo (llevan `simulated: true`); `npm run seed:history -- --driver <uid> --clear` los borra. Mientras existan cuentan en Ganancias y en el saldo.

## Estructura del proyecto

```
src/
├── components/   forms/ (campos reutilizables), registration/, trip/, history/, common/
├── config/       pricing.js — valores de la tarifa en un solo lugar
├── constants/    estados del viaje, categorías, métodos de pago, opciones del registro
├── context/      AuthContext (sesión), RegistrationContext, TripContext (viaje activo), LanguageContext
├── hooks/        useDriverLocation, useTripRequests, useEarnings, useTripHistory, useRoute…
├── i18n/         translations.js — diccionario español / inglés
├── navigation/   RootNavigator (Stack condicional), DrawerNavigator, RegistrationTabs
├── screens/      Auth, Register, Home, Trip, Summary, Earnings, History, Profile
├── services/     firebase/ (drivers, trips, payouts, locations), cloudinary/, maps/ (OSRM), payments/
├── theme/        colores, espaciado, bordes y tipografía
└── utils/        calculateFare, earnings, profile, historyFilters, validators, formatDate…
backend/          servidor Express: crea el cobro en Mercado Pago y guarda el resultado en el viaje
tools/            simuladores de pasajero (request, rate) y datos de prueba (seed-history)
docs/AI_LOG.md    bitácora de uso de IA
```

**Navegación.** Un único Stack con pantallas condicionales: sin sesión → Login y Crear cuenta; con sesión y sin perfil → Registro; perfil `pending` → "En revisión"; `approved` → el menú lateral (Inicio, Ganancias, Historial, Perfil); con un viaje abierto → la pantalla del viaje o el resumen del cobro. No se usa `navigate` para entrar o salir: la pantalla cambia sola cuando cambian los datos.

**Estados del viaje.** El campo `status` de `trips/{id}` controla qué pantalla se ve: `requested` → `accepted` → `driver_arriving` → `in_progress` → `completed` → `paid`, o `cancelled` y `rejected`. Las transiciones se hacen con transacciones de Firestore.

## Tarifa y comisión

`src/utils/calculateFare.js` recibe `{ distanceKm, durationMin, category, tip }` y devuelve `{ fare, commission, driverEarnings }`, en pesos colombianos enteros, con una comisión del 20 % configurable en `src/config/pricing.js`. Con el ejemplo del enunciado (8,5 km y 22 min) da 19.200 COP en Económico y 26.900 COP en XL.

## Simulador de pasajero

Esta app es solo la del conductor, así que no existe quien pida los viajes. `tools/passenger/send-request.mjs` hace de pasajero: crea una solicitud en `trips` dirigida al conductor que esté **disponible**.

```bash
npm run request                                          # solicitud al azar
npm run request -- --category xl --payment cash --tip 2000
npm run request -- --dest 3                              # destino número 3 de la lista
npm run request -- --dry-run                             # muestra la solicitud sin guardarla
```

La distancia y la duración de cada solicitud son una **estimación local** (`tools/passenger/estimate.mjs`). La tarifa no se guarda en la solicitud: la calcula la app con `calculateFare`.

## Decisiones propias

- **Rutas con OSRM en lugar de Google Directions**: es gratuito y no exige facturación. El servicio vive aislado en `src/services/maps/`: cambiar de proveedor solo reescribe ese archivo. Se pide una ruta por tramo y la del viaje se guarda (reducida a 100 puntos) para dibujarla en el historial sin consultar de nuevo.
- **El backend lee el monto del viaje en Firestore** y no lo recibe de la app, para que nadie pueda cobrar un valor distinto de la tarifa. El pasajero paga la tarifa más la propina.
- **Sin webhook público**: la app consulta el resultado del pago ("Actualizar estado") y el backend lo guarda en el viaje.
- **El cobro final usa los valores de la solicitud aceptada** (distancia, duración y tarifa), no los del recorrido real.
- **Semana** = de lunes a domingo. **Saldo** = ganancia neta de los viajes por pasarela menos la comisión de los viajes en efectivo; puede ser negativo. La liquidación es simulada (un registro en `payouts`).
- **Año del vehículo**: se acepta hasta el año siguiente (hay modelos que salen un año antes). **Revisión técnico-mecánica**: se exige desde los 6 años del vehículo (supuesto, el enunciado no lo precisa).
- **Perfil**: se editan nombre, celular, género, color, capacidad, correo de Mercado Pago, vencimientos de documentos e idioma; categoría, placa, marca, modelo, año, documento y correo son de solo lectura, y `status`, `isAvailable` y `createdAt` nunca se editan.

## Limitaciones conocidas

- **No hay notificaciones push (FCM)**: el enunciado las marca como obligatorias, pero requieren un *development build* y no funcionan en Expo Go. La solicitud se detecta con `onSnapshot` mientras la app está abierta.
- **El backend corre en el computador** y el celular debe estar en la misma Wi-Fi. No autentica sus rutas (cualquiera en la red que conozca un `tripId` puede llamarlas) y el enlace de pago de Mercado Pago puede pagarse más de una vez. Es suficiente para el proyecto; en producción se verificaría el token de Firebase del conductor.
- **Firestore está en modo de prueba** (las reglas abiertas caducan en la fecha configurada en la consola) y no hay reglas de seguridad por usuario. La liquidación se calcula con el saldo que ve el cliente.
- **Idioma parcial**: el menú, el Inicio y el Perfil se traducen; el resto de las pantallas está en español.
- **Perfil**: no se pueden cambiar las fotos de perfil, vehículo ni documentos.
- **Solo se probó en iPhone** (Expo Go); Android no se ha probado.
- **OSRM** usa un servidor público de demostración, sin garantías de disponibilidad.
- Los viajes de prueba del simulador no tienen un pasajero real ni cancelaciones del pasajero.

## Uso de IA

Durante el desarrollo del proyecto utilicé **Claude Code** como herramienta de desarrollo: la IA propuso y mejoro la mayor parte del código a partir de mis instrucciones, y también ayudó con la resolución de errores y la optimización. Mi participación consistió en definir los requisitos y funcionalidades, orientar la implementación, revisar y ajustar las soluciones propuestas, realizar pruebas directamente en un iPhone y tomar las decisiones relacionadas con el diseño y funcionamiento de la aplicación.

Las decisiones técnicas, la integración de las funcionalidades, la validación de resultados y el control de versiones estuvieron bajo mi responsabilidad. Los 55 archivos principales (de los 89 de código) están identificados con la marca `AI-assisted`; la asistencia de la IA abarcó todo el proyecto, y el registro detallado de cada uso, con los archivos y el commit de cada entrada, está en [docs/AI_LOG.md](docs/AI_LOG.md) (campo "Archivos y commit").
