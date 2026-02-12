import type { ChoreAssignment, DishwasherTrash, CustomChore } from '../types'
import { getItem, setItem } from './storage'

const CUSTOM_KEY = 'chores_custom'
const WEEK_KEY = 'chores_week'
const ASSIGNMENTS_KEY = 'chores_assignments'
const DT_KEY = 'chores_dt'
const START_KEY = 'chores_start_date'

export async function getCurrentWeek(): Promise<number> {
  return getItem<number>(WEEK_KEY, 1)
}

export async function setCurrentWeek(week: number): Promise<void> {
  setItem(WEEK_KEY, week)
}

export async function getStartDate(): Promise<string> {
  const existing = getItem<string | null>(START_KEY, null)
  if (existing) return existing
  const today = new Date().toISOString().split('T')[0]
  setItem(START_KEY, today)
  return today
}

export async function getAssignments(): Promise<ChoreAssignment[]> {
  return getItem<ChoreAssignment[]>(ASSIGNMENTS_KEY, [])
}

export async function saveAssignments(
  assignments: ChoreAssignment[]
): Promise<void> {
  setItem(ASSIGNMENTS_KEY, assignments)
}

export async function getDishwasherTrash(): Promise<DishwasherTrash[]> {
  return getItem<DishwasherTrash[]>(DT_KEY, [
    { type: 'dishwasher', currentRoommateIndex: 0, completed: false },
    { type: 'trash', currentRoommateIndex: 1, completed: false },
  ])
}

export async function saveDishwasherTrash(
  items: DishwasherTrash[]
): Promise<void> {
  setItem(DT_KEY, items)
}

export async function markAssignmentComplete(
  roomId: string,
  week: number
): Promise<ChoreAssignment[]> {
  const assignments = await getAssignments()
  const updated = assignments.map((a) =>
    a.roomId === roomId && a.week === week ? { ...a, completed: true } : a
  )
  await saveAssignments(updated)
  return updated
}

export async function completeDishwasherTrash(
  type: 'dishwasher' | 'trash',
  totalRoommates: number
): Promise<DishwasherTrash[]> {
  const items = await getDishwasherTrash()
  const updated = items.map((item) => {
    if (item.type !== type) return item
    return {
      ...item,
      completed: false,
      currentRoommateIndex: (item.currentRoommateIndex + 1) % totalRoommates,
    }
  })
  await saveDishwasherTrash(updated)
  return updated
}

export async function getCustomChores(): Promise<CustomChore[]> {
  const raw = getItem<CustomChore[]>(CUSTOM_KEY, [])
  const migrated = (raw as CustomChore[]).map((c) => ({
    ...c,
    recurring: c.recurring ?? false,
    currentRoommateIndex: c.currentRoommateIndex ?? 0,
  }))
  return migrated
}

export async function addCustomChore(
  name: string,
  assignedTo: string | null,
  recurring: boolean,
  startingIndex: number
): Promise<CustomChore> {
  const chores = await getCustomChores()
  const newChore: CustomChore = {
    id: crypto.randomUUID(),
    name,
    recurring,
    assignedTo: recurring ? null : assignedTo,
    currentRoommateIndex: startingIndex,
    completed: false,
  }
  chores.push(newChore)
  setItem(CUSTOM_KEY, chores)
  return newChore
}

export async function completeCustomChore(
  id: string,
  totalRoommates: number
): Promise<CustomChore[]> {
  const chores = await getCustomChores()
  const updated = chores.map((c) => {
    if (c.id !== id) return c
    if (c.recurring && totalRoommates > 0) {
      return {
        ...c,
        completed: false,
        currentRoommateIndex: (c.currentRoommateIndex + 1) % totalRoommates,
      }
    }
    return { ...c, completed: !c.completed }
  })
  setItem(CUSTOM_KEY, updated)
  return updated
}

export async function deleteCustomChore(id: string): Promise<CustomChore[]> {
  const chores = await getCustomChores()
  const updated = chores.filter((c) => c.id !== id)
  setItem(CUSTOM_KEY, updated)
  return updated
}

export function buildRotation(
  roommateIds: string[],
  choreRoomIds: string[],
  week: number
): ChoreAssignment[] {
  const n = roommateIds.length
  if (n === 0) return []

  return choreRoomIds.map((roomId, index) => {
    const offset = (index + (week - 1)) % n
    const roommateId = offset < n ? roommateIds[offset] : null
    return { roomId, roommateId, completed: false, week }
  })
}
