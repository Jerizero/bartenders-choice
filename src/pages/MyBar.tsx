import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import cocktailsData from '../data/cocktails.json'
import imageMap from '../data/image-map.json'
import type { Cocktail } from '../types'
import { useMyBarContext } from '../context/MyBarContext'
import { buildIngredientList, getCocktailIngredientKeys } from '../utils/ingredientNorm'
import { categorizeIngredients, type Category } from '../utils/ingredientCategories'

const allCocktails = cocktailsData as Cocktail[]
const imgMap = imageMap as Record<string, string>

const allIngredientNames = buildIngredientList(allCocktails)
const categorized = categorizeIngredients(allIngredientNames)

type Tab = 'ingredients' | 'canMake' | 'nextIngredient'

const PLACEHOLDER = (
  <svg viewBox="0 0 256 256" className="w-full h-full" aria-hidden>
    <rect width="256" height="256" fill="#2a2a2a" />
    <path
      d="M128 60 L140 100 L160 100 L145 120 L152 160 L128 140 L104 160 L111 120 L96 100 L116 100 Z"
      fill="#c9a84c"
      opacity="0.3"
    />
  </svg>
)

function MiniCard({ cocktail, dimmed, missing }: { cocktail: Cocktail; dimmed?: boolean; missing?: string }) {
  const thumbFile = imgMap[cocktail.imageId]
  const thumbSrc = thumbFile ? `/images/thumbs/${thumbFile}` : null

  return (
    <Link
      to={`/cocktail/${cocktail.slug}`}
      className={`flex items-center gap-3 px-4 py-3 border-b border-charcoal-lighter/50 transition-colors duration-150 ${
        dimmed ? 'opacity-50' : 'active:bg-charcoal-lighter/30'
      }`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-charcoal-light">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={cocktail.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={thumbSrc ? 'hidden' : ''}>{PLACEHOLDER}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-cream text-sm font-sans tracking-wide truncate">{cocktail.name}</p>
        {missing ? (
          <p className="text-gold-dim text-xs truncate">Need: {missing}</p>
        ) : (
          <p className="text-cream-dim text-xs truncate">{cocktail.ingredientsText}</p>
        )}
      </div>
    </Link>
  )
}

function IngredientsTab() {
  const { has, toggle, count, clear } = useMyBarContext()
  const [search, setSearch] = useState('')

  const displayCategories = useMemo((): Category[] => {
    if (!search.trim()) return categorized
    const q = search.toLowerCase()
    return categorized
      .map((cat) => ({
        ...cat,
        ingredients: cat.ingredients.filter((n) => n.includes(q)),
        subcategories: cat.subcategories
          ?.map((sub) => ({
            ...sub,
            ingredients: sub.ingredients.filter((n) => n.includes(q)),
          }))
          .filter((sub) => sub.ingredients.length > 0),
      }))
      .filter((cat) => cat.ingredients.length > 0)
  }, [search])

  return (
    <div className="pb-24">
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-charcoal-light border border-charcoal-lighter rounded-lg pl-9 pr-3 py-2 text-cream text-sm placeholder:text-cream-dim/60 focus:outline-none focus:border-gold/50"
          />
        </div>
        {count > 0 && (
          <button
            onClick={clear}
            className="text-xs text-cream-dim hover:text-cream px-2 py-1 rounded border border-charcoal-lighter/50"
          >
            Clear ({count})
          </button>
        )}
      </div>

      <p className="text-cream-dim text-xs px-4 pb-3">
        {count} in your bar &middot; {allIngredientNames.length} total
      </p>

      {displayCategories.map((cat) => (
        <div key={cat.label} className="mb-5">
          {/* Category header */}
          <div className="px-4 py-2 flex items-center gap-2">
            <span className="text-base">{cat.emoji}</span>
            <span className="text-gold font-sans text-xs tracking-widest uppercase">{cat.label}</span>
            <div className="flex-1 h-px bg-charcoal-lighter/40" />
          </div>

          {cat.subcategories && cat.subcategories.length > 0 ? (
            /* Render sub-shelves (e.g. Spirits > Gin, Rum, etc.) */
            cat.subcategories.map((sub) => (
              <div key={sub.label} className="mb-3">
                <div className="px-6 pt-1 pb-1.5">
                  <span className="text-cream-dim font-sans text-[10px] tracking-widest uppercase">{sub.label}</span>
                </div>
                <div className="px-6">
                  <div className="flex flex-wrap gap-2">
                    {sub.ingredients.map((name) => {
                      const selected = has(name)
                      return (
                        <button
                          key={name}
                          onClick={() => toggle(name)}
                          className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all duration-200 border ${
                            selected
                              ? 'bg-gold/20 border-gold/60 text-gold shadow-[0_0_8px_rgba(201,168,76,0.15)]'
                              : 'bg-charcoal-light/60 border-charcoal-lighter/40 text-cream-dim hover:border-charcoal-lighter hover:text-cream'
                          }`}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Flat shelf (no subcategories) */
            <div className="px-4">
              <div className="flex flex-wrap gap-2">
                {cat.ingredients.map((name) => {
                  const selected = has(name)
                  return (
                    <button
                      key={name}
                      onClick={() => toggle(name)}
                      className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all duration-200 border ${
                        selected
                          ? 'bg-gold/20 border-gold/60 text-gold shadow-[0_0_8px_rgba(201,168,76,0.15)]'
                          : 'bg-charcoal-light/60 border-charcoal-lighter/40 text-cream-dim hover:border-charcoal-lighter hover:text-cream'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Shelf edge */}
          <div className="mt-3 mx-4 h-px bg-gradient-to-r from-transparent via-charcoal-lighter/30 to-transparent" />
        </div>
      ))}

      {displayCategories.length === 0 && (
        <p className="text-cream-dim text-center text-sm py-8">No ingredients match &ldquo;{search}&rdquo;</p>
      )}
    </div>
  )
}

function CanMakeTab() {
  const { has, count } = useMyBarContext()

  const { canMake, almostMake } = useMemo(() => {
    if (count === 0) return { canMake: [], almostMake: [] }

    const can: Cocktail[] = []
    const almost: { cocktail: Cocktail; missing: string }[] = []

    for (const c of allCocktails) {
      const keys = getCocktailIngredientKeys(c.ingredients)
      if (keys.length === 0) continue

      const missingList = keys.filter((k) => !has(k))

      if (missingList.length === 0) {
        can.push(c)
      } else if (missingList.length === 1) {
        almost.push({ cocktail: c, missing: missingList[0] })
      }
    }

    can.sort((a, b) => a.name.localeCompare(b.name))
    almost.sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name))

    return { canMake: can, almostMake: almost }
  }, [has, count])

  if (count === 0) {
    return (
      <div className="text-center py-16 px-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-16 h-16 mx-auto text-charcoal-lighter mb-4">
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-cream-dim text-sm">Add ingredients to your bar to see what you can make.</p>
      </div>
    )
  }

  return (
    <div>
      {canMake.length > 0 && (
        <div>
          <div className="sticky top-0 z-10 bg-charcoal/95 backdrop-blur-sm px-4 py-2 border-b border-charcoal-lighter/30">
            <span className="text-gold font-sans text-sm tracking-widest uppercase">
              Can Make ({canMake.length})
            </span>
          </div>
          {canMake.map((c) => (
            <MiniCard key={c.id} cocktail={c} />
          ))}
        </div>
      )}

      {almostMake.length > 0 && (
        <div>
          <div className="sticky top-0 z-10 bg-charcoal/95 backdrop-blur-sm px-4 py-2 border-b border-charcoal-lighter/30">
            <span className="text-gold-dim font-sans text-sm tracking-widest uppercase">
              1 Away ({almostMake.length})
            </span>
          </div>
          {almostMake.map(({ cocktail, missing }) => (
            <MiniCard key={cocktail.id} cocktail={cocktail} dimmed missing={missing} />
          ))}
        </div>
      )}

      {canMake.length === 0 && almostMake.length === 0 && (
        <div className="text-center py-16 px-6">
          <p className="text-cream-dim text-sm">No cocktails match your ingredients yet. Try adding more.</p>
        </div>
      )}
    </div>
  )
}

function NextIngredientTab() {
  const { has, toggle, count } = useMyBarContext()

  const recommendations = useMemo(() => {
    if (count === 0) return []

    // Count how many additional cocktails each missing ingredient would unlock
    const unlockCounts = new Map<string, { unlocks: number; almostNames: string[] }>()

    for (const c of allCocktails) {
      const keys = getCocktailIngredientKeys(c.ingredients)
      if (keys.length === 0) continue

      const missingList = keys.filter((k) => !has(k))

      // Only consider cocktails where we're 1 ingredient away
      if (missingList.length === 1) {
        const missing = missingList[0]
        const entry = unlockCounts.get(missing) || { unlocks: 0, almostNames: [] }
        entry.unlocks++
        if (entry.almostNames.length < 5) entry.almostNames.push(c.name)
        unlockCounts.set(missing, entry)
      }
    }

    return [...unlockCounts.entries()]
      .map(([ingredient, data]) => ({ ingredient, ...data }))
      .sort((a, b) => b.unlocks - a.unlocks)
      .slice(0, 20)
  }, [has, count])

  if (count === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-cream-dim text-sm">Add ingredients to your bar first, then come here for shopping advice.</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-cream-dim text-sm">No single ingredient would unlock new cocktails. Try adding more base spirits.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-3 pb-24">
      <p className="text-cream-dim text-xs mb-4">
        Buy these to unlock the most new cocktails with your current bar.
      </p>

      {recommendations.map((rec) => {
        const added = has(rec.ingredient)
        return (
          <button
            key={rec.ingredient}
            onClick={() => toggle(rec.ingredient)}
            className={`mb-3 p-3 rounded-lg border w-full text-left transition-all duration-200 cursor-pointer ${
              added
                ? 'border-gold/60 bg-gold/10'
                : 'border-charcoal-lighter/50 bg-charcoal-light/50 hover:border-gold/40 hover:bg-charcoal-light active:bg-charcoal-lighter/30 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 border ${
                  added
                    ? 'bg-gold/20 border-gold/60 text-gold'
                    : 'border-charcoal-lighter/60 text-cream-dim'
                }`}>
                  {added ? '✓' : '+'}
                </span>
                <span className={`text-sm font-sans tracking-wide capitalize ${added ? 'text-gold' : 'text-cream'}`}>
                  {rec.ingredient}
                </span>
              </div>
              {added ? (
                <span className="text-gold text-xs font-sans tracking-wider">Added</span>
              ) : (
                <span className="text-gold text-xs font-sans tracking-wider">
                  +{rec.unlocks} cocktail{rec.unlocks !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-cream-dim text-xs truncate">
              {rec.almostNames.join(', ')}
              {rec.unlocks > rec.almostNames.length ? `, +${rec.unlocks - rec.almostNames.length} more` : ''}
            </p>
          </button>
        )
      })}
    </div>
  )
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'canMake', label: 'Can Make' },
  { key: 'nextIngredient', label: 'Next Ingredient' },
]

export default function MyBar() {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients')
  const { count } = useMyBarContext()

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center pt-6 pb-2 font-sans">
        My Bar
      </h1>

      {count > 0 && (
        <p className="text-cream-dim text-center text-xs mb-2 font-sans tracking-wider">
          {count} ingredient{count !== 1 ? 's' : ''} in your bar
        </p>
      )}

      <div className="sticky top-0 z-20 bg-charcoal flex border-b border-charcoal-lighter/50 mb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs font-sans tracking-wider uppercase text-center transition-colors ${
              activeTab === tab.key
                ? 'text-gold border-b-2 border-gold'
                : 'text-cream-dim hover:text-cream'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'ingredients' && <IngredientsTab />}
      {activeTab === 'canMake' && <CanMakeTab />}
      {activeTab === 'nextIngredient' && <NextIngredientTab />}
    </div>
  )
}
