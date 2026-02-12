import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Sparkles,
  DollarSign,
  Clock,
  DoorOpen,
  Settings,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { CalendarEvent, ChoreAssignment, Payment } from '../types'
import { getEventsForDates } from '../services/calendarService'
import { useHouse } from '../context/HouseContext'
import * as choresService from '../services/choresService'
import * as financeService from '../services/financeService'

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDateLabel(dateStr: string): string {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const toLocal = (d: Date) => d.toISOString().split('T')[0]
  if (dateStr === toLocal(today)) return 'Today'
  if (dateStr === toLocal(tomorrow)) return 'Tomorrow'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const navigate = useNavigate()
  const { roommates, rooms } = useHouse()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const dates = [today, tomorrow].map((d) => d.toISOString().split('T')[0])
    getEventsForDates(dates).then(setEvents)

    choresService.getCurrentWeek().then((week) => {
      choresService.getAssignments().then((all) => {
        setAssignments(all.filter((a) => a.week === week))
      })
    })

    financeService.getPayments().then(setPayments)
  }, [])

  const choresDone = assignments.filter((a) => a.completed).length
  const choresTodo = assignments.length - choresDone
  const totalOwed = payments.reduce(
    (sum, p) => sum + financeService.getRemainingBalance(p),
    0
  )

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="page-content flex flex-col">
      <div className="bg-mesh" />

      <div className="relative z-10 flex flex-col flex-1 px-5 py-6">
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {getGreeting()}
          </h1>
        </div>

        <div className="home-grid flex-1">
          <div
            onClick={() => navigate('/calendar')}
            className="home-grid-events bento-card rounded-2xl p-6 cursor-pointer accent-line accent-indigo group flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <CalendarDays size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Coming Up</h2>
                  <p className="text-xs text-slate-500">Today & tomorrow</p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                    <Plus size={22} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">No upcoming events</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Click to add your first event
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {events.slice(0, 8).map((event, i) => {
                    const isFirst = i === 0 || events[i - 1]?.date !== event.date
                    return (
                      <div key={event.id}>
                        {isFirst && (
                          <p className="text-[11px] font-semibold text-indigo-400/70 uppercase tracking-wider mt-4 mb-2 first:mt-0">
                            {formatDateLabel(event.date)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                          <div className="w-1 h-8 rounded-full bg-indigo-500/40 shrink-0" />
                          <span className="text-xs text-slate-500 w-16 tabular-nums shrink-0">
                            {formatTime(event.time)}
                          </span>
                          <span className="text-sm text-slate-300 truncate">
                            {event.description}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {events.length > 8 && (
                    <p className="text-xs text-slate-600 text-center pt-2">
                      +{events.length - 8} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate('/chores')}
            className="home-grid-chores bento-card rounded-2xl p-5 cursor-pointer accent-line accent-emerald group flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Sparkles size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Chores</h3>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-600">No chores assigned</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-sm text-slate-300">{choresDone} completed</span>
                  </div>
                  {choresTodo > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-400" />
                      <span className="text-sm text-rose-400/80">{choresTodo} remaining</span>
                    </div>
                  )}
                  <div className="w-full h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${assignments.length > 0 ? (choresDone / assignments.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate('/finances')}
            className="home-grid-finances bento-card rounded-2xl p-5 cursor-pointer accent-line accent-amber group flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <DollarSign size={16} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Finances</h3>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-600">No active payments</p>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">${totalOwed.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    remaining across {payments.length} payment{payments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => navigate('/availability')}
            className="home-grid-avail bento-card rounded-2xl p-5 cursor-pointer accent-line accent-sky group flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <Clock size={16} className="text-sky-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Availability</h3>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500">{roommates.length} roommate{roommates.length !== 1 ? 's' : ''}</p>
          </div>

          <div
            onClick={() => navigate('/reserve')}
            className="home-grid-reserve bento-card rounded-2xl p-5 cursor-pointer accent-line accent-purple group flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <DoorOpen size={16} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Reserve</h3>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500">{rooms.filter((r) => r.reservable).length} room{rooms.filter((r) => r.reservable).length !== 1 ? 's' : ''}</p>
          </div>

          <div
            onClick={() => navigate('/settings')}
            className="home-grid-settings bento-card rounded-2xl p-5 cursor-pointer accent-line accent-slate group flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Settings size={16} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Settings</h3>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500">Manage household</p>
          </div>
        </div>
      </div>
    </div>
  )
}
