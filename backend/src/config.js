import path from 'node:path';

// CONCEPTO: toda la configuración sale del archivo .env (nunca del código) y se valida al arrancar: si falta
// algo, el servidor se detiene con un mensaje claro en vez de fallar más tarde con un error confuso.
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name} en backend/.env (mira backend/.env.example).`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  // Dirección con la que el celular llega a este servidor (la IP del computador en la red Wi-Fi).
  publicUrl: required('PUBLIC_URL').replace(/\/$/, ''),
  // Token de Mercado Pago (de prueba). Solo vive aquí: la app nunca lo ve.
  mercadoPagoToken: required('MERCADOPAGO_ACCESS_TOKEN'),
  // Clave de servicio de Firebase Admin, relativa a la carpeta backend/.
  serviceAccountPath: path.resolve(process.cwd(), required('FIREBASE_SERVICE_ACCOUNT_PATH')),
};
