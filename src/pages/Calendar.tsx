import { useEffect, useState } from 'react'
import { Plus, CalendarCheck, Trash2 } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import type { CalendarEvent } from '../types'
import * as calendarService from '../services/calendarService'

const inputClasses =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-colors'

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function groupByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const groups: Record<string, CalendarEvent[]> = {}
  for (const event of events) {
    if (!groups[event.date]) groups[event.date] = []
    groups[event.date].push(event)
  }
  return groups
}

function formatDateLabel(dateStr: string): string {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const toLocal = (d: Date) => d.toISOString().split('T')[0]
  if (dateStr === toLocal(today)) return 'Today'
  if (dateStr === toLocal(tomorrow)) return 'Tomorrow'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    const data = await calendarService.getEvents()
    data.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
    setEvents(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!date || !time || !description.trim()) return
    await calendarService.createEvent({
      date,
      time,
      description: description.trim(),
      createdBy: '',
    })
    setDate('')
    setTime('')
    setDescription('')
    setModalOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await calendarService.deleteEvent(id)
    load()
  }

  const grouped = groupByDate(events)
  const sortedDates = Object.keys(grouped).sort()

  return (
    <PageShell
      title="Calendar"
      action={
        <Button size="lg" onClick={() => setModalOpen(true)}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Add Event
          </span>
        </Button>
      }
    >
      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={24} />}
          message="No events yet. Add one to get started."
        />
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="text-[11px] font-semibold text-indigo-400/60 uppercase tracking-widest mb-3">
                {formatDateLabel(dateKey)}
              </h3>
              <div className="space-y-2">
                {grouped[dateKey].map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 group hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                  >
                    <div className="w-1 h-8 rounded-full bg-indigo-500/40 shrink-0" />
                    <span className="text-xs text-slate-500 w-16 tabular-nums shrink-0">
                      {formatTime(event.time)}
                    </span>
                    <p className="text-sm text-slate-300 flex-1 truncate">
                      {event.description}
                    </p>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Event">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Plumber coming at noon..."
              className={`${inputClasses} resize-none`}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!date || !time || !description.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
