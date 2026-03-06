import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'bartenders-choice-favorites'

function readFavorites(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function writeFavorites(ids: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // localStorage unavailable (private browsing)
  }
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
