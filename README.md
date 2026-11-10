# UberClone — Versión Conductor

App móvil multiplataforma (React Native + Expo) inspirada en la versión de conductor de Uber. Proyecto final de Desarrollo Móvil. El enunciado completo está en el PDF "UberClone — Versión Conductor".

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Iniciar sesión y crear cuenta (Firebase Auth, sesión persistente) | Hecho |
| Registro del conductor: pestaña **Datos personales** | Hecho |
| Registro del conductor: pestaña **Vehículo** | Hecho |
| Subida de fotos a Cloudinary y guardado en Firestore (`status: pending`) | Hecho |
| Cálculo de tarifa, comisión y ganancia (`calculateFare`) | Hecho (sin pantalla todavía) |
| Registro: pestaña **Documentos** y envío con las tres pestañas completas | Hecho |
| Inicio con mapa y disponibilidad, solicitudes, viaje, cobro, ganancias e historial | Pendiente |
| Backend de pagos (Express + Mercado Pago) | Pendiente |

## Tecnologías

- Expo SDK 58 y React Native 0.88 (JavaScript)
- React Navigation: Stack, Bottom Tabs y Drawer
- Firebase: Authentication y Cloud Firestore
- Cloudinary para las fotos (con un *upload preset* sin firmar, sin llaves secretas en la app)
- Context + `useReducer` para el estado global

## Requisitos previos

- Node.js 20 o superior y npm
- La app **Expo Go** instalada en un celular (la cámara solo se puede probar en un dispositivo real)
- Un proyecto de **Firebase** y una cuenta de **Cloudinary** (ver más abajo)

## Instalación y ejecución

```bash
git clone https://github.com/SamuelGoHE/UberClone.git
cd UberClone
npm install
cp .env.example .env      # y completa las variables (ver siguiente sección)
npx expo start -c
```

Escanea el código QR con Expo Go. Usa `-c` la primera vez y cada vez que cambies el `.env`, porque Expo guarda las variables en caché.

### Configurar Firebase

1. En la consola de Firebase crea un proyecto y registra una app web; copia su configuración.
2. **Authentication**: habilita el método *Correo electrónico/contraseña*.
3. **Firestore Database**: créala (en modo de prueba para desarrollo).

### Configurar Cloudinary

1. Crea una cuenta gratuita y copia el *Cloud name*.
2. En *Settings → Upload → Upload presets* crea un preset con *Signing mode: Unsigned* (opcionalmente con la carpeta `uberclone-driver`).

## Variables de entorno

Se copian de `.env.example` a `.env` (que **no se sube a git**). El formato es `NOMBRE=valor`, **sin espacios alrededor del `=`, sin comillas y sin comas**.

| Variable | Qué es |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Configuración de la app web de Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | ídem |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ídem |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | ídem |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ídem |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ídem |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nombre de tu nube de Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Nombre del preset sin firmar |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Reservada; todavía no se usa |
| `EXPO_PUBLIC_BACKEND_URL` | Reservada para el backend de pagos |

Las variables del backend (`backend/.env.example`) contienen secretos, como el token de Mercado Pago, y **nunca** van en la app ni en git.

## Cómo probar el registro

1. Abre la app y pulsa **Crear cuenta** (correo y contraseña de al menos 6 caracteres).
2. Se abre el **registro**, con tres pestañas. Completa *Datos personales*, *Vehículo* y *Documentos*: los errores aparecen debajo de cada campo.
3. Cuando las tres pestañas estén completas (check verde), el botón **Enviar registro** se habilita. Al pulsarlo, las fotos se suben a Cloudinary, el registro se guarda en Firestore en `drivers/{uid}` con `status: pending` y la app pasa sola a **"Tu registro está en revisión"**.
4. Para **aprobar** la cuenta: en la consola de Firebase abre Firestore → colección `drivers` → tu documento y cambia el campo `status` de `pending` a `approved`. La app, abierta, pasa al Inicio sin recargar.

## Estructura del proyecto

```
src/
├── components/   forms/ (campos reutilizables) y registration/ (barra de envío, pestañas)
├── config/       pricing.js — valores de la tarifa en un solo lugar
├── constants/    estados del viaje, categorías, opciones del registro
├── context/      AuthContext (sesión y perfil) y RegistrationContext (datos del registro)
├── navigation/   RootNavigator (Stack condicional) y RegistrationTabs
├── screens/      Auth, Register, Home
├── services/     firebase/ y cloudinary/
├── theme/        colores, espaciado, bordes y tipografía
└── utils/        validators, calculateFare, formatDate, buildDriverRecord
backend/          reservado para el servidor Express de pagos
docs/AI_LOG.md   bitácora de uso de IA
```

**Navegación:** un único Stack con pantallas condicionales según la sesión: sin sesión → Login y Crear cuenta; con sesión y sin perfil → Registro; perfil `pending` → "En revisión"; perfil `approved` → Inicio. React Navigation cambia de pantalla solo cuando cambia la sesión o el perfil.

## Tarifa y comisión

`src/utils/calculateFare.js` recibe `{ distanceKm, durationMin, category, tip }` y devuelve `{ fare, commission, driverEarnings }`, en pesos colombianos enteros, con una comisión del 20 % configurable en `src/config/pricing.js`. Con el ejemplo del enunciado (8,5 km y 22 min) da 19.200 COP en Económico y 26.900 COP en XL.

## Simulador de pasajero

Esta app es solo la del conductor, así que no existe quien pida los viajes. El script `tools/passenger/send-request.mjs` hace de pasajero: crea una solicitud en la colección `trips` de Firestore dirigida al conductor que esté **disponible**, con una distancia y una duración estimadas.

```bash
npm run request                                          # solicitud al azar
npm run request -- --category xl --payment cash --tip 2000
npm run request -- --dest 3                              # destino número 3 de la lista
npm run request -- --dry-run                             # muestra la solicitud sin guardarla
```

Cada solicitud guarda `status: "requested"`, `candidateDriverId`, el origen y el destino (`lat`, `lng`, `address`), `distanceKm`, `durationMin`, `category`, `paymentMethod` y `tip`. La tarifa, la comisión y la ganancia no se guardan en la solicitud: las calcula la app con `calculateFare`.

La distancia y la duración de cada solicitud son una **estimación local** (`tools/passenger/estimate.mjs`: línea recta por un factor de calles y una velocidad promedio de ciudad); la ruta real del viaje se calcula en otro paso.

## Uso de IA

Se usó **Claude Code** (asistente de programación de Anthropic) durante el desarrollo, y cada uso está registrado en la bitácora: [docs/AI_LOG.md](docs/AI_LOG.md).
