import { useState, useCallback, useEffect } from 'react'
import { persist, readSync, restoreIfNeeded } from '../utils/storage'

const STORAGE_KEY = 'bartenders-choice-userdata'

type CocktailUserData = {
  rating?: number
  notes?: string
}

type UserDataMap = Record<number, CocktailUserData>

function read(): UserDataMap {
  try {
    const raw = readSync(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UserDataMap
  } catch {
    return {}
  }
}

function write(data: UserDataMap) {
  persist(STORAGE_KEY, JSON.stringify(data))
}

export default function useUserData() {
  const [data, setData] = useState<UserDataMap>(read)

  useEffect(() => {
    restoreIfNeeded(STORAGE_KEY).then((restored) => {
      if (restored) {
        try {
          const parsed = JSON.parse(restored) as UserDataMap
          if (Object.keys(parsed).length > 0) setData(parsed)
        } catch {
          // corrupt data
        }
      }
    })
  }, [])

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

  const exportData = useCallback(() => data, [data])

  const importData = useCallback((imported: UserDataMap) => {
    setData(imported)
    write(imported)
  }, [])

  return { getRating, getNotes, setRating, setNotes, exportData, importData }
}
