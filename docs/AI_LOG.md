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
