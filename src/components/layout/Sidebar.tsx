import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  DollarSign,
  Clock,
  DoorOpen,
  Settings,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface NavItem {
  icon: ReactNode
  label: string
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Home', to: '/' },
  { icon: <CalendarDays size={20} />, label: 'Calendar', to: '/calendar' },
  { icon: <Sparkles size={20} />, label: 'Chores', to: '/chores' },
  { icon: <DollarSign size={20} />, label: 'Finances', to: '/finances' },
  { icon: <Clock size={20} />, label: 'Availability', to: '/availability' },
  { icon: <DoorOpen size={20} />, label: 'Reserve', to: '/reserve' },
  { icon: <Settings size={20} />, label: 'Settings', to: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] z-50 flex-col items-center py-6 glass border-r border-white/[0.04]">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            H
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                title={item.label}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <div className="absolute left-[-16px] w-[3px] h-5 rounded-r-full bg-indigo-500" />
                )}
                {item.icon}
                <div className="absolute left-14 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-white/10 z-[60]">
                  {item.label}
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.04]">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'text-indigo-400'
                    : 'text-slate-600 active:text-slate-300'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
