import { useRef, useState, useCallback, useEffect } from 'react'
import cocktailsData from '../data/cocktails.json'
import type { Cocktail } from '../types'
import CocktailCard from '../components/CocktailCard'
import LetterSidebar from '../components/LetterSidebar'

const cocktails = cocktailsData as Cocktail[]

// Group cocktails A-Z by first letter of name
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

const sorted = [...cocktails].sort((a, b) => a.name.localeCompare(b.name))
const grouped = groupByLetter(sorted)
const letters = [...grouped.keys()].sort()

export default function RecipeBook() {
  const [activeLetter, setActiveLetter] = useState(letters[0] || 'A')
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleLetterClick = useCallback((letter: string) => {
    const el = sectionRefs.current.get(letter)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveLetter(letter)
    }
  }, [])

  // Track which letter section is visible during scroll
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
  }, [])

  return (
    <div ref={scrollContainerRef} className="relative">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center py-6 font-sans">
        Recipe Book
      </h1>
      <p className="text-cream-dim text-center text-xs mb-4 font-sans tracking-wider">
        {cocktails.length} cocktails
      </p>

      <div className="pr-6">
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

      <LetterSidebar
        letters={letters}
        activeLetter={activeLetter}
        onLetterClick={handleLetterClick}
      />
    </div>
  )
}
