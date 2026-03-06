import { useMemo, useState, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import type { Cocktail } from '../types'

const DEBOUNCE_MS = 300

export default function useSearch(cocktails: Cocktail[]) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const fuse = useMemo(
    () =>
      new Fuse(cocktails, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'ingredientsText', weight: 2 },
          { name: 'bartender', weight: 1 },
          { name: 'bar', weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [cocktails]
  )

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return cocktails
    return fuse.search(debouncedQuery).map((r) => r.item)
  }, [fuse, debouncedQuery, cocktails])

  return { query, setQuery, results }
}
