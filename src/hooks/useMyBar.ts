import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'bartenders-choice-mybar'

function readBar(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeBar(items: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]))
  } catch {
    // localStorage unavailable
  }
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
