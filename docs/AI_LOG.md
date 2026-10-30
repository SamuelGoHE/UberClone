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
- Archivos y commit: docs/AI_LOG.md — (pendiente de commit)
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
- Archivos y commit: src/config/pricing.js, src/utils/calculateFare.js — (pendiente de commit)
- Verificación: Ejecutada con node: 8,5 km y 22 min da economy 19200/3840/15360 y xl 26900/5380/21520; 0,5 km y 2 min aplica la tarifa mínima (6000).
- Aprendizaje: (completar por el integrante)
