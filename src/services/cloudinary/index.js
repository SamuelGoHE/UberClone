import { File } from 'expo-file-system';

// CONCEPTO: Cloudinary guarda las fotos. La app las sube con un "upload preset" sin firmar, así que no
// hace falta ninguna llave secreta en el celular (el API Secret nunca se usa). Solo se necesitan el
// nombre de la nube y el nombre del preset, que son públicos y vienen del .env.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Sube una foto del celular (uri) y devuelve su enlace público (https://res.cloudinary.com/...).
export async function uploadImage(uri) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Falta la configuración de Cloudinary en el .env');
  }

  // CONCEPTO: en Expo SDK 58 el fetch global es el de Expo, que NO acepta el formato clásico de React
  // Native ({ uri, type, name }). Un archivo local se manda como un objeto File de expo-file-system,
  // que entrega sus bytes. Es la forma que indica la documentación de Expo.
  const form = new FormData();
  form.append('file', new File(uri));
  form.append('upload_preset', UPLOAD_PRESET);

  // No se pone el encabezado Content-Type a mano: fetch lo arma con el separador (boundary) correcto.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? 'No se pudo subir la imagen.');
  return data.secure_url;
}
