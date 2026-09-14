import { useState } from 'react'
import { X, MapPin, Target, CalendarCheck, Calculator, FileDown, CheckCircle2 } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

export default function EmployeeDrawer({ employee, onClose }) {
  const [confirming, setConfirming] = useState(false)

  if (!employee) return null

  const cumplimientoVentas = Math.min(100, Math.round((employee.ventas / employee.metaVentas) * 100))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium text-slate-400">{employee.id}</p>
            <h2 className="text-lg font-semibold text-slate-900">{employee.nombre}</h2>
            <p className="text-sm text-slate-500">{employee.tienda}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Estado de liquidación</span>
            <StatusBadge status={employee.estado} />
          </div>

          <section className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Target size={16} className="text-indigo-600" /> Metas de venta
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ventas totales</span>
              <span className="font-medium text-slate-900">${employee.ventas.toLocaleString('es-CL')}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-500">Meta asignada</span>
              <span className="font-medium text-slate-900">${employee.metaVentas.toLocaleString('es-CL')}</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${cumplimientoVentas}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">{cumplimientoVentas}% de cumplimiento</p>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarCheck size={16} className="text-indigo-600" /> Asistencia registrada
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Días asistidos</span>
              <span className="font-medium text-slate-900">{employee.diasAsistidos} / {employee.metaDias}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-500">Índice de asistencia</span>
              <span className="font-medium text-slate-900">{employee.asistenciaPct}%</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <MapPin size={14} className={employee.geoCheck.ubicacionValidada ? 'text-emerald-600' : 'text-rose-500'} />
              Geo-Check: {employee.geoCheck.entradas} entradas / {employee.geoCheck.salidas} salidas validadas
              {employee.geoCheck.ubicacionValidada ? ' · ubicación conforme' : ' · revisar ubicación'}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calculator size={16} className="text-indigo-600" /> Detalle del cálculo
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Base (4% de ventas)</span>
                <span className="text-slate-900">${Math.round(employee.ventas * 0.04).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Factor de asistencia</span>
                <span className="text-slate-900">
                  {employee.asistenciaPct >= 95 ? '100%' : employee.asistenciaPct >= 90 ? '85%' : '60%'}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <span className="text-slate-700">Bonificación final</span>
                <span className="text-indigo-700">${employee.bono.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            onClick={() => setConfirming(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <FileDown size={16} />
            Descargar Carta de Liquidación (PDF)
          </button>
        </div>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={40} />
            <h3 className="text-base font-semibold text-slate-900">Documento generado (simulado)</h3>
            <p className="mt-1 text-sm text-slate-500">
              La carta de liquidación de <strong>{employee.nombre}</strong> se generó correctamente. Este es un
              prototipo, por lo que no se realiza una descarga real de archivo.
            </p>
            <button
              onClick={() => setConfirming(false)}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
