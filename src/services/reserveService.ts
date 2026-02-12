import type { Reservation } from '../types'
import { getItem, setItem } from './storage'

const KEY = 'reservations'

export async function getReservations(): Promise<Reservation[]> {
  return getItem<Reservation[]>(KEY, [])
}

export async function createReservation(
  reservation: Omit<Reservation, 'id'>
): Promise<Reservation> {
  const all = await getReservations()
  const newRes: Reservation = { ...reservation, id: crypto.randomUUID() }
  all.push(newRes)
  setItem(KEY, all)
  return newRes
}

export async function deleteReservation(id: string): Promise<void> {
  const all = await getReservations()
  setItem(
    KEY,
    all.filter((r) => r.id !== id)
  )
}

export async function getReservationsForDate(
  date: string
): Promise<Reservation[]> {
  const all = await getReservations()
  return all.filter((r) => r.date === date)
}
