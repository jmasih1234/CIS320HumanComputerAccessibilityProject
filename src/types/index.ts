export interface Roommate {
  id: string
  name: string
}

export interface Room {
  id: string
  name: string
  inChoreRotation: boolean
  reservable: boolean
}

export interface CalendarEvent {
  id: string
  date: string
  time: string
  description: string
  createdBy: string
}

export interface ChoreAssignment {
  roomId: string
  roommateId: string | null
  completed: boolean
  week: number
}

export interface DishwasherTrash {
  type: 'dishwasher' | 'trash'
  currentRoommateIndex: number
  completed: boolean
}

export interface CustomChore {
  id: string
  name: string
  recurring: boolean
  assignedTo: string | null
  currentRoommateIndex: number
  completed: boolean
}

export interface Contribution {
  roommateId: string
  responsible: number
  paid: number
}

export interface Payment {
  id: string
  reason: string
  totalAmount: number
  notes: string
  contributions: Contribution[]
}

export type AvailabilityStatus = 'home' | 'maybe' | 'away'

export interface AvailabilityEntry {
  id: string
  roommateId: string
  dayOfWeek: number
  hour: number
  status: AvailabilityStatus
  repeatWeekly: boolean
  specificDate?: string
}

export interface Reservation {
  id: string
  roomId: string
  date: string
  hour: number
  roommateId: string
  reason: string
}
