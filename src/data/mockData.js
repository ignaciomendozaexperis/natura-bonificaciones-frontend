// Datos 100% ficticios para el prototipo OmniRetail.
// Ninguna referencia a marcas, sistemas o estructuras reales.

const STORES = ['Tienda Centro', 'Tienda Norte', 'Tienda Sur', 'Tienda Mall Plaza']

function calcBono(ventas, asistenciaPct) {
  const base = ventas * 0.04
  const factorAsistencia = asistenciaPct >= 95 ? 1 : asistenciaPct >= 90 ? 0.85 : 0.6
  return Math.round(base * factorAsistencia)
}

function estadoPorAsistenciaVentas(asistenciaPct, ventas) {
  if (asistenciaPct < 85) return 'Revisión'
  if (ventas < 3000) return 'Pendiente'
  return 'Aprobado'
}

const rawEmployees = [
  { id: 'COL-1001', nombre: 'Martina Rojas', tienda: STORES[0], ventas: 8450, diasAsistidos: 22, metaDias: 22 },
  { id: 'COL-1002', nombre: 'Tomás Fuentes', tienda: STORES[1], ventas: 6120, diasAsistidos: 20, metaDias: 22 },
  { id: 'COL-1003', nombre: 'Valentina Soto', tienda: STORES[0], ventas: 2980, diasAsistidos: 18, metaDias: 22 },
  { id: 'COL-1004', nombre: 'Benjamín Castro', tienda: STORES[2], ventas: 9870, diasAsistidos: 21, metaDias: 22 },
  { id: 'COL-1005', nombre: 'Antonia Reyes', tienda: STORES[3], ventas: 4310, diasAsistidos: 19, metaDias: 22 },
  { id: 'COL-1006', nombre: 'Joaquín Herrera', tienda: STORES[1], ventas: 1560, diasAsistidos: 17, metaDias: 22 },
  { id: 'COL-1007', nombre: 'Isidora Peña', tienda: STORES[2], ventas: 7230, diasAsistidos: 22, metaDias: 22 },
  { id: 'COL-1008', nombre: 'Matías Vergara', tienda: STORES[3], ventas: 5540, diasAsistidos: 20, metaDias: 22 },
]

export const mockEmployees = rawEmployees.map((e) => {
  const asistenciaPct = Math.round((e.diasAsistidos / e.metaDias) * 100)
  const bono = calcBono(e.ventas, asistenciaPct)
  const estado = estadoPorAsistenciaVentas(asistenciaPct, e.ventas)
  return {
    ...e,
    asistenciaPct,
    bono,
    estado,
    metaVentas: 7000,
    geoCheck: {
      entradas: e.diasAsistidos,
      salidas: e.diasAsistidos,
      ubicacionValidada: asistenciaPct >= 90,
    },
  }
})

export const mockPromotions = [
  {
    id: 'PROMO-001',
    nombre: 'CyberWeek Verano',
    tipo: 'Descuento porcentual',
    descuento: 25,
    fechaInicio: '2026-01-12',
    fechaFin: '2026-01-19',
    tiendasAplicables: ['Tienda Centro', 'Tienda Norte', 'Tienda Sur', 'Tienda Mall Plaza'],
    estado: 'Activa',
  },
  {
    id: 'PROMO-002',
    nombre: 'Descuento Línea Cuidado',
    tipo: 'Descuento fijo',
    descuento: 15,
    fechaInicio: '2026-02-01',
    fechaFin: '2026-01-25',
    tiendasAplicables: ['Tienda Centro'],
    estado: 'Borrador',
  },
  {
    id: 'PROMO-003',
    nombre: 'Cupón BIENVENIDA',
    tipo: 'Descuento porcentual',
    descuento: 120,
    fechaInicio: '2026-03-01',
    fechaFin: '2026-03-31',
    tiendasAplicables: ['Tienda Norte', 'Tienda Mall Plaza'],
    estado: 'Activa',
  },
]

export const mockIntegrations = [
  { id: 'sys-ventas', nombre: 'Sistema de Ventas (POS-API)', estado: 'ok', ultimaSync: 'hace 4 min' },
  { id: 'sys-asistencia', nombre: 'Sistema de Asistencia (TimeCheck-API)', estado: 'ok', ultimaSync: 'hace 12 min' },
  { id: 'sys-nomina', nombre: 'Sistema de Nómina (PayRoll-API)', estado: 'error', ultimaSync: 'hace 3 horas' },
]

export const STORES_LIST = STORES
