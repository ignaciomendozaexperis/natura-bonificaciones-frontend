import { useMemo, useState } from 'react'
import { DollarSign, TrendingUp, CalendarCheck2, Search, Download, ChevronRight } from 'lucide-react'
import { mockEmployees, STORES_LIST } from '../data/mockData.js'
import KpiCard from './KpiCard.jsx'
import StatusBadge from './StatusBadge.jsx'
import EmployeeDrawer from './EmployeeDrawer.jsx'

export default function Dashboard({ role, currentUserId = 'COL-1001' }) {
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [exported, setExported] = useState(false)

  const baseData = role === 'seller' ? mockEmployees.filter((e) => e.id === currentUserId) : mockEmployees

  const filtered = useMemo(() => {
    return baseData.filter((e) => {
      const matchesSearch =
        e.nombre.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
      const matchesStore = storeFilter === 'Todas' || e.tienda === storeFilter
      const matchesStatus = statusFilter === 'Todos' || e.estado === statusFilter
      return matchesSearch && matchesStore && matchesStatus
    })
  }, [baseData, search, storeFilter, statusFilter])

  const totalBonos = baseData.reduce((sum, e) => sum + e.bono, 0)
  const cumplimientoPromedio = Math.round(
    baseData.reduce((sum, e) => sum + Math.min(100, (e.ventas / e.metaVentas) * 100), 0) / baseData.length,
  )
  const asistenciaGlobal = Math.round(baseData.reduce((sum, e) => sum + e.asistenciaPct, 0) / baseData.length)

  function handleExport() {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {role === 'seller' ? 'Mi Bonificación' : 'Dashboard de Bonificaciones'}
        </h1>
        <p className="text-sm text-slate-500">
          {role === 'seller'
            ? 'Resumen de tu desempeño y liquidación del período actual.'
            : 'Perfil 360° de ventas, asistencia y liquidaciones del equipo.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={DollarSign}
          label={role === 'seller' ? 'Mi Bonificación del Mes' : 'Total Bonificaciones del Mes'}
          value={`$${totalBonos.toLocaleString('es-CL')}`}
          accent="text-emerald-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="Cumplimiento de Ventas Promedio"
          value={`${cumplimientoPromedio}%`}
          accent="text-indigo-600"
        />
        <KpiCard
          icon={CalendarCheck2}
          label="Índice de Asistencia Global"
          value={`${asistenciaGlobal}%`}
          accent="text-amber-600"
        />
      </div>

      {role === 'admin' && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o ID..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option>Todas</option>
                {STORES_LIST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option>Todos</option>
                <option>Aprobado</option>
                <option>Pendiente</option>
                <option>Revisión</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              {exported ? 'Archivo generado ✓' : 'Exportar a Excel'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Tienda</th>
                  <th className="px-4 py-3 font-medium">Ventas Totales</th>
                  <th className="px-4 py-3 font-medium">Asistencia</th>
                  <th className="px-4 py-3 font-medium">Bonificación</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-500">{e.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{e.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{e.tienda}</td>
                    <td className="px-4 py-3 text-slate-600">${e.ventas.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.diasAsistidos} / {e.metaDias} ({e.asistenciaPct}%)
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">${e.bono.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                      No se encontraron colaboradores con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {role === 'seller' && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="divide-y divide-slate-100">
            {baseData.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{e.nombre}</p>
                  <p className="text-xs text-slate-500">{e.tienda} · {e.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={e.estado} />
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <EmployeeDrawer employee={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
