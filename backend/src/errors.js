// Error con código HTTP: lo lanzan las rutas y el servidor lo convierte en una respuesta JSON { error }.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
