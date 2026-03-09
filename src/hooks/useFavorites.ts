import { useState, useCallback, useEffect } from 'react'
import { persist, readSync, restoreIfNeeded } from '../utils/storage'

const STORAGE_KEY = 'bartenders-choice-favorites'

function readFavorites(): Set<number> {
  try {
    const raw = readSync(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function writeFavorites(ids: Set<number>) {
  persist(STORAGE_KEY, JSON.stringify([...ids]))
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(readFavorites)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('_test', '1')
      localStorage.removeItem('_test')
    } catch {
      setUnavailable(true)
    }

    restoreIfNeeded(STORAGE_KEY).then((restored) => {
      if (restored) {
        try {
          const ids = new Set(JSON.parse(restored) as number[])
          if (ids.size > 0) setFavorites(ids)
        } catch {
          // corrupt data
        }
      }
    })
  }, [])

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites])

  const exportFavorites = useCallback(() => {
    return JSON.stringify([...favorites])
  }, [favorites])

  const importFavorites = useCallback((json: string) => {
    try {
      const ids = JSON.parse(json) as number[]
      const next = new Set(ids)
      setFavorites(next)
      writeFavorites(next)
      return true
    } catch {
      return false
    }
  }, [])

  return { favorites, toggle, isFavorite, unavailable, exportFavorites, importFavorites }
}
