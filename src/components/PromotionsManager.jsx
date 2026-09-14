import { useState } from 'react'
import { PlusCircle, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Code2, Trash2 } from 'lucide-react'
import { mockPromotions, STORES_LIST } from '../data/mockData.js'
import StatusBadge from './StatusBadge.jsx'

const EMPTY_FORM = {
  nombre: '',
  tipo: 'Descuento porcentual',
  descuento: '',
  fechaInicio: '',
  fechaFin: '',
  tiendasAplicables: [],
  estado: 'Borrador',
}

function validatePromotions(promotions) {
  return promotions.map((p) => {
    const errores = []

    if (p.fechaInicio && p.fechaFin && new Date(p.fechaInicio) > new Date(p.fechaFin)) {
      errores.push('Fecha de inicio posterior a la fecha de fin.')
    }
    if (p.tipo === 'Descuento porcentual' && (p.descuento <= 0 || p.descuento > 70)) {
      errores.push('Porcentaje de descuento fuera de límite permitido (1%-70%).')
    }
    if (p.tipo === 'Descuento fijo' && p.descuento <= 0) {
      errores.push('Monto de descuento fijo debe ser mayor a 0.')
    }
    if (!p.tiendasAplicables || p.tiendasAplicables.length === 0) {
      errores.push('No se han asignado tiendas aplicables.')
    }

    return { ...p, errores, valida: errores.length === 0 }
  })
}

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState(mockPromotions)
  const [form, setForm] = useState(EMPTY_FORM)
  const [validated, setValidated] = useState(null)
  const [jsonOpen, setJsonOpen] = useState(false)

  function toggleStore(store) {
    setForm((f) => ({
      ...f,
      tiendasAplicables: f.tiendasAplicables.includes(store)
        ? f.tiendasAplicables.filter((s) => s !== store)
        : [...f.tiendasAplicables, store],
    }))
  }

  function handleAddPromotion(e) {
    e.preventDefault()
    if (!form.nombre) return
    const newPromo = {
      ...form,
      id: `PROMO-${String(promotions.length + 1).padStart(3, '0')}`,
      descuento: Number(form.descuento) || 0,
    }
    setPromotions((prev) => [...prev, newPromo])
    setForm(EMPTY_FORM)
    setValidated(null)
  }

  function handleRemove(id) {
    setPromotions((prev) => prev.filter((p) => p.id !== id))
    setValidated(null)
  }

  function handleValidate() {
    setValidated(validatePromotions(promotions))
  }

  const displayList = validated || promotions.map((p) => ({ ...p, errores: [], valida: true }))
  const totalErrors = displayList.reduce((sum, p) => sum + p.errores.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Gestor y Validador de Promociones</h1>
        <p className="text-sm text-slate-500">Crea campañas comerciales y valida su lógica antes de publicarlas.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleAddPromotion}
          className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-1"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <PlusCircle size={16} className="text-indigo-600" /> Nueva promoción
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nombre de campaña</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Semana Fragancias"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tipo de descuento</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option>Descuento porcentual</option>
              <option>Descuento fijo</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {form.tipo === 'Descuento porcentual' ? 'Porcentaje (%)' : 'Monto fijo ($)'}
            </label>
            <input
              type="number"
              value={form.descuento}
              onChange={(e) => setForm({ ...form, descuento: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fecha inicio</label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fecha fin</label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tiendas aplicables</label>
            <div className="flex flex-wrap gap-2">
              {STORES_LIST.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleStore(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.tiendasAplicables.includes(s)
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Agregar promoción
          </button>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Campañas registradas</p>
              <p className="text-xs text-slate-400">{promotions.length} promociones en el sistema</p>
            </div>
            <button
              onClick={handleValidate}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ShieldAlert size={16} />
              Validar Lógica
            </button>
          </div>

          {validated && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                totalErrors === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {totalErrors === 0 ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
              {totalErrors === 0
                ? 'Todas las promociones pasaron la validación de reglas.'
                : `Se encontraron ${totalErrors} inconsistencia(s) en las promociones. Revisa el detalle abajo.`}
            </div>
          )}

          <div className="space-y-3">
            {displayList.map((p) => (
              <div key={p.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">{p.id}</p>
                    <p className="text-sm font-semibold text-slate-900">{p.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {p.tipo} · {p.tipo === 'Descuento porcentual' ? `${p.descuento}%` : `$${p.descuento}`} ·{' '}
                      {p.fechaInicio || '—'} a {p.fechaFin || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.estado} />
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-50 hover:text-rose-500"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {p.tiendasAplicables?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.tiendasAplicables.map((s) => (
                      <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {validated && p.errores.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                    {p.errores.map((err, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ShieldAlert size={12} className="mt-0.5 shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {displayList.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
                No hay promociones registradas.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <button
              onClick={() => setJsonOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-600" />
                Visor JSON (simulador de API)
              </span>
              {jsonOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {jsonOpen && (
              <pre className="overflow-x-auto border-t border-slate-200 bg-slate-900 px-4 py-4 text-xs text-emerald-300">
                {JSON.stringify(promotions, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
