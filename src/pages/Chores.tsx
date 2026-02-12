import { useEffect, useState, useCallback } from 'react'
import {
  Sparkles,
  WashingMachine,
  Trash2,
  RotateCcw,
  Users,
  Plus,
  X,
  ClipboardList,
  CircleCheck,
  Circle,
  User,
  Repeat,
} from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useHouse } from '../context/HouseContext'
import type { ChoreAssignment, DishwasherTrash, CustomChore } from '../types'
import * as choresService from '../services/choresService'

const inputClasses =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-colors'

const PERSON_COLORS = [
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/15', text: 'text-indigo-400', accent: 'bg-indigo-500/40' },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/15', text: 'text-violet-400', accent: 'bg-violet-500/40' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/15', text: 'text-cyan-400', accent: 'bg-cyan-500/40' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/15', text: 'text-amber-400', accent: 'bg-amber-500/40' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/15', text: 'text-rose-400', accent: 'bg-rose-500/40' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', text: 'text-emerald-400', accent: 'bg-emerald-500/40' },
]

export default function Chores() {
  const { roommates, rooms } = useHouse()
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([])
  const [dtItems, setDtItems] = useState<DishwasherTrash[]>([])
  const [customChores, setCustomChores] = useState<CustomChore[]>([])
  const [week, setWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [choreName, setChoreName] = useState('')
  const [choreAssignee, setChoreAssignee] = useState('')
  const [choreRecurring, setChoreRecurring] = useState(true)

  const choreRooms = rooms.filter((r) => r.inChoreRotation)

  const load = useCallback(async () => {
    const currentWeek = await choresService.getCurrentWeek()
    setWeek(currentWeek)

    let existing = await choresService.getAssignments()
    const weekAssignments = existing.filter((a) => a.week === currentWeek)

    if (weekAssignments.length === 0 && roommates.length > 0 && choreRooms.length > 0) {
      const fresh = choresService.buildRotation(
        roommates.map((r) => r.id),
        choreRooms.map((r) => r.id),
        currentWeek
      )
      await choresService.saveAssignments([...existing, ...fresh])
      existing = await choresService.getAssignments()
    }

    setAssignments(existing.filter((a) => a.week === currentWeek))
    setDtItems(await choresService.getDishwasherTrash())
    setCustomChores(await choresService.getCustomChores())
    setLoading(false)
  }, [roommates, choreRooms])

  useEffect(() => {
    const handle = setTimeout(() => load(), 0)
    return () => clearTimeout(handle)
  }, [load])

  const advanceWeek = async () => {
    const next = week + 1
    await choresService.setCurrentWeek(next)
    const allAssignments = await choresService.getAssignments()
    const fresh = choresService.buildRotation(
      roommates.map((r) => r.id),
      choreRooms.map((r) => r.id),
      next
    )
    await choresService.saveAssignments([...allAssignments, ...fresh])
    const dtReset: DishwasherTrash[] = dtItems.map((item) => ({
      ...item,
      completed: false,
    }))
    await choresService.saveDishwasherTrash(dtReset)
    load()
  }

  const markComplete = async (roomId: string) => {
    const updated = await choresService.markAssignmentComplete(roomId, week)
    setAssignments(updated.filter((a) => a.week === week))
  }

  const completeDT = async (type: 'dishwasher' | 'trash') => {
    const updated = await choresService.completeDishwasherTrash(type, roommates.length)
    setDtItems(updated)
  }

  const handleAddChore = async () => {
    if (!choreName.trim()) return
    const assignee = choreRecurring ? null : (choreAssignee || null)
    const startIdx = choreRecurring ? 0 : -1
    await choresService.addCustomChore(choreName.trim(), assignee, choreRecurring, startIdx)
    setChoreName('')
    setChoreAssignee('')
    setChoreRecurring(true)
    setAddOpen(false)
    setCustomChores(await choresService.getCustomChores())
  }

  const handleCompleteCustom = async (id: string) => {
    setCustomChores(await choresService.completeCustomChore(id, roommates.length))
  }

  const handleDeleteCustom = async (id: string) => {
    setCustomChores(await choresService.deleteCustomChore(id))
  }

  const getRoomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? 'Unknown'

  const getRecurringAssignee = (chore: CustomChore): string | null => {
    if (!chore.recurring || roommates.length === 0) return null
    const idx = chore.currentRoommateIndex % roommates.length
    return roommates[idx]?.id ?? null
  }

  const oneTimeChores = customChores.filter((c) => !c.recurring)
  const recurringChores = customChores.filter((c) => c.recurring)

  const allRotationDone = assignments.filter((a) => a.completed).length
  const oneTimeDone = oneTimeChores.filter((c) => c.completed).length
  const allTotal = assignments.length + oneTimeChores.length
  const totalDone = allRotationDone + oneTimeDone

  if (loading) return <PageShell title="Chores"><Spinner /></PageShell>

  const getPersonChores = (roommateId: string) => {
    const rotation = assignments.filter((a) => a.roommateId === roommateId && rooms.some((r) => r.id === a.roomId))
    const recurring = recurringChores.filter((c) => getRecurringAssignee(c) === roommateId)
    const oneTime = oneTimeChores.filter((c) => c.assignedTo === roommateId)
    const dt = dtItems
      .map((item) => {
        const assignedRoommate = roommates[item.currentRoommateIndex % roommates.length]
        if (assignedRoommate?.id === roommateId) return item
        return null
      })
      .filter(Boolean) as DishwasherTrash[]
    return { rotation, recurring, oneTime, dt }
  }

  const unassignedOneTime = oneTimeChores.filter((c) => !c.assignedTo)

  return (
    <PageShell
      title="Chores"
      action={
        roommates.length > 0 && choreRooms.length > 0 ? (
          <Button variant="secondary" size="md" onClick={advanceWeek}>
            <span className="flex items-center gap-2">
              <RotateCcw size={15} />
              Next Week
            </span>
          </Button>
        ) : undefined
      }
    >
      {roommates.length === 0 && (
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4 mb-6 flex items-center gap-3">
          <Users size={18} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300/80">
            Add roommates in <span className="font-semibold text-amber-300">Settings</span> to assign chores.
          </p>
        </div>
      )}

      {choreRooms.length === 0 && roommates.length > 0 && (
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4 mb-6 flex items-center gap-3">
          <Sparkles size={18} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300/80">
            Add rooms with <span className="font-semibold text-amber-300">chore rotation</span> in Settings.
          </p>
        </div>
      )}

      {roommates.length > 0 && allTotal > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-slate-500 font-medium">Week {week}</span>
          <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
              style={{ width: `${allTotal > 0 ? (totalDone / allTotal) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 tabular-nums font-medium">{totalDone}/{allTotal}</span>
        </div>
      )}

      <div
        onClick={() => setAddOpen(true)}
        className="rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-indigo-500/30 bg-white/[0.02] hover:bg-indigo-500/[0.04] p-5 mb-8 flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/15 flex items-center justify-center transition-colors">
          <Plus size={20} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            Add a Chore
          </p>
          <p className="text-xs text-slate-500">Common chores rotate, one-time chores stay assigned</p>
        </div>
      </div>

      {roommates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roommates.map((roommate, idx) => {
            const color = PERSON_COLORS[idx % PERSON_COLORS.length]
            const { rotation, recurring, oneTime, dt } = getPersonChores(roommate.id)
            const personTotal = rotation.length + recurring.length + oneTime.length + dt.length
            const personDone =
              rotation.filter((a) => a.completed).length +
              oneTime.filter((c) => c.completed).length +
              dt.filter((d) => d.completed).length

            return (
              <div
                key={roommate.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <div className={`px-5 py-4 flex items-center justify-between ${color.bg} border-b ${color.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${color.accent} flex items-center justify-center`}>
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{roommate.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {personDone}/{personTotal} done
                      </p>
                    </div>
                  </div>
                  {personTotal > 0 && personDone === personTotal && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                      All done
                    </span>
                  )}
                </div>

                <div className="p-3">
                  {personTotal === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-6">No chores assigned</p>
                  ) : (
                    <div className="space-y-1">
                      {dt.map((item) => (
                        <button
                          key={item.type}
                          onClick={() => completeDT(item.type)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/[0.04] cursor-pointer"
                        >
                          <Circle size={22} className="text-slate-600 shrink-0" />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {item.type === 'dishwasher' ? (
                              <WashingMachine size={14} className="text-slate-500" />
                            ) : (
                              <Trash2 size={14} className="text-slate-500" />
                            )}
                            <span className="text-sm text-slate-200">
                              {item.type === 'dishwasher' ? 'Dishwasher' : 'Trash'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-600 flex items-center gap-1">
                            <Repeat size={10} /> rotates
                          </span>
                        </button>
                      ))}

                      {rotation.map((a) => (
                        <button
                          key={a.roomId}
                          onClick={() => !a.completed && markComplete(a.roomId)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                            a.completed
                              ? 'bg-emerald-500/[0.04]'
                              : 'hover:bg-white/[0.04] cursor-pointer'
                          }`}
                        >
                          {a.completed ? (
                            <CircleCheck size={22} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Circle size={22} className="text-slate-600 shrink-0" />
                          )}
                          <span className={`text-sm flex-1 text-left ${a.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            Clean {getRoomName(a.roomId)}
                          </span>
                        </button>
                      ))}

                      {recurring.map((chore) => (
                        <button
                          key={chore.id}
                          onClick={() => handleCompleteCustom(chore.id)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/[0.04] cursor-pointer group/row"
                        >
                          <Circle size={22} className="text-slate-600 shrink-0" />
                          <span className="text-sm text-slate-200 flex-1 text-left">{chore.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                              <Repeat size={10} /> rotates
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCustom(chore.id) }}
                              className="p-1 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover/row:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </button>
                      ))}

                      {oneTime.map((chore) => (
                        <div
                          key={chore.id}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group/row ${
                            chore.completed
                              ? 'bg-emerald-500/[0.04]'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <button
                            onClick={() => handleCompleteCustom(chore.id)}
                            className="shrink-0 cursor-pointer"
                          >
                            {chore.completed ? (
                              <CircleCheck size={22} className="text-emerald-400" />
                            ) : (
                              <Circle size={22} className="text-slate-600" />
                            )}
                          </button>
                          <span className={`text-sm flex-1 ${chore.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {chore.name}
                          </span>
                          <button
                            onClick={() => handleDeleteCustom(chore.id)}
                            className="p-1 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {unassignedOneTime.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3 bg-white/[0.03] border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <ClipboardList size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unassigned</p>
              <p className="text-[11px] text-slate-400">
                {unassignedOneTime.filter((c) => c.completed).length}/{unassignedOneTime.length} done
              </p>
            </div>
          </div>
          <div className="p-3 space-y-1">
            {unassignedOneTime.map((chore) => (
              <div
                key={chore.id}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group/row ${
                  chore.completed ? 'bg-emerald-500/[0.04]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <button onClick={() => handleCompleteCustom(chore.id)} className="shrink-0 cursor-pointer">
                  {chore.completed ? (
                    <CircleCheck size={22} className="text-emerald-400" />
                  ) : (
                    <Circle size={22} className="text-slate-600" />
                  )}
                </button>
                <span className={`text-sm flex-1 ${chore.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {chore.name}
                </span>
                <button
                  onClick={() => handleDeleteCustom(chore.id)}
                  className="p-1 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {roommates.length === 0 && customChores.length === 0 && (
        <EmptyState icon={<ClipboardList size={24} />} message="Add roommates in Settings and create chores to get started." />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a Chore">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              What needs to be done?
            </label>
            <input
              type="text"
              value={choreName}
              onChange={(e) => setChoreName(e.target.value)}
              placeholder="Take out recycling, vacuum living room..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddChore()}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Chore type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setChoreRecurring(true)}
                className={`flex-1 py-3 px-3 rounded-xl border transition-all cursor-pointer ${
                  choreRecurring
                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Repeat size={14} />
                  <span className="text-sm font-medium">Common</span>
                </div>
                <p className="text-[10px] opacity-70">Rotates between everyone</p>
              </button>
              <button
                onClick={() => setChoreRecurring(false)}
                className={`flex-1 py-3 px-3 rounded-xl border transition-all cursor-pointer ${
                  !choreRecurring
                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <User size={14} />
                  <span className="text-sm font-medium">One-time</span>
                </div>
                <p className="text-[10px] opacity-70">Assigned to one person</p>
              </button>
            </div>
          </div>

          {!choreRecurring && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Assign to
              </label>
              <select
                value={choreAssignee}
                onChange={(e) => setChoreAssignee(e.target.value)}
                className={inputClasses}
              >
                <option value="">No one (unassigned)</option>
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {choreRecurring && roommates.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-center gap-2.5">
              <Repeat size={14} className="text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-400">
                Starts with <span className="text-slate-200 font-medium">{roommates[0]?.name}</span>,
                then rotates to the next person each time it's completed.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddChore} disabled={!choreName.trim()}>
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Add Chore
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
