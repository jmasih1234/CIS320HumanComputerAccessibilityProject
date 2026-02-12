import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Roommate, Room } from '../types'
import * as settingsService from '../services/settingsService'

interface HouseContextValue {
  roommates: Roommate[]
  rooms: Room[]
  loading: boolean
  addRoommate: (name: string) => Promise<void>
  deleteRoommate: (id: string) => Promise<void>
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>
  updateRoom: (room: Room) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const HouseContext = createContext<HouseContextValue | null>(null)

export function HouseProvider({ children }: { children: ReactNode }) {
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [r, ro] = await Promise.all([
      settingsService.getRoommates(),
      settingsService.getRooms(),
    ])
    setRoommates(r)
    setRooms(ro)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addRoommate = async (name: string) => {
    await settingsService.addRoommate(name)
    await refresh()
  }

  const deleteRoommate = async (id: string) => {
    await settingsService.deleteRoommate(id)
    await refresh()
  }

  const addRoom = async (room: Omit<Room, 'id'>) => {
    await settingsService.addRoom(room)
    await refresh()
  }

  const updateRoom = async (room: Room) => {
    await settingsService.updateRoom(room)
    await refresh()
  }

  const deleteRoom = async (id: string) => {
    await settingsService.deleteRoom(id)
    await refresh()
  }

  return (
    <HouseContext.Provider
      value={{
        roommates,
        rooms,
        loading,
        addRoommate,
        deleteRoommate,
        addRoom,
        updateRoom,
        deleteRoom,
        refresh,
      }}
    >
      {children}
    </HouseContext.Provider>
  )
}

export function useHouse() {
  const ctx = useContext(HouseContext)
  if (!ctx) throw new Error('useHouse must be used within HouseProvider')
  return ctx
}
