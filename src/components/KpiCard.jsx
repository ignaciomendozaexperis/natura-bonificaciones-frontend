export default function KpiCard({ icon: Icon, label, value, accent = 'text-indigo-600', sub }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-lg bg-slate-50 p-2 ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
