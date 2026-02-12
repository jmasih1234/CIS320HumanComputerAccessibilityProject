import type { Roommate, Room } from '../types'
import { getItem, setItem } from './storage'

const ROOMMATES_KEY = 'roommates'
const ROOMS_KEY = 'rooms'

export async function getRoommates(): Promise<Roommate[]> {
  return getItem<Roommate[]>(ROOMMATES_KEY, [])
}

export async function addRoommate(name: string): Promise<Roommate> {
  const roommates = await getRoommates()
  const newRoommate: Roommate = { id: crypto.randomUUID(), name }
  roommates.push(newRoommate)
  setItem(ROOMMATES_KEY, roommates)
  return newRoommate
}

export async function deleteRoommate(id: string): Promise<Roommate[]> {
  const roommates = await getRoommates()
  const updated = roommates.filter((r) => r.id !== id)
  setItem(ROOMMATES_KEY, updated)
  return updated
}

export async function getRooms(): Promise<Room[]> {
  return getItem<Room[]>(ROOMS_KEY, [])
}

export async function addRoom(
  room: Omit<Room, 'id'>
): Promise<Room> {
  const rooms = await getRooms()
  const newRoom: Room = { ...room, id: crypto.randomUUID() }
  rooms.push(newRoom)
  setItem(ROOMS_KEY, rooms)
  return newRoom
}

export async function updateRoom(updated: Room): Promise<Room[]> {
  const rooms = await getRooms()
  const result = rooms.map((r) => (r.id === updated.id ? updated : r))
  setItem(ROOMS_KEY, result)
  return result
}

export async function deleteRoom(id: string): Promise<Room[]> {
  const rooms = await getRooms()
  const updated = rooms.filter((r) => r.id !== id)
  setItem(ROOMS_KEY, updated)
  return updated
}
