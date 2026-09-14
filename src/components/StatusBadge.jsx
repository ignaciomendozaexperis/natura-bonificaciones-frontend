const STYLES = {
  Aprobado: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Pendiente: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  Revisión: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  Activa: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Borrador: 'bg-slate-200 text-slate-700 ring-slate-500/20',
  Finalizada: 'bg-slate-200 text-slate-500 ring-slate-500/20',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-700 ring-slate-500/20'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>
      {status}
    </span>
  )
}
