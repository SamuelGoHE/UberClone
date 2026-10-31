// CONCEPTO: los valores visuales viven en un solo lugar para que todas las pantallas se vean
// consistentes. Los nombres y valores son los de las variables del diseño en Figma
// (archivo "UberClone Conductor"): si algo cambia allá, se cambia acá.
export const colors = {
  primary: '#101010',
  onPrimary: '#FFFFFF',
  background: '#F6F6F6',
  surface: '#FFFFFF',
  text: '#101010',
  textMuted: '#6B6B6B',
  border: '#E2E2E2',
  // Estados: Disponible / pago Aprobado, pago Pendiente, pago Rechazado y pago en Efectivo.
  success: '#06C167',
  warning: '#F5A623',
  danger: '#D93025',
  cash: '#276EF1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

// Sin fontFamily: la app usa la fuente del sistema (San Francisco en iPhone).
// Figma usa Inter solo como equivalente visual.
export const typography = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
};
