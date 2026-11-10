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

---

### Entrada #8
- Fecha: 2026-10-31
- Integrante: Samuel Gómez
- Herramienta: IA de diseño en Figma (indicar cuál) para los mockups; Claude Code (Claude Sonnet 5.5) para la guía y la revisión
- Objetivo: Diseñar en Figma las pantallas del flujo de registro antes de programar la navegación: Crear cuenta (vacía y con errores), Registro pestaña 1 (Datos personales) y pestaña 2 (Vehículo).
- Prompt: Con Claude: "hola, como vamos, voy a empezar por toda la parte de navegacion, ya despues de eso me vas guaindo, primero hare los mockups" / "use figma para estas pestanas, agregalo en bitacora" (se adjuntaron las capturas de los mockups). Con la IA de Figma: (pegar aquí el prompt literal que usaste, sin datos personales ni llaves)
- Resumen de la respuesta: Claude propuso diseñar primero el mapa de navegación y las pantallas clave (Crear cuenta, tres pestañas, estado de la cuenta y Drawer) y, al recibir las capturas, las comparó con los campos del PDF (secciones 2 y 3).
- Qué se usó / modificó / descartó: Se usó el diseño de Figma como referencia para programar. Pendiente de completar: qué se conservó y qué se descartó de lo generado por la IA; diseño de la pestaña 3 (Documentos), de la pantalla de cuenta pendiente de aprobación y del Drawer.
- Archivos y commit: Figma: archivo "UberClone Conductor" (agregar enlace); sin cambios de código todavía
- Verificación: Comparación campo por campo de las pestañas 1 y 2 contra las tablas del PDF.
- Aprendizaje: (completar por el integrante)

---

### Entrada #9
- Fecha: 2026-10-31
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Instalar React Navigation, crear las pantallas vacías y los navegadores (Stack condicional y pestañas del registro).
- Prompt: "instalare las librerias y despues de eso las pantallas vacias, ire haciendo las cosas, te cuento y me vas corrigiendo" / "ya la instalacion quedo, se instalaron 8 paquetes, fueron estos" / "el drawer pide algun requisito?" / "perfecto, entonces comenzamos con las pantallas vacias?" / "listo, revisame para poder continuar con los navegadores" / "como hago todo eso jasjajsajsajs" / "estoy creando las pnatallas vacias y por el momento van bien, estoy haciendo pruebas para luego continuar con los validadores"
- Resumen de la respuesta: Claude verificó la instalación (expo-doctor solo marcó un parche de expo), confirmó que los requisitos del Drawer (Gesture Handler, Reanimated, Worklets) se cumplen y que babel-preset-expo agrega el plugin de worklets. Propuso construir la navegación por pasos (stack de autenticación, pestañas del registro y navegador raíz) y recomendó un único Stack con pantallas condicionales según la sesión y el estado del conductor.
- Qué se usó / modificó / descartó: El integrante escribió los tres navegadores y las cinco pantallas. Se usó el Stack condicional (loading, sin sesión, sin perfil, aprobado, pendiente), un solo NavigationContainer y el botón provisional de cerrar sesión. El Drawer queda instalado pero sin usar hasta las pantallas de perfil, historial y ganancias.
- Archivos y commit: src/navigation/RootNavigator.js, src/navigation/RegistrationTabs.js, pantallas de src/screens — b69eef4
- Verificación: Navegación probada en el iPhone: Login y Crear cuenta, registro con tres pestañas, pantalla de revisión y cambio de estado del conductor. (Completar con lo que se vio en cada caso.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #10
- Fecha: 2026-10-31
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Crear los validadores del registro y la pantalla Crear cuenta con registro en Firebase Auth (signUp).
- Prompt: "creare entonces las reglas de las pantallas del avqnce" / "me confirmas esto porfa" (resumen de las reglas de validación de edad, contraseña, placa, capacidad y listas) / "sip, crear cuenta" / "donde va el singup" / "pero he hecho varios cambios, revisa mi proyecto completo y me das tu desicion final" / "revisame el createaccountscreen, para ver si continuo con claudinary" / "ya hice las pruebas, realmente senti que todo paso bien"
- Resumen de la respuesta: Claude propuso la lista de reglas del PDF para las pestañas 1 y 2 como funciones puras que devuelven null o un mensaje, y las probó con casos de borde (cumplir 18 hoy, mañana, placa en minúsculas, XL con 4 y 6 pasajeros). Indicó que signUp va en AuthContext con un mapa de errores que dice en qué campo mostrar cada uno (incluido "form") y revisó la pantalla Crear cuenta.
- Qué se usó / modificó / descartó: El integrante escribió validators.js, signUp y CreateAccountScreen. Decisiones propias: mayor de edad se cumple con la fecha completa y cumplir 18 hoy es válido; la contraseña no se recorta y el mínimo es 6 (el de Firebase); no hay tope de pasajeros para Económico y Premium; las listas usan una sola función validateSelection. Pendiente: actualizar el mockup de Figma (dice mínimo 8 caracteres) y reutilizar validateEmail en el login.
- Archivos y commit: src/utils/validators.js — 324d12a; src/context/AuthContext.js y src/screens/Auth/CreateAccountScreen.js — 6060d37
- Verificación: Validadores probados con Node usando una fecha fija. Crear cuenta probada en el iPhone con cinco casos (cuenta nueva, correo repetido, errores por campo, modo avión, volver a entrar con la cuenta nueva); según el integrante, todo funcionó. (Completar el detalle de lo que se vio.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #11
- Fecha: 2026-10-31
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5) y consulta externa (indicar cuál) para el plan de componentes
- Objetivo: Evaluar un plan para construir tres componentes reutilizables (SelectField, DateField y PhotoField) antes de las pestañas del registro.
- Prompt: "estuve consultando y seria bueno implementar esto para esta fase de desarrollo, dime que opinas y dejamos aqui por hi, haz las entradas que consideres para la bitacora." (se pegó el plan de los selectores reutilizables; indicar de dónde salió)
- Resumen de la respuesta: Claude evaluó el plan: es coherente con los mockups y con los validadores existentes; recomendó construir un componente por commit empezando por SelectField, revisar la documentación de SDK 58 antes de instalar expo-image-picker y el selector de fecha, y hacer que DateField entregue un objeto Date porque validateBirthDate lo espera.
- Qué se usó / modificó / descartó: (completar: qué parte del plan se adopta y cómo se divide el trabajo, ya que el código de los componentes lo escribe el integrante)
- Archivos y commit: sin cambios de código todavía
- Verificación: Revisión del plan contra el diseño de Figma y los validadores.
- Aprendizaje: (completar por el integrante)

---

### Entrada #12
- Fecha: 2026-11-01
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Construir los componentes reutilizables SelectField (lista desplegable) y DateField (selector de fecha) para las pestañas del registro.
- Prompt: "esto es lo que tengo en el figma" (captura de la pestaña 1 de Datos personales) / "revisalo" (código de SelectField) / "hare las pruebs, antes de eso segun lo que hice entendi esto, corrigeme si estoy mal" / "ok, seguire con datefile, para ir llenando la informacion del conductor" / "se crea casi que con la misma estructura que selctfield?" / "asi voy" (primeras líneas de DateField) / "termine, revisamelo" / "ya hice las pruebas y subi el commit, que sigue? photofield?"
- Resumen de la respuesta: Claude relacionó cada elemento del mockup con un componente y un validador existente. Revisó SelectField (componente controlado con hoja modal, opciones { value, label }, zona segura) y recomendó cerrar el teclado al abrirlo y decidir el color del check. Para DateField indicó leer la documentación de @react-native-community/datetimepicker 9.2.1 (SDK 58), explicó qué se reutiliza de SelectField y qué cambia (selector del sistema, diferencias iPhone y Android) y probó formatDate con Node (ceros, bisiesto, entradas inválidas).
- Qué se usó / modificó / descartó: El integrante escribió ambos componentes y formatDate. Se adoptó Keyboard.dismiss() al abrir, el borrador de fecha en iPhone con botón "Listo", el valor inicial de 18 años atrás y el plugin del selector de fecha en app.json. Las listas usan { value, label } para que la base de datos no dependa del idioma. Pendiente: guardar la fecha como texto AAAA-MM-DD al enviar a Firestore y definir dónde viven las opciones de género y color.
- Archivos y commit: src/components/forms/SelectField.js — 378108a; src/components/forms/DateField.js, src/utils/formatDate.js, app.json, package.json — 12bb016
- Verificación: formatDate probada con Node (14/03/1995, 05/02/2000, 31/12/2008, 29/02/2008, hora 23:59, null y fecha inválida). SelectField y DateField probados en iPhone (elegir, cancelar, error, teclado, fecha futura bloqueada, validateBirthDate). (Completar detalle de lo observado.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #13
- Fecha: 2026-11-01
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Construir PhotoField (foto de perfil y foto del vehículo, desde cámara o galería) con expo-image-picker.
- Prompt: "me ayudas a realizar ese, que debe contener?" / "nonono, hablo del photofield" / "que ta esta asi" (versión con cierre de la hoja antes de abrir la cámara)
- Resumen de la respuesta: Claude revisó la API instalada de expo-image-picker 58.0.10 en node_modules y encontró que la opción aspect solo funciona en Android: en iPhone el recorte es siempre cuadrado, lo que puede cortar la placa en la foto del vehículo. Validó el uso de requestCameraPermissionsAsync, launchCameraAsync, launchImageLibraryAsync y mediaTypes: ['images']. Aprobó la solución con onDismiss para abrir la cámara solo cuando la hoja terminó de cerrarse en iPhone.
- Qué se usó / modificó / descartó: El integrante escribió el componente y añadió closeThen con onDismiss, los errores bajo el campo y quality 0.7. Pendiente: activar allowsEditing solo para la foto de perfil y no para la del vehículo; un botón a Ajustes cuando se niega el permiso; la subida a Cloudinary (la foto hoy es solo una ruta local).
- Archivos y commit: src/components/forms/PhotoField.js — ecb041c
- Verificación: Pendiente de completar: pruebas en iPhone de tomar foto, elegir de galería, cambiar, quitar, permiso negado, cancelar y foto del vehículo con la placa visible.
- Aprendizaje: (completar por el integrante)

---

### Entrada #14
- Fecha: 2026-10-30 a 2026-11-01
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Aclarar el flujo de trabajo con Git (ramas, Pull Requests, merge), las buenas prácticas de comentarios y el avance del proyecto.
- Prompt: "pero por que me haces crear una rama fundamentos, no es mejor subir todo en main? al fin y al cabo estoy trbajando solo" / "vale, pero se hicieron dos commits, ademas la profesora tendria que navegar por ramas para ver los commits" / "vale, ya te entendi, ahora dime como borrar un commit, se subieros dos iguales" / "el merge se puede hacer al final del proyecto?" / "vale, entonces como hago el pr el marge" / "y si la bitacora la comittamos al final?" / "una pregunta, algunas cosas en el codigo las estoy comentando, en el taller de pokemon se pidio hacerlo, no se si es una mala practica o no, simplemnte lo hago para seguir los trbajos anteriores, esta bien o no? sabes si se pidio en el pdf?" / "como ves que voy hasta el momento?"
- Resumen de la respuesta: Claude explicó que la rúbrica pide ramas, Pull Requests revisados y merge en main, y recomendó una rama por fase con PR al terminar. Mostró las opciones de merge (merge commit, squash, rebase), cómo juntar commits antes de subir y por qué no dejar el merge ni la bitácora para el final. Aclaró que el PDF solo exige el comentario en inglés "AI-assisted" y que los demás comentarios son opcionales, útiles si explican el porqué. Evaluó el avance: base sólida (Firebase, sesión, navegación, validadores, componentes) y, como riesgos, trabajo sin integrar y bitácora atrasada.
- Qué se usó / modificó / descartó: Se adoptó una rama por fase con PR y merge commit. Los dos commits de la fase 1 se juntaron en uno antes del merge. Se descartó borrar commits con reescritura forzada del historial. Se mantiene el estilo de comentarios "CONCEPTO" por ahora y se consultará a la profesora si es obligatorio.
- Archivos y commit: ff378bd (fase 1), PR #1, #2 y #3; sin cambios de código propios de esta entrada
- Verificación: Revisión del historial con git log y del estado de origin/main tras cada merge.
- Aprendizaje: (completar por el integrante)

---

### Entrada #15
- Fecha: 2026-11-01
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Crear el estado compartido del registro (RegistrationContext con useReducer) y el formulario completo de la pestaña Datos personales.
- Prompt: "ya hice la registrationcontext, esto fue lo que hice" (se pegó una descripción del contexto, el formulario de 8 campos, el correo de solo lectura, las reglas de errores y validatePersonalData) / "perfecto, tendre en cuenta las cosas por mejorar" / "dejare asi por hoy"
- Resumen de la respuesta: Claude revisó RegistrationContext, PersonalDataScreen, SegmentedField, las constantes y validatePersonalData, y probó la validación conjunta con datos reales (completo, vacío, menor de edad, documento corto, sin foto). Señaló como puntos por mejorar: el estado touched vive solo en la pantalla y el conductor no sabrá qué falta cuando el botón de envío esté deshabilitado; el teclado puede quedar desalineado con la cabecera; el verde de éxito tiene poco contraste como texto.
- Qué se usó / modificó / descartó: El integrante escribió el contexto, el formulario y SegmentedField. Decisiones propias: el error de un campo de texto aparece al salir del campo (onBlur) y no al escribir el primer carácter; documento y celular solo aceptan dígitos; el correo viene de la cuenta y no es editable; los datos solo viven en memoria y no en AsyncStorage. Pendiente: decidir cómo mostrar todos los errores desde el botón de envío, probar el teclado y limitar la longitud de documento y celular.
- Archivos y commit: src/context/RegistrationContext.js, src/screens/Register/PersonalDataScreen.js, src/components/forms/SegmentedField.js, src/constants/registration.js, src/utils/validators.js — e4146be
- Verificación: validatePersonalData probada con Node (5 casos). Probado en iPhone según el integrante (completar: escribir y cambiar de pestaña, errores al salir del campo, solo dígitos, edad, texto de pestaña completa).
- Aprendizaje: (completar por el integrante)

---

### Entrada #16
- Fecha: 2026-11-02
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Construir la pestaña Vehículo (categoría, placa, marca, modelo, año, color, capacidad y foto) y cerrar la fase 3.
- Prompt: "buenos dias, hoy seguiremos con la pestana de vehiculo para que cerremos la fase 3" / "la fase 4 la necesito para la primer entrega?" / "revisa lo que hice, ya hare el psuh entonces si hay que hacerles cambios a la bitacora hazlos"
- Resumen de la respuesta: Claude propuso el orden: constantes (categorías y colores), validateVehicleData, sección vehicle en el contexto y la pantalla. Aclaró que el PDF no indica qué se entrega en cada fecha y recomendó preguntarlo a la profesora, explicando qué incluye la fase 4 (pestaña 3, subida a Cloudinary y envío del registro). Revisó el código y probó validateVehicleData (completo, vacío, XL con 4 pasajeros, Económico con 4, placa de moto, año futuro, marca de 31 letras).
- Qué se usó / modificó / descartó: El integrante escribió CategoryField, las constantes, validateVehicleData, la sección vehicle del contexto y VehicleScreen. Decisiones propias: las categorías usan tarjetas y no una lista; se quitó el tope de 4 pasajeros del diseño porque el PDF no lo define; la placa se guarda en mayúsculas y sin espacios; al cambiar de categoría se reevalúa la capacidad; la lista de colores es propia porque el PDF no la define. Pendientes: no hay año mínimo (un año como 0001 pasa la validación); la foto del vehículo todavía permite recorte (en iPhone es cuadrado y puede cortar la placa); touched sigue duplicado en las dos pantallas.
- Archivos y commit: src/components/forms/CategoryField.js, src/constants/registration.js, src/context/RegistrationContext.js, src/screens/Register/VehicleScreen.js, src/utils/validators.js — (pendiente de commit)
- Verificación: validateVehicleData probada con Node (8 casos). (Completar: pruebas en iPhone de categoría, placa en mayúsculas, XL con 4 y 6 pasajeros, cambio de categoría con capacidad escrita, foto con la placa visible.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #17
- Fecha: 2026-11-05
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Enviar el registro (datos personales y vehículo) a Firebase: subir las fotos a Cloudinary, guardar drivers/{uid} con status pending y depurar el error al pulsar "Enviar registro".
- Prompt: "Estoy tratando de hacer como tal el envío del registro con las dos pantallas que tengo, datos personales y vehículo. Con esta información y estoy tratando de enviar pues como tal la información al Firebase, ¿cierto? Para que un momento en el que le envía registro me llegue a Firebase pues como toda la información y se pueda aprobar o desaprobar pues como tal la cuenta. Lo que hice fue service Claudinary con el index, LB of this driver record, el registration submit bar, registration contest, Firebase drivers, registration tabs, contact registration. Lo estoy pues como tal creando. Quiero pues que me guíes, que mires lo que llevo. Estoy intentando probar, pero me sale un error pues como tal de error, pues me sale un error cuando le doy en enviar, como ocurrió un error, prueba a ver la conexión de internet, pero la conexión de internet está bien. Entonces puedes mirar a ver qué me falta, en qué" / "ya mire el fetch de expo no acepta formato url, type, name" / "ya hice eso, ya hice la prueba y todo quedo super bien"
- Resumen de la respuesta: Claude leyó el flujo de envío (uploadImage, buildDriverRecord, saveDriverRegistration, SubmitBar y submit en RegistrationContext) y comprobó sin subir ni escribir datos que el cloud name y el upload preset de Cloudinary existen y son unsigned, y que Firestore permite la lectura. El fallo estaba en cómo se subía la foto: en Expo SDK 58 el fetch global es el de Expo y su conversión de FormData rechaza el formato { uri, type, name } con el error "Unsupported FormDataPart implementation". El catch de submit lo convertía en el mensaje genérico "revisa tu conexión", que no era la causa. El integrante encontró el problema en la documentación, y Claude lo confirmó en node_modules y sugirió usar un File de expo-file-system.
- Qué se usó / modificó / descartó: El integrante reescribió uploadImage para agregar al FormData un objeto File de expo-file-system en lugar de { uri, type, name }. Se descartó la alternativa con XMLHttpRequest. Pendiente: que el mensaje de error distinga el paso que falla (subida de fotos o guardado) y reserve "revisa tu conexión" para errores de red.
- Archivos y commit: src/services/cloudinary/index.js, src/utils/buildDriverRecord.js, src/services/firebase/drivers.js, src/components/registration/SubmitBar.js, src/context/RegistrationContext.js, src/navigation/RegistrationTabs.js, src/constants/registration.js, src/utils/formatDate.js — (pendiente de commit)
- Verificación: Según el integrante, el envío funcionó de punta a punta. (Completar: las dos fotos aparecen en Cloudinary, existe drivers/{uid} en Firestore con status pending y la app pasó sola a "En revisión"; cambiar el campo status a approved lleva a la pantalla de inicio.)
- Aprendizaje: (completar por el integrante: por qué el fetch de Expo no acepta { uri, type, name } y por qué un mensaje de error genérico puede esconder la causa real)

---

### Entrada #18
- Fecha: 2026-11-08
- Integrante: Samuel Gómez
- Herramienta: IA de diseño en Figma (indicar cuál) para los mockups; Claude Code (Claude Sonnet 5.5) para la revisión
- Objetivo: Diseñar en Figma las pantallas que faltaban (inicio, solicitud, viaje y cobro, ganancias, historial, perfil, menú lateral y pestaña de documentos) y revisar su cobertura frente al PDF.
- Prompt: Con Claude: "buenas, buenas, continuare con el desarrollo del proyecto, he estado un poco perdido haciendo los disenos de las pantallas faltantes, ya pude terminar, mira como van, ya esta casi toda la app disenada" (se adjuntó una captura del tablero de Figma). Con la IA de Figma: (pegar aquí el prompt literal, sin datos personales ni llaves)
- Resumen de la respuesta: Claude comparó el tablero con la sección 3 del PDF: Inicio (3 variantes), Solicitud, Viaje y cobro (Aprobado, Pendiente, Rechazado, Efectivo), Ganancias, Historial con filtros, vacío y detalle, Perfil, Registro, Login, En revisión y menú lateral. Recomendó congelar el diseño y construir, y propuso un orden de desarrollo: registro, Inicio con mapa, solicitudes, viaje, cobro en efectivo, Mercado Pago, ganancias e historial y extras.
- Qué se usó / modificó / descartó: Se usa el tablero como referencia de implementación. Se decidió simular las solicitudes de pasajero con un script, porque este proyecto es solo la app del conductor. (Completar qué se conservó y qué se descartó de lo generado por la IA de Figma.)
- Archivos y commit: Figma: archivo "UberClone Conductor" (agregar enlace); sin cambios de código
- Verificación: Comparación de cada pantalla del tablero con la lista de pantallas y campos del PDF.
- Aprendizaje: (completar por el integrante)

---

### Entrada #19
- Fecha: 2026-11-08
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Revisar la pestaña Documentos y pagos del registro (licencia, SOAT, revisión técnico-mecánica, correo de Mercado Pago y términos).
- Prompt: "estuve haciendo los documentos, me guie basicamente por la estructura que tenia de datos personales y vehiculo, ya hice la prueba y quedo bien, hare el commit pero antes te mostrare la estructura" (se pegó el código de DocumentsScreen)
- Resumen de la respuesta: Claude revisó DocumentsScreen, documentValidators, CheckboxField, los cambios de DateField (kind expiry), el contexto y buildDriverRecord. Probó los validadores y encontró dos problemas: validateExpiryDate acepta la fecha de hoy con una hora posterior a las 00:00 (el PDF pide "posterior a hoy"), y validateYear se cambió a "no mayor al año siguiente", mientras el PDF dice "no mayor al año actual". Señaló como decisión propia el umbral de 6 años para la revisión técnico-mecánica y que las fotos de documentos quedan con enlace público en Cloudinary.
- Qué se usó / modificó / descartó: El integrante escribió toda la pestaña. Decisiones propias: la revisión técnico-mecánica solo se exige si el vehículo tiene 6 años o más; el número de licencia admite de 5 a 20 letras o números; la comisión se muestra desde PRICING. Pendientes que siguen abiertos al 2026-11-08: corregir validateExpiryDate comparando solo fechas, y decidir si se vuelve a la regla del año actual o se documenta la del año siguiente.
- Archivos y commit: src/screens/Register/DocumentsScreen.js, src/utils/documentValidators.js, src/components/forms/CheckboxField.js, src/components/forms/DateField.js — 4f27041 y c01b1ca (PR #5)
- Verificación: Validadores probados con Node con fecha fija; envío de punta a punta probado en el iPhone según el integrante. (Completar el detalle de lo observado.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #20
- Fecha: 2026-11-08
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5) para la guía y la revisión; ChatGPT para redactar un resumen técnico del trabajo
- Objetivo: Construir el menú lateral (Drawer) y la pantalla de Inicio con mapa, ubicación en tiempo real e interruptor Disponible.
- Prompt: Con Claude: "voy a empezar a crear el menu lateral, primeramente con el nombre y estado de cuenta, ayudame con eso" / "con que erramienta se genero que? claro, hay que seguir en modo tutor mi hermano" / "los escribi yo como asi jajsajsjasjas" / "osea, lo escribi yo pero no sabia como explicar que fue lo que hice y para que sonara mas tecnico le dije a chat gpt que me pusiera todo el texto de lo que hice personalmente, ya te entendi". Con ChatGPT: (pegar aquí el prompt literal con el que se redactó el resumen)
- Resumen de la respuesta: Claude revisó DrawerNavigator, App.js, index.js, los hooks useDriverLocation y useAvailability, locations.js y HomeScreen. Verificó en node_modules que timeInterval solo funciona en Android y probó toCoords y shouldEmit (rumbo -1, null y 0; intervalos de 4,9, 5 y 6 segundos). Señaló riesgos: las reglas de Firestore en modo de prueba caducan a los 30 días, un conductor que cierra la app disponible deja isAvailable en true y una ubicación vieja, y los errores de escritura de ubicación se ignoran en silencio. Aclaró que el resumen redactado con ChatGPT también es uso de IA y debe declararse.
- Qué se usó / modificó / descartó: El integrante escribió el código. Decisiones propias: la ubicación vive en driverLocations/{uid} y no en drivers/{uid}; el deslizamiento del menú está desactivado; el último estado de disponibilidad se guarda en AsyncStorage y se refleja en Firestore; el límite de escritura cada 5 segundos se controla con shouldEmit porque timeInterval no aplica en iPhone. El resumen de ChatGPT se usó para explicar el trabajo; se corrigió el malentendido de que describía trabajo de otra herramienta.
- Archivos y commit: src/navigation/DrawerNavigator.js, src/hooks/useDriverLocation.js, src/hooks/useAvailability.js, src/services/firebase/locations.js, src/utils/location.js, src/screens/Home/HomeScreen.js, App.js, index.js — d2e3094
- Verificación: toCoords y shouldEmit probadas con Node (8 casos revisados por Claude). (Completar: pruebas en iPhone del permiso, del interruptor, de la escritura cada ~5 s en driverLocations/{uid}, de pasar a No disponible y de salir de la pantalla.)
- Aprendizaje: (completar por el integrante: qué hace la función de limpieza de watchPositionAsync y por qué la ubicación va en otro documento)

---

### Entrada #21
- Fecha: 2026-11-08
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Revisar el simulador de pasajero (script de Node en tools/) que crea solicitudes de viaje en Firestore para probar la app del conductor.
- Prompt: "Tak, estoy pensando en hacer un script en tools para simular el envío pues de una petición de un viaje, porque realmente no tengo muy claro si tengo que hacer como tal otra aplicación que simule pues como tal un pasajero o pues tengo pensado hacer como un HTML, como una simulación que llegue al Fairbase y al Fairstore en donde pues se simule pues como tal una petición. Entonces estoy creando como tal un script que me mande una petición como para ir probando. Ya después de esto, no sé, depende de lo que me conteste la profesora, pues miro si implemento en la misma aplicación móvil o desarrollo pues como tal otra pantalla como de prueba para hacer la simulación. Entonces en estos momentos hice los tools, ¿cierto? Entonces necesito saber si están bien creados, si están bien estructurados. Ya hice las pruebas y realmente llegan al Firestore. La verdad sí llegan, pero entonces ¿qué me" (el mensaje quedó cortado)
- Resumen de la respuesta: Claude confirmó que el PDF no pide una app de pasajero y que un script es suficiente. Revisó send-request.mjs y estimate.mjs y ejecutó el script en modo --dry-run (solo lecturas): un viaje XL de 4,7 km y 11 min dio tarifa 16.600, comisión 3.320 y ganancia neta 13.280, coherente con la fórmula del PDF. Advirtió que el script depende de reglas de Firestore abiertas (cuando se endurezcan hará falta iniciar sesión o usar el Admin SDK), que el .gitignore no cubre JSON de cuentas de servicio y que las solicitudes de prueba se acumulan.
- Qué se usó / modificó / descartó: El integrante escribió el script. Decisiones propias: distancia y duración se estiman en línea recta por un factor de calles y una velocidad promedio, no con una ruta real; la recogida se crea a unos 800 m del conductor; la tarifa no se guarda en el viaje. Pendientes: un script para limpiar solicitudes de prueba y proteger credenciales en el .gitignore antes de descargar una cuenta de servicio.
- Archivos y commit: tools/passenger/send-request.mjs, tools/passenger/estimate.mjs, package.json (script npm run request), README.md — 087b2ac
- Verificación: Prueba en seco ejecutada por Claude; según el integrante, las solicitudes llegan a Firestore. (Completar: qué documento apareció en trips y cómo se comportó la app.)
- Aprendizaje: (completar por el integrante)

---

### Entrada #22
- Fecha: 2026-11-08
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Recibir solicitudes entrantes en tiempo real, con tarjeta, temporizador de 15 segundos, aceptar y rechazar.
- Prompt: "dejare asi por hoy, revisa los cambios que hice y haz las entrdas a la bitacora" (antes, Claude había propuesto el orden de trabajo: viajes de prueba, hook useTripRequests, tarifa estimada, temporizador y botones)
- Resumen de la respuesta: Claude revisó useTripRequests, useCountdown, trips.js, tripRequests.js, formatMoney, paymentMethods, IncomingRequestCard y los cambios de HomeScreen, y probó selectPendingRequests y formatMoney (orden por antigüedad, descarte de solicitudes de más de 2 minutos, createdAt nulo, límite de 2 minutos, 15.360 → $15.360). Observó que aceptar y rechazar usan una transacción de Firestore, que la cuenta regresiva se calcula contra una hora límite y no restando 1 por tick, y que useTripRequests devuelve error y queued que HomeScreen todavía no usa.
- Qué se usó / modificó / descartó: El integrante escribió el código. Decisiones propias: las solicitudes con más de 2 minutos se ignoran; se atiende la más antigua y las demás esperan; al vencer el tiempo la solicitud pasa a rejected; la tarifa se calcula en la app con calculateFare y no se guarda en el viaje. Punto por revisar: si Aceptar falla justo cuando el tiempo ya llegó a cero, el temporizador no vuelve a disparar el rechazo automático.
- Archivos y commit: src/hooks/useTripRequests.js, src/hooks/useCountdown.js, src/services/firebase/trips.js, src/utils/tripRequests.js, src/utils/formatMoney.js, src/constants/paymentMethods.js, src/components/trip/IncomingRequestCard.js, src/screens/Home/HomeScreen.js — cc6a507
- Verificación: selectPendingRequests y formatMoney probadas con Node. (Completar: pruebas en iPhone con el simulador: llega la tarjeta, el temporizador baja de 15 a 0, Aceptar cambia el viaje a accepted con driverId, Rechazar y vencer el tiempo cambian a rejected, dos solicitudes seguidas y modo No disponible.)
- Aprendizaje: (completar por el integrante: por qué se usa una transacción y por qué la cuenta regresiva usa una hora límite)

---

### Entrada #23
- Fecha: 2026-11-09
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Revisar el viaje en curso hacia la recogida: TripContext, TripScreen, PickupCard, ruta con OSRM y los cambios de navegación.
- Prompt: "Todo el día estuve ocupado haciendo unos archivos hice el trip contest, el use root initials, trip screen, pickup car, app.js, route navigator, driver navigator, home screen, trips. Realicé esto pues como intentando también poner el OSRM para simular pues también como tal en estos momentos como la ruta. Cuando se pide como tal un servicio, poder ir como simulando la trayectoria del punto A al punto B para ir a recoger al cliente. Verifícame pues como tal esos archivos. Realmente ya hice las pruebas, todo pasó bien, ya hice el commit pues como tal de estos archivos, pero igualmente revísame pues si hay de pronto cosas por mejorar para tenerlo en" (el mensaje quedó cortado) / "tienes razon, no trbaje app.js perdon" / "lo que paso es que no entro en el commit"
- Resumen de la respuesta: Claude leyó osrm.js, useRoute, TripContext, trips.js, TripScreen, PickupCard y los cambios de RootNavigator y App.js. Probó parseOsrmRoute con respuestas de ejemplo (distancia y duración, mínimo de 1 minuto, rutas vacías, NoRoute y null) y hizo una consulta real a OSRM (Parque Lleras a Estadio: 200 en ~1 s, 8.919 m). Encontró que el commit fdc21be no arrancaba solo: RootNavigator ya usaba useActiveTrip pero App.js, con el TripProvider, había quedado sin commit; la causa fue agregar archivos por carpeta (git add src docs), que no incluye los archivos de la raíz. Propuso mejoras: marcar al conductor como no disponible durante el viaje, un tiempo límite para la consulta a OSRM, un botón de pasajero a bordo, un modo de simulación del trayecto solo para desarrollo y confirmar con la profesora si OSRM sustituye a Google Directions.
- Qué se usó / modificó / descartó: El integrante escribió el código. Decisiones propias: OSRM como servicio de rutas en lugar de Google Directions (el PDF lo menciona como alternativa opcional); una sola consulta de ruta por tramo; línea recta de respaldo si OSRM falla; el viaje activo vive en Firestore para sobrevivir al cierre de la app. Aplicó la corrección de App.js y reescribió el commit (ahora 59aadeb) y puso al conductor como no disponible al aceptar y bloqueó aceptar un segundo viaje. Pendientes: tiempo límite en OSRM, simulación del trayecto y confirmar con la profesora el uso de OSRM.
- Archivos y commit: src/context/TripContext.js, src/hooks/useRoute.js, src/services/maps/osrm.js, src/screens/Trip/TripScreen.js, src/components/trip/PickupCard.js, src/utils/initials.js, src/navigation/RootNavigator.js, src/navigation/DrawerNavigator.js, App.js — 59aadeb
- Verificación: parseOsrmRoute y la consulta real a OSRM probadas por Claude. Según el integrante, el flujo se probó en el iPhone con el simulador de pasajero. (Completar el detalle de lo observado.)
- Aprendizaje: (completar por el integrante: por qué git add src no incluye App.js y cómo comprobar qué quedó en el commit)

---

### Entrada #24
- Fecha: 2026-11-09
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Cerrar la fase 5: pasajero a bordo, ruta hacia el destino y finalización del viaje.
- Prompt: "estoy trabajando para darle cierre a la fase 5, teneindo en cuenta el pasajero estando abordo, la ruta del destino y la finalizacion del viaje" / "vale, perfecto, hare esos cambias, lo que me pides como tal es tener la informacion exacta del cobro de la carrera, no que viva en la base de datos sino que el conductor se entere" / "vale, esto va en la fase 6"
- Resumen de la respuesta: Claude revisó los cambios sin commit de trips.js, TripScreen, PickupCard, DestinationCard y HomeScreen: pickUpPassenger pasa a in_progress, el mapa cambia al tramo hacia el destino con una consulta de ruta por tramo, y completeTrip guarda fare, commission, driverEarnings, commissionRate y completedAt solo desde in_progress. Señaló un hueco de diseño: ACTIVE_STATUSES no incluye completed, así que al finalizar el conductor vuelve al mapa sin ver el resumen de cobro ni poder marcar el efectivo como recibido, y el viaje en completed nunca llega a paid. Recomendó una pantalla mínima de resumen con tarifa, comisión, ganancia neta, propina y estado del pago, y un botón de cobro recibido para efectivo, dejando Mercado Pago real para la fase 6.
- Qué se usó / modificó / descartó: El integrante escribió el código. Decisiones propias: la tarifa final se calcula con la distancia y la duración de la solicitud aceptada (lo que el conductor vio es lo que cobra); finalizar no exige estar cerca del destino. Decisión del integrante: la pantalla de resumen y el cobro pasan a la fase 6, a pesar de la recomendación de incluir una versión mínima en la fase 5. Pendiente: sin esa pantalla, un viaje finalizado queda en completed y el conductor no lo ve.
- Archivos y commit: src/services/firebase/trips.js, src/screens/Trip/TripScreen.js, src/components/trip/PickupCard.js, src/components/trip/DestinationCard.js, src/screens/Home/HomeScreen.js — (pendiente de commit)
- Verificación: Revisión del código por Claude. (Completar: prueba en el iPhone con el simulador: aceptar, pasajero a bordo, ruta al destino y finalizar; qué quedó guardado en trips.)
- Aprendizaje: (completar por el integrante: por qué se usa una transacción para cambiar el estado y qué guarda completeTrip)

---

### Entrada #25
- Fecha: 2026-11-09
- Integrante: Samuel Gómez
- Herramienta: Claude Code (Claude Sonnet 5.5)
- Objetivo: Corregir una observación de la profesora: los campos del registro dejaban escribir más caracteres de los permitidos (por ejemplo, la cédula aceptaba más de 10 dígitos aunque el validador marcaba el error).
- Prompt: "Me acordé de algo importante, ayúdame a realizar eso. La profesora me dijo cuando estaba pues como probando la aplicación de que yo podía seguir escribiendo más dígitos en el registro pues de datos personales y de vehículos. Por ejemplo, la cédula solo permite 10 números, pero cuando escribía más de 10 podía seguir escribiendo. Obviamente el validador estaba malo y salía un error, pero en el teclado uno podía seguir escribiendo más de 10 dígitos. Ayúdame a corregir esto, dime en qué parte del código me meto para corregirlo, para cambiar eso, por" (el mensaje quedó cortado) / "listo, ya lo hice" / "listo, los commits los hago despues" / "pero ya hice esos cambios mi hermano" / "listo, borrado y comprobadooooo"
- Resumen de la respuesta: Claude revisó todos los campos de texto de las tres pestañas del registro y listó cuáles tenían maxLength y cuáles no. FormField ya pasa sus propiedades al TextInput, por lo que bastaba agregar maxLength en cada campo. Faltaban nombre (50), documento (10), celular (10), marca (30) y modelo (30). En revisiones sucesivas verificó el estado real del archivo y encontró un error de Claude (una comprobación automática marcó OK el documento por un falso positivo) y errores del código (marca y modelo con 50 en lugar de 30, y un maxLength de más dentro del selector de idioma).
- Qué se usó / modificó / descartó: El integrante agregó maxLength en los cinco campos y borró el que sobraba en el selector de idioma. Se mantuvo el validador como segunda defensa (maxLength impide escribir de más, pero no garantiza el mínimo). Pendientes: usar constantes compartidas entre validadores y pantallas, y probar el caso de pegar texto con espacios en el celular.
- Archivos y commit: src/screens/Register/PersonalDataScreen.js, src/screens/Register/VehicleScreen.js — (pendiente de commit)
- Verificación: Revisión del código por Claude en tres pasadas. Según el integrante, se comprobó en el iPhone escribiendo de más en cada campo. (Completar el detalle de lo observado.)
- Aprendizaje: (completar por el integrante: por qué maxLength y el validador se complementan y no se reemplazan)
