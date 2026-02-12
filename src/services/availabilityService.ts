import type { AvailabilityEntry } from '../types'
import { getItem, setItem } from './storage'

const KEY = 'availability'

export async function getAvailability(): Promise<AvailabilityEntry[]> {
  return getItem<AvailabilityEntry[]>(KEY, [])
}

export async function saveAvailability(
  entries: AvailabilityEntry[]
): Promise<void> {
  setItem(KEY, entries)
}

export async function setAvailabilityForRoommate(
  roommateId: string,
  newEntries: Omit<AvailabilityEntry, 'id'>[]
): Promise<AvailabilityEntry[]> {
  const all = await getAvailability()
  const others = all.filter((e) => e.roommateId !== roommateId)
  const withIds: AvailabilityEntry[] = newEntries.map((e) => ({
    ...e,
    id: crypto.randomUUID(),
  }))
  const updated = [...others, ...withIds]
  await saveAvailability(updated)
  return updated
}

export function getAvailabilityForDay(
  entries: AvailabilityEntry[],
  dayOfWeek: number
): AvailabilityEntry[] {
  return entries.filter((e) => e.dayOfWeek === dayOfWeek)
}
