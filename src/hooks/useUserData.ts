import { useState, useCallback } from 'react'

const STORAGE_KEY = 'bartenders-choice-userdata'

type CocktailUserData = {
  rating?: number
  notes?: string
}

type UserDataMap = Record<number, CocktailUserData>

function read(): UserDataMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UserDataMap
  } catch {
    return {}
  }
}

function write(data: UserDataMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (private browsing)
  }
}

export default function useUserData() {
  const [data, setData] = useState<UserDataMap>(read)

  const getRating = useCallback((id: number) => data[id]?.rating ?? 0, [data])
  const getNotes = useCallback((id: number) => data[id]?.notes ?? '', [data])

  const setRating = useCallback((id: number, rating: number) => {
    setData((prev) => {
      const next = { ...prev, [id]: { ...prev[id], rating } }
      write(next)
      return next
    })
  }, [])

  const setNotes = useCallback((id: number, notes: string) => {
    setData((prev) => {
      const next = { ...prev, [id]: { ...prev[id], notes } }
      write(next)
      return next
    })
  }, [])

  return { getRating, getNotes, setRating, setNotes }
}
