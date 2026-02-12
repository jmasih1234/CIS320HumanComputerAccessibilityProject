import { useState } from 'react'
import { Users, DoorOpen, Trash2, Plus, Pencil } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useHouse } from '../context/HouseContext'
import type { Room } from '../types'

const inputClasses =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-colors'

export default function SettingsPage() {
  const { roommates, rooms, loading, addRoommate, deleteRoommate, addRoom, updateRoom, deleteRoom } = useHouse()

  const [newName, setNewName] = useState('')
  const [roomModalOpen, setRoomModalOpen] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [roomName, setRoomName] = useState('')
  const [inChoreRotation, setInChoreRotation] = useState(true)
  const [reservable, setReservable] = useState(true)

  const handleAddRoommate = async () => {
    if (!newName.trim()) return
    await addRoommate(newName.trim())
    setNewName('')
  }

  const openAddRoom = () => {
    setEditRoom(null)
    setRoomName('')
    setInChoreRotation(true)
    setReservable(true)
    setRoomModalOpen(true)
  }

  const openEditRoom = (room: Room) => {
    setEditRoom(room)
    setRoomName(room.name)
    setInChoreRotation(room.inChoreRotation)
    setReservable(room.reservable)
    setRoomModalOpen(true)
  }

  const handleSaveRoom = async () => {
    if (!roomName.trim()) return
    if (editRoom) {
      await updateRoom({ ...editRoom, name: roomName.trim(), inChoreRotation, reservable })
    } else {
      await addRoom({ name: roomName.trim(), inChoreRotation, reservable })
    }
    setRoomModalOpen(false)
    setRoomName('')
  }

  if (loading) return <PageShell title="Settings"><Spinner /></PageShell>

  return (
    <PageShell title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Roommates</h2>
          </div>

          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRoommate()}
              className={`flex-1 ${inputClasses}`}
            />
            <Button size="md" onClick={handleAddRoommate} disabled={!newName.trim()}>
              <span className="flex items-center gap-2"><Plus size={16} />Add</span>
            </Button>
          </div>

          {roommates.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No roommates yet</p>
          ) : (
            <ul className="space-y-1.5">
              {roommates.map((r) => (
                <li key={r.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 group hover:bg-white/[0.05] transition-colors">
                  <span className="text-sm text-slate-300">{r.name}</span>
                  <button
                    onClick={() => deleteRoommate(r.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DoorOpen size={16} className="text-purple-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Rooms</h2>
            </div>
            <Button size="md" onClick={openAddRoom}>
              <span className="flex items-center gap-2"><Plus size={16} />Add Room</span>
            </Button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No rooms yet</p>
          ) : (
            <ul className="space-y-1.5">
              {rooms.map((room) => (
                <li key={room.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 group hover:bg-white/[0.05] transition-colors">
                  <div>
                    <span className="text-sm text-slate-300">{room.name}</span>
                    <div className="flex gap-1.5 mt-1">
                      {room.inChoreRotation && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15 px-1.5 py-0.5 rounded-full">Chores</span>
                      )}
                      {room.reservable && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-400/80 border border-purple-500/15 px-1.5 py-0.5 rounded-full">Reservable</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditRoom(room)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-600 hover:text-slate-300 transition-all cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteRoom(room.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} title={editRoom ? 'Edit Room' : 'Add Room'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Room Name</label>
            <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Kitchen, Living Room..." className={inputClasses} />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={inChoreRotation} onChange={(e) => setInChoreRotation(e.target.checked)} className="rounded border-white/20 bg-white/5" />
            Include in chore rotation
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={reservable} onChange={(e) => setReservable(e.target.checked)} className="rounded border-white/20 bg-white/5" />
            Allow reservations
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRoomModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRoom} disabled={!roomName.trim()}>{editRoom ? 'Save' : 'Add Room'}</Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
