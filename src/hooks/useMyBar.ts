import { useState, useCallback, useEffect } from 'react'
import { persist, readSync, restoreIfNeeded } from '../utils/storage'

const STORAGE_KEY = 'bartenders-choice-mybar'

function readBar(): Set<string> {
  try {
    const raw = readSync(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeBar(items: Set<string>) {
  persist(STORAGE_KEY, JSON.stringify([...items]))
}

export default function useMyBar() {
  const [myIngredients, setMyIngredients] = useState<Set<string>>(readBar)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('_test', '1')
      localStorage.removeItem('_test')
    } catch {
      setUnavailable(true)
    }

    // Restore from IndexedDB if localStorage was cleared
    restoreIfNeeded(STORAGE_KEY).then((restored) => {
      if (restored) {
        try {
          const items = new Set(JSON.parse(restored) as string[])
          if (items.size > 0) setMyIngredients(items)
        } catch {
          // corrupt data
        }
      }
    })
  }, [])

  const toggle = useCallback((ingredient: string) => {
    setMyIngredients((prev) => {
      const next = new Set(prev)
      const key = ingredient.toLowerCase().trim()
      if (next.has(key)) next.delete(key)
      else next.add(key)
      writeBar(next)
      return next
    })
  }, [])

  const has = useCallback(
    (ingredient: string) => myIngredients.has(ingredient.toLowerCase().trim()),
    [myIngredients]
  )

  const clear = useCallback(() => {
    setMyIngredients(new Set())
    writeBar(new Set())
  }, [])

  const exportBar = useCallback(() => [...myIngredients], [myIngredients])

  const importBar = useCallback((items: string[]) => {
    const next = new Set(items)
    setMyIngredients(next)
    writeBar(next)
  }, [])

  return { myIngredients, toggle, has, clear, count: myIngredients.size, exportBar, importBar, unavailable }
}
