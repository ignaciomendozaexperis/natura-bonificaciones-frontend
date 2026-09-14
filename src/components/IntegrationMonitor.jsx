import { useState } from 'react'
import { RefreshCw, CircleCheck, CircleX } from 'lucide-react'
import { mockIntegrations } from '../data/mockData.js'

export default function IntegrationMonitor() {
  const [systems, setSystems] = useState(mockIntegrations)
  const [syncing, setSyncing] = useState(false)

  function handleResync() {
    setSyncing(true)
    setTimeout(() => {
      setSystems((prev) => prev.map((s) => ({ ...s, estado: 'ok', ultimaSync: 'justo ahora' })))
      setSyncing(false)
    }, 1200)
  }

  const okCount = systems.filter((s) => s.estado === 'ok').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Monitor de Estado de Integración</h1>
          <p className="text-sm text-slate-500">Sincronización de sistemas ficticios que alimentan la plataforma.</p>
        </div>
        <button
          onClick={handleResync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Re-sincronizar todo'}
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{okCount}</span> de{' '}
          <span className="font-semibold text-slate-900">{systems.length}</span> sistemas sincronizados correctamente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {systems.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span
                className={`h-3 w-3 rounded-full ${s.estado === 'ok' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
              />
              {s.estado === 'ok' ? (
                <CircleCheck size={18} className="text-emerald-600" />
              ) : (
                <CircleX size={18} className="text-rose-500" />
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{s.nombre}</p>
            <p className="mt-1 text-xs text-slate-400">Última sincronización: {s.ultimaSync}</p>
            <p className={`mt-2 text-xs font-medium ${s.estado === 'ok' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {s.estado === 'ok' ? 'Operativo' : 'Error de conexión'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
