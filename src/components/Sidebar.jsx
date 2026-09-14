import { LayoutDashboard, Tag, Activity, ShieldCheck, UserRound, Store } from 'lucide-react'

const ADMIN_VIEWS = [
  { id: 'dashboard', label: 'Bonificaciones', icon: LayoutDashboard },
  { id: 'promotions', label: 'Promociones', icon: Tag },
  { id: 'integrations', label: 'Integraciones', icon: Activity },
]

const SELLER_VIEWS = [{ id: 'dashboard', label: 'Mi Bonificación', icon: LayoutDashboard }]

export default function Sidebar({ role, setRole, view, setView }) {
  const views = role === 'admin' ? ADMIN_VIEWS : SELLER_VIEWS

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
        <div className="rounded-lg bg-indigo-600 p-2 text-white">
          <Store size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-slate-900">OmniRetail</p>
          <p className="text-xs text-slate-400">Bonificaciones</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          <ShieldCheck size={14} /> Rol simulado
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => { setRole('admin'); setView('dashboard') }}
            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              role === 'admin'
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={16} />
            Jefe de Tienda / Admin
          </button>
          <button
            onClick={() => { setRole('seller'); setView('dashboard') }}
            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              role === 'seller'
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserRound size={16} />
            Vendedor / Colaborador
          </button>
        </div>
      </div>
    </aside>
  )
}
