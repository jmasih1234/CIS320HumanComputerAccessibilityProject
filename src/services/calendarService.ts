import type { CalendarEvent } from '../types'
import { getItem, setItem } from './storage'

const KEY = 'events'

export async function getEvents(): Promise<CalendarEvent[]> {
  return getItem<CalendarEvent[]>(KEY, [])
}

export async function createEvent(
  event: Omit<CalendarEvent, 'id'>
): Promise<CalendarEvent> {
  const events = await getEvents()
  const newEvent: CalendarEvent = { ...event, id: crypto.randomUUID() }
  events.push(newEvent)
  setItem(KEY, events)
  return newEvent
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents()
  setItem(
    KEY,
    events.filter((e) => e.id !== id)
  )
}

export async function getEventsForDates(dates: string[]): Promise<CalendarEvent[]> {
  const events = await getEvents()
  return events
    .filter((e) => dates.includes(e.date))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
}
