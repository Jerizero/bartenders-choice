import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import cocktailsData from '../data/cocktails.json'
import type { Cocktail } from '../types'
import CocktailCard from '../components/CocktailCard'
import LetterSidebar from '../components/LetterSidebar'
import SearchBar from '../components/SearchBar'
import ShakeButton from '../components/ShakeButton'
import useSearch from '../hooks/useSearch'

const allCocktails = cocktailsData as Cocktail[]
const sorted = [...allCocktails].sort((a, b) => a.name.localeCompare(b.name))

const SPIRIT_FILTERS = ['gin', 'whiskey', 'rum', 'tequila', 'vodka', 'brandy'] as const
const VIBE_FILTERS = ['refreshing', 'boozy', 'sweet', 'sour'] as const

type FilterType = { label: string; key: string; kind: 'spirit' | 'sensation' | 'new' }

const FILTERS: FilterType[] = [
  ...SPIRIT_FILTERS.map((s) => ({ label: s, key: s, kind: 'spirit' as const })),
  { label: 'New', key: 'new', kind: 'new' as const },
  ...VIBE_FILTERS.map((s) => ({ label: s, key: s, kind: 'sensation' as const })),
]

function matchesFilter(cocktail: Cocktail, filter: FilterType): boolean {
  if (filter.kind === 'new') return cocktail.new
  if (filter.kind === 'spirit') return cocktail.alcohol.some((a) => a.includes(filter.key))
  return cocktail.sensation.includes(filter.key)
}

function groupByLetter(items: Cocktail[]): Map<string, Cocktail[]> {
  const groups = new Map<string, Cocktail[]>()
  for (const c of items) {
    const first = c.name[0]?.toUpperCase() || '#'
    const letter = /[A-Z]/.test(first) ? first : '#'
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(c)
  }
  return groups
}

export default function RecipeBook() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = useMemo(() => searchParams.get('q') || '', [])
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (activeFilters.size === 0) return sorted
    return sorted.filter((c) =>
      FILTERS.filter((f) => activeFilters.has(f.key)).every((f) => matchesFilter(c, f))
    )
  }, [activeFilters])

  const { query, setQuery, results } = useSearch(filtered, initialQuery)

  // Clear the ?q= param once search is active so URL stays clean on further typing
  useEffect(() => {
    if (searchParams.has('q')) {
      setSearchParams({}, { replace: true })
    }
  }, [])

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const isSearching = query.trim().length > 0
  const isFiltering = activeFilters.size > 0
  const displayList = isSearching ? results : filtered
  const grouped = groupByLetter(displayList)
  const letters = [...grouped.keys()].sort()

  const [activeLetter, setActiveLetter] = useState(letters[0] || 'A')
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const handleLetterClick = useCallback((letter: string) => {
    const el = sectionRefs.current.get(letter)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveLetter(letter)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const letter = entry.target.getAttribute('data-letter')
            if (letter) setActiveLetter(letter)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    for (const el of sectionRefs.current.values()) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [letters])

  return (
    <div className="relative">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center pt-6 pb-2 font-sans">
        Recipe Book
      </h1>

      <div className="flex justify-center mb-3">
        <ShakeButton />
      </div>

      <SearchBar value={query} onChange={setQuery} resultCount={results.length} />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
        {FILTERS.map((f) => {
          const active = activeFilters.has(f.key)
          return (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`flex-shrink-0 text-[11px] font-sans tracking-wider uppercase px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-gold/20 border-gold text-gold'
                  : 'border-charcoal-lighter text-cream-dim hover:border-cream-dim'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {!isSearching && (
        <p className="text-cream-dim text-center text-xs mb-2 font-sans tracking-wider">
          {isFiltering ? `${displayList.length} of ${allCocktails.length}` : allCocktails.length} cocktails
        </p>
      )}

      <div className="pr-6">
        {letters.length === 0 && (isSearching || isFiltering) && (
          <p className="text-cream-dim text-center text-sm py-12">No cocktails found.</p>
        )}
        {letters.map((letter) => (
          <div
            key={letter}
            data-letter={letter}
            ref={(el) => {
              if (el) sectionRefs.current.set(letter, el)
            }}
          >
            <div className="sticky top-0 z-10 bg-charcoal/95 backdrop-blur-sm px-4 py-2 border-b border-charcoal-lighter/30">
              <span className="text-gold font-sans text-sm tracking-widest uppercase">{letter}</span>
            </div>
            {grouped.get(letter)!.map((cocktail) => (
              <CocktailCard key={cocktail.id} cocktail={cocktail} />
            ))}
          </div>
        ))}
      </div>

      {!isSearching && !isFiltering && (
        <LetterSidebar
          letters={letters}
          activeLetter={activeLetter}
          onLetterClick={handleLetterClick}
        />
      )}
    </div>
  )
}
