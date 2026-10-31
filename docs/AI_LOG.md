# Bitácora de uso de IA

Registrar cada entrada en el momento de usar la herramienta. Plantilla:

### Entrada #N
- Fecha:
- Integrante:
- Herramienta:
- Objetivo:
- Prompt:
- Resumen de la respuesta:
- Qué se usó / modificó / descartó:
- Archivos y commit:
- Verificación:
- Aprendizaje:

---

### Entrada #1
- Fecha: 2026-10-29
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Definir el rol de Claude como tutor (guía sin escribir el código del proyecto) y obtener un plan de trabajo por fases a partir del PDF del enunciado.
- Prompt: "hola, estoy haciendo un proyecto de la materia desarrollo movil, el proyecto basicamente es la copia de uber, ya en estos momentos cree el proyecto con expo y estructure las carpetas, a partir de estos momentos seras mi tutor, me ayudaras en este proceso en la construccion de la aplicacion al igual como hicimos con la app de reservas de ingles, donde no modificaste codigo, sino que me diste la guia para poder hacerlo yo, que necesito, te mandare el pdf para que tengas contexto de lo que necesito y para que ademas me ayudes con la bitacora, para que el proyecto sea transparente y se guarde siempre cada conversacion que tengamos como lo pide la profesora" (se adjuntó el PDF "UberClone — Versión Conductor")
- Resumen de la respuesta: Claude revisó el estado del repo (Expo 58, carpetas vacías, .env.example, bitácora), propuso un plan en fases (fundamentos, registro, home/ubicación, solicitudes/viaje, pagos, ganancias/historial, extras) y señaló la decisión pendiente de navegación (React Navigation vs Expo Router). Registró esta entrada.
- Qué se usó / modificó / descartó: Se usa el plan de fases como hoja de ruta. Pendiente de decidir: la navegación.
- Archivos y commit: docs/AI_LOG.md — ff378bd (PR #1, merge 56c1607)
- Verificación: Revisión manual del plan contra las secciones 2 a 9 del PDF.
- Aprendizaje: (completar por el integrante)

---

### Entrada #2
- Fecha: 2026-10-29
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Crear la configuración de precios (pricing.js) y la función pura calculateFare con comisión configurable.
- Prompt: "pricing.js y calculatefare donde van?" / "perfecto, en esos archivos van me imagino que condiciones de la app" / "ahh, entiendo debo poner logica y por asi decirlo calculos para realizar temas de precios y de funciones?" / "realice el percing como el ejemplo que esta en el pdf" / "si categoria llega con un valor inexistente supongo que no retornara el pricing"
- Resumen de la respuesta: Claude indicó las rutas (src/config y src/utils), explicó que pricing.js solo contiene valores y calculateFare contiene la lógica, y dio el orden de cálculo (multiplicador, mínima, redondeo, comisión, ganancia). Revisó el código del integrante y señaló que una categoría inexistente produce NaN sin error si no se valida. Entregó un comando de prueba con el ejemplo del PDF.
- Qué se usó / modificó / descartó: El código de ambos archivos lo escribió el integrante a partir de la guía; Claude solo revisó. Se usó el orden de cálculo y la validación con throw para categorías desconocidas. Se descartó agregar "type": "module" al package.json.
- Archivos y commit: src/config/pricing.js, src/utils/calculateFare.js — ff378bd (PR #1, merge 56c1607)
- Verificación: Ejecutada con node: 8,5 km y 22 min da economy 19200/3840/15360 y xl 26900/5380/21520; 0,5 km y 2 min aplica la tarifa mínima (6000).
- Aprendizaje: (completar por el integrante)

---

### Entrada #3
- Fecha: 2026-10-30
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Decidir el orden de trabajo (constantes antes que navegación) y crear las constantes de estados del viaje y categorías.
- Prompt: "como vamos, antes de hqcer eso voy a orgnizar el repositorio y te hago una pregunta, si seria mejor empezar por la navegacion o mejor empezar por las constantes, porque ya tenemos el pricing y el calculatefare, entonces no crees que seria mejor crear los estados de viaje y sus categorias? es una opinion, corrigeme si estoy mal" / "pero tengo que crear todos esos archivos? seria ya mucho contenido, seria mejor empezar como te dije por la categoria y puede ser el estado del viaje, que supongo que son la informacion tambien que se relaciona con lo que hicimos ayer" / "pero antes de hacer eso revisame mis cambios, ya cree las dos constantes"
- Resumen de la respuesta: Claude confirmó que empezar por constantes es buena idea porque son datos sin dependencias que usan navegación, hooks e historial. Recomendó crear solo categories.js y tripStatus.js y dejar payment.js y driverStatus.js para sus fases. Revisó los archivos y los valores contra el PDF (7 estados más rejected, 3 categorías) y señaló que las claves de pricing.js no están ligadas a CATEGORIES.
- Qué se usó / modificó / descartó: Se usó la propuesta de dos archivos. Los escribió el integrante con la información del PDF. Se descartó crear payment.js y driverStatus.js por ahora. Pendiente de decidir si pricing.js usa CATEGORIES como claves.
- Archivos y commit: src/constants/categories.js, src/constants/tripStatus.js — c546e3f
- Verificación: Revisión manual de los valores contra la sección 3 y el modelo de datos del PDF.
- Aprendizaje: (completar por el integrante)

---

### Entrada #4
- Fecha: 2026-10-30
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5) para la guía; IA de diseño en Figma (indicar cuál) para los mockups y estilos
- Objetivo: Definir la paleta, tipografía, espaciado y bordes en Figma y pasarlos al tema del código (src/theme/colors.js).
- Prompt: Con Claude: "me recomiendas usar figma o alguna plataforma para hacer los mockups para que no sea simplemente un diseno sin sentido, me gustaria tomarme el tiempo y hacerlo con orden, he vito videos en redes sociales sobre app similares y me gustaria tenerlas como inspiracion" / "me ayudare de la ia para hacer algunos disenos en figma, para que lo tengas en cuenta" / "mira, ya tengo lo que me dijiste en temas sobre colors, esto fue lo que hice con figma y asi quedo el codigo". Con la IA de Figma: (pegar aquí el prompt literal que usaste, sin datos personales ni llaves)
- Resumen de la respuesta: Claude recomendó Figma, una lista de pantallas derivada del PDF y limitar el tiempo de diseño. Al revisar el tema comparó la hoja de estilos de Figma con colors.js: colores, espaciado, bordes y tipografía coinciden, salvo la clase display (40/46) que no existe en Figma. Advirtió que el verde y el ámbar tienen poco contraste como color de texto sobre blanco.
- Qué se usó / modificó / descartó: Se usó la hoja de estilos de Figma como fuente de los valores del tema. Pendiente: decidir si display se agrega a Figma o se elimina del código; completar qué se conservó y qué se descartó de lo generado por la IA de Figma.
- Archivos y commit: src/theme/colors.js — 1c69562 · Figma: archivo "UberClone Conductor" (agregar enlace)
- Verificación: Comparación valor por valor entre la captura de la hoja "Estilos" de Figma y el código.
- Aprendizaje: (completar por el integrante)

---

### Entrada #5
- Fecha: 2026-10-30
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Configurar Firebase (Auth con persistencia y Firestore) y probar la conexión antes de construir las pantallas.
- Prompt: "pero antes aagregue unas dependencias de firebase, me gustaria hacer la configuracion del firabase asi como se hizo con el recetario, empezar en orden para poder mas adelnate ir haciendo las pruebas de funcionalidad de la app" / "y como hago todo eso, dame el paso a paso" / "ya hice eso, haz la entrada a la bitacora que consideres, si todavia no hay no te procupes, la haces despues, voy a descansar un momento y despues sigo, creo que ya hice los cambios que me sugeristes, de igual manera ves algo raro me dices, creeria que el firebase ya esta."
- Resumen de la respuesta: Claude indicó que el SDK web "firebase" es el adecuado para Expo Go y que FCM (@react-native-firebase/messaging) requiere development build y se deja para después. Dio el orden: consola de Firebase, inicialización, Auth con AsyncStorage, Firestore y una prueba descartable con addDoc y onSnapshot con función de limpieza. Revisó el código: comprobó en node_modules que getReactNativePersistence existe en la build de React Native de firebase 13.1.0 y recomendó relanzar los errores distintos de auth/already-initialized y avisar de variables de entorno faltantes.
- Qué se usó / modificó / descartó: El integrante escribió src/services/firebase/index.js. Se aplicaron las dos mejoras sugeridas (catch que solo atrapa auth/already-initialized y chequeo de variables faltantes). Se descartó instalar @react-native-firebase/messaging por ahora.
- Archivos y commit: src/services/firebase/index.js — ebd231b; dependencias en package.json — 2219910
- Verificación: Según el integrante, prueba descartable de escritura y lectura en tiempo real en la colección "test", ya eliminada junto con el código de prueba (completar: qué se vio en pantalla y en la consola de Firebase, y la fecha).
- Aprendizaje: (completar por el integrante)

---

### Entrada #6
- Fecha: 2026-10-30
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Construir el inicio de sesión: contexto de sesión (AuthContext), escucha del perfil del conductor, componente FormField y LoginScreen con validación por campo.
- Prompt: "volvi, estuve mirando algunas cosas y me puse a investigar un poquito sobre la app de uber, en estos momentos ya con el firebase configurado seria bueno crear el login, este es importante para la primera entrega y para poder entrar a la app con credenciales, de hecho ayer que estuve configurando firebase cree un usuario, y en el pdf piden algo relacionado a iniciar con asyncstorage, si me aceptas eso lo empezamos a realizar" / "pero todavia no he hecho el pr porque no he terminado la fase 2" / "voy a instalar entonces lo que me dijiste" / "que ira en el auth context, me imagino que logica del login y de autentificacion?" / "vale, entiendo" / "mira el contenido del siguiente componente, es el formfield" y "y este es el loging screen" (se pegó el código de ambos) / "perfecto, dime como hago esos ajustes" / "vale, me demore un poquito haciendolo, revisa como me quedo, ya quedaria realizar el app.js?"
- Resumen de la respuesta: Claude aclaró que AsyncStorage guarda la sesión mediante la persistencia de Firebase Auth (no se guarda la contraseña ni el token a mano) y que las preferencias van aparte. Explicó qué va en el AuthContext (user, loading, signIn, signOut) y qué no (validación y estilos). Revisó AuthContext, drivers.js, FormField y LoginScreen: advirtió que guardar la ubicación en drivers/{uid} re-renderizaría toda la app, que el onSnapshot de drivers silencia los errores como "sin perfil", y que onSubmitEditing evitaba la protección contra doble envío. Indicó cómo conectar App.js con un render condicional.
- Qué se usó / modificó / descartó: El integrante escribió el código. Se usó la estructura con dos useEffect con limpieza, useCallback y useMemo. Se aplicaron los ajustes de doble envío (return si submitting) y foco al siguiente campo (useRef y submitBehavior). Decisiones del integrante: la ubicación irá en driverLocations/{uid}; distinguir "no existe" de "falló" y traducir los textos (i18n) se dejan para después; React Navigation no se instala todavía y se usa un condicional en App.js.
- Archivos y commit: src/services/firebase/drivers.js, zonas seguras — 1ab8c12; src/context/AuthContext.js — 95151ab; src/components/forms/FormField.js — 9f8ac33; src/screens/Auth/LoginScreen.js — 69083c0; App.js, src/screens/Home/HomeScreen.js y src/constants/driverStatus.js — (pendiente de commit)
- Verificación: Login probado en el iPhone con el usuario de prueba de Firebase: entra y muestra la pantalla provisional con el saludo y "Cerrar sesión". (Completar: validación de campos vacíos y correo inválido, credenciales incorrectas, persistencia al cerrar y reabrir la app, cierre de sesión y cambio del campo status en drivers/{uid} en tiempo real.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #7
- Fecha: 2026-10-30
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Depurar el error auth/api-key-not-valid que impedía iniciar sesión con credenciales correctas.
- Prompt: "no me deja iniciar sesion" / "sino que en el Firebase creé como tal pues una autentificación de un conductor test para probar el login, ¿cierto? Pero creé pues como tal la autentificación, pero no me deja entrar." / "Suponiendo las credenciales correctas, pero me sale no pudimos iniciar sesión, inténtalo de nuevo." / "WARN signIn error: auth/api-key-not-valid.-please-pass-a-valid-api-key. Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)." / "ahhhok, entendido, hago esas correcciones" / "hice el cmbio pero me sigue saliendo un error" (con el mismo WARN) / "WARN signIn error: auth/api-key-not-valid.-please-pass-a-valid-api-key. | longitud de la llave en la app: 42" / "perfecto, ya me dejo, me sale, hola conductor de prueba y cerrar sesion"
- Resumen de la respuesta: El mensaje genérico indicaba que el código de error no estaba en el mapa de AuthContext. Con un registro temporal del error.code se vio auth/api-key-not-valid. Claude comprobó el .env sin imprimir valores: todas las variables tenían comillas, espacios y coma final (la API key medía 43 en vez de 39). Tras corregir el archivo el error siguió: la app veía una llave de 42 caracteres. Claude inspeccionó el entorno del proceso de Expo y encontró que la terminal tenía exportadas las variables viejas, que tienen prioridad sobre el .env. Se limpiaron con unset y se reinició con caché limpia.
- Qué se usó / modificó / descartó: Se corrigió el formato del .env (valor sin comillas, espacios ni coma) y se limpiaron las variables EXPO_PUBLIC_* de la terminal. Se dejó el registro de errores desconocidos solo para desarrollo. Pendiente: confirmar que el console.warn que imprime la longitud de la llave se haya quitado de AuthContext.
- Archivos y commit: .env (no versionado); src/context/AuthContext.js — e0d1a84
- Verificación: Tras reiniciar Expo con "npx expo start -c" y sin variables exportadas en la terminal, el login funciona en el iPhone con el usuario de prueba.
- Aprendizaje: (completar por el integrante: por qué las variables de la terminal ganan al .env y cómo se detectó)
