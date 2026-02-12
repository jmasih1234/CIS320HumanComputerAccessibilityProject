import { useEffect, useState } from 'react'
import { Clock, Pencil } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useHouse } from '../context/HouseContext'
import type { AvailabilityEntry, AvailabilityStatus } from '../types'
import * as availabilityService from '../services/availabilityService'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  home: 'bg-emerald-500/60',
  maybe: 'bg-amber-400/50',
  away: 'bg-rose-500/50',
}

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  home: 'Home',
  maybe: 'Maybe',
  away: 'Away',
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12} ${ampm}`
}

export default function Availability() {
  const { roommates } = useHouse()
  const [entries, setEntries] = useState<AvailabilityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [editOpen, setEditOpen] = useState(false)
  const [editRoommate, setEditRoommate] = useState('')
  const [editSlots, setEditSlots] = useState<Record<number, AvailabilityStatus>>({})
  const [repeatWeekly, setRepeatWeekly] = useState(true)

  const load = async () => {
    setEntries(await availabilityService.getAvailability())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const dayEntries = availabilityService.getAvailabilityForDay(entries, selectedDay)

  const getStatus = (roommateId: string, hour: number): AvailabilityStatus | null => {
    return dayEntries.find((e) => e.roommateId === roommateId && e.hour === hour)?.status ?? null
  }

  const openEdit = (roommateId: string) => {
    setEditRoommate(roommateId)
    const existing: Record<number, AvailabilityStatus> = {}
    dayEntries.filter((e) => e.roommateId === roommateId).forEach((e) => { existing[e.hour] = e.status })
    setEditSlots(existing)
    setRepeatWeekly(true)
    setEditOpen(true)
  }

  const cycleSlot = (hour: number) => {
    const order: AvailabilityStatus[] = ['home', 'maybe', 'away']
    const current = editSlots[hour]
    if (!current) {
      setEditSlots((prev) => ({ ...prev, [hour]: 'home' }))
    } else {
      const next = (order.indexOf(current) + 1) % (order.length + 1)
      if (next === order.length) {
        setEditSlots((prev) => { const c = { ...prev }; delete c[hour]; return c })
      } else {
        setEditSlots((prev) => ({ ...prev, [hour]: order[next] }))
      }
    }
  }

  const handleSave = async () => {
    const others = entries.filter((e) => !(e.roommateId === editRoommate && e.dayOfWeek === selectedDay))
    const withIds: AvailabilityEntry[] = Object.entries(editSlots).map(([hour, status]) => ({
      id: crypto.randomUUID(),
      roommateId: editRoommate,
      dayOfWeek: selectedDay,
      hour: parseInt(hour),
      status,
      repeatWeekly,
    }))
    const updated = [...others, ...withIds]
    await availabilityService.saveAvailability(updated)
    setEntries(updated)
    setEditOpen(false)
  }

  if (loading) return <PageShell title="Availability"><Spinner /></PageShell>

  if (roommates.length === 0) {
    return <PageShell title="Availability"><EmptyState icon={<Clock size={24} />} message="Add roommates in Settings to track availability" /></PageShell>
  }

  return (
    <PageShell title="Availability">
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedDay === i
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="flex gap-5 mb-5 text-xs">
        {(Object.keys(STATUS_COLORS) as AvailabilityStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${STATUS_COLORS[s]}`} />
            <span className="text-slate-500">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left p-3 text-slate-600 font-medium text-xs w-20">Time</th>
                {roommates.map((r) => (
                  <th key={r.id} className="p-3 text-slate-400 font-medium text-xs">
                    <div className="flex flex-col items-center gap-1.5">
                      <span>{r.name}</span>
                      <button onClick={() => openEdit(r.id)} className="p-1 rounded hover:bg-white/[0.06] transition-colors cursor-pointer">
                        <Pencil size={10} className="text-slate-600" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-t border-white/[0.03]">
                  <td className="p-3 text-slate-600 text-xs whitespace-nowrap tabular-nums">{formatHour(hour)}</td>
                  {roommates.map((r) => {
                    const status = getStatus(r.id, hour)
                    return (
                      <td key={r.id} className="p-1 text-center">
                        <div className={`mx-auto w-full h-6 rounded-md transition-colors ${status ? STATUS_COLORS[status] : 'bg-white/[0.02]'}`} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit — ${roommates.find((r) => r.id === editRoommate)?.name ?? ''}`}>
        <p className="text-xs text-slate-600 mb-4">Tap to cycle: Home, Maybe, Away, Clear</p>
        <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin mb-4">
          {HOURS.map((hour) => {
            const status = editSlots[hour]
            return (
              <button key={hour} onClick={() => cycleSlot(hour)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors text-left cursor-pointer">
                <span className="text-xs text-slate-600 w-14 tabular-nums">{formatHour(hour)}</span>
                {status ? (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full text-white ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
                ) : (
                  <span className="text-xs text-slate-700">--</span>
                )}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-400 mb-5 cursor-pointer">
          <input type="checkbox" checked={repeatWeekly} onChange={(e) => setRepeatWeekly(e.target.checked)} className="rounded border-white/20 bg-white/5" />
          Repeat weekly
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>
    </PageShell>
  )
}
