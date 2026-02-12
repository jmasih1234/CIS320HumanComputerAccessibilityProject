const PREFIX = 'househub_'

export function getItem<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
