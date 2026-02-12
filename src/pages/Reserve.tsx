import { useEffect, useState } from 'react'
import { DoorOpen, Plus } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useHouse } from '../context/HouseContext'
import type { Reservation } from '../types'
import * as reserveService from '../services/reserveService'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)

const inputClasses =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-colors'

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12} ${ampm}`
}

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export default function Reserve() {
  const { roommates, rooms } = useHouse()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [createOpen, setCreateOpen] = useState(false)
  const [detailRes, setDetailRes] = useState<Reservation | null>(null)

  const [formRoom, setFormRoom] = useState('')
  const [formHour, setFormHour] = useState('')
  const [formRoommate, setFormRoommate] = useState('')
  const [formReason, setFormReason] = useState('')

  const reservableRooms = rooms.filter((r) => r.reservable)

  const load = async () => {
    setReservations(await reserveService.getReservationsForDate(selectedDate))
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedDate])

  const getReservation = (roomId: string, hour: number) =>
    reservations.find((r) => r.roomId === roomId && r.hour === hour)

  const handleCreate = async () => {
    if (!formRoom || !formHour || !formRoommate || !formReason.trim()) return
    await reserveService.createReservation({
      roomId: formRoom,
      date: selectedDate,
      hour: parseInt(formHour),
      roommateId: formRoommate,
      reason: formReason.trim(),
    })
    setFormRoom('')
    setFormHour('')
    setFormRoommate('')
    setFormReason('')
    setCreateOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await reserveService.deleteReservation(id)
    setDetailRes(null)
    load()
  }

  const getRoommateName = (id: string) => roommates.find((r) => r.id === id)?.name ?? 'Unknown'
  const getRoomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Unknown'

  if (loading) return <PageShell title="Reserve a Room"><Spinner /></PageShell>

  if (reservableRooms.length === 0) {
    return <PageShell title="Reserve a Room"><EmptyState icon={<DoorOpen size={24} />} message="No reservable rooms. Add rooms in Settings." /></PageShell>
  }

  return (
    <PageShell
      title="Reserve a Room"
      action={
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
          />
          <Button onClick={() => setCreateOpen(true)}>
            <span className="flex items-center gap-1.5"><Plus size={16} />Reserve</span>
          </Button>
        </div>
      }
    >
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left p-3 text-slate-600 font-medium text-xs w-20">Time</th>
                {reservableRooms.map((room) => (
                  <th key={room.id} className="p-3 text-slate-400 font-medium text-xs">{room.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-t border-white/[0.03]">
                  <td className="p-3 text-slate-600 text-xs whitespace-nowrap tabular-nums">{formatHour(hour)}</td>
                  {reservableRooms.map((room) => {
                    const res = getReservation(room.id, hour)
                    return (
                      <td key={room.id} className="p-1 text-center">
                        {res ? (
                          <button
                            onClick={() => setDetailRes(res)}
                            className="w-full h-6 rounded-md bg-rose-500/50 hover:bg-rose-500/70 transition-colors cursor-pointer"
                          />
                        ) : (
                          <div className="w-full h-6 rounded-md bg-white/[0.02]" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Reserve a Room">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Room</label>
            <select value={formRoom} onChange={(e) => setFormRoom(e.target.value)} className={inputClasses}>
              <option value="">Select room</option>
              {reservableRooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Time</label>
            <select value={formHour} onChange={(e) => setFormHour(e.target.value)} className={inputClasses}>
              <option value="">Select time</option>
              {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Reserved by</label>
            <select value={formRoommate} onChange={(e) => setFormRoommate(e.target.value)} className={inputClasses}>
              <option value="">Select roommate</option>
              {roommates.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Reason</label>
            <input type="text" value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="Study session, movie night..." className={inputClasses} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formRoom || !formHour || !formRoommate || !formReason.trim()}>Reserve</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailRes} onClose={() => setDetailRes(null)} title="Reservation Details">
        {detailRes && (
          <div className="space-y-4">
            <div className="space-y-3 bg-white/[0.03] rounded-xl p-4">
              {[
                ['Room', getRoomName(detailRes.roomId)],
                ['Time', formatHour(detailRes.hour)],
                ['Reserved by', getRoommateName(detailRes.roommateId)],
                ['Reason', detailRes.reason],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDetailRes(null)}>Close</Button>
              <Button variant="danger" onClick={() => handleDelete(detailRes.id)}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  )
}
