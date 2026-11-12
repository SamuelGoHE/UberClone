import express from 'express';
import { config } from './config.js';
import paymentsRouter from './routes/payments.js';
import { GatewayError } from './services/mercadopago.js';

const app = express();
app.use(express.json());

// Registro simple de cada petición, útil para ver en la terminal qué hace la app durante una prueba.
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(paymentsRouter);

// Cualquier error de las rutas termina aquí y sale como JSON { error }, nunca como una página de error.
// Los errores del cliente (4xx) se devuelven tal cual; los de la pasarela, como 502; el resto, como 500.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : error instanceof GatewayError ? 502 : 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor.' : error.message });
});

// 0.0.0.0 = escucha en todas las interfaces, no solo en localhost: así el celular puede llegar por la Wi-Fi.
app.listen(config.port, '0.0.0.0', () => {
  console.log(`Backend listo en ${config.publicUrl} (puerto ${config.port})`);
});
