import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import PromotionsManager from './components/PromotionsManager.jsx'
import IntegrationMonitor from './components/IntegrationMonitor.jsx'

export default function App() {
  const [role, setRole] = useState('admin')
  const [view, setView] = useState('dashboard')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar role={role} setRole={setRole} view={view} setView={setView} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {view === 'dashboard' && <Dashboard role={role} />}
        {view === 'promotions' && role === 'admin' && <PromotionsManager />}
        {view === 'integrations' && role === 'admin' && <IntegrationMonitor />}
      </main>
    </div>
  )
}
