// Pesos colombianos con punto de miles: 15360 -> "$15.360". Se arma a mano (y no con toLocaleString) para que
// se vea igual en cualquier celular, sin depender de los idiomas que tenga instalados.
export function formatMoney(amount) {
  const digits = String(Math.abs(Math.round(amount)));
  const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}$${withDots}`;
}
