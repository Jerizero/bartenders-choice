import cocktailsData from '../data/cocktails.json'
import type { Cocktail } from '../types'
import CocktailCard from '../components/CocktailCard'
import { useFavoritesContext } from '../context/FavoritesContext'

const cocktails = cocktailsData as Cocktail[]

export default function Favorites() {
  const { favorites, unavailable, exportFavorites, importFavorites } = useFavoritesContext()

  const favCocktails = cocktails
    .filter((c) => favorites.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleExport = () => {
    const data = exportFavorites()
    navigator.clipboard.writeText(data).then(() => {
      alert('Favorites copied to clipboard! Save this text to restore later.')
    }).catch(() => {
      prompt('Copy this text to save your favorites:', data)
    })
  }

  const handleImport = () => {
    const data = prompt('Paste your exported favorites:')
    if (data) {
      const ok = importFavorites(data)
      if (ok) alert('Favorites restored!')
      else alert('Invalid data — could not restore.')
    }
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center py-4 font-sans">
        Favorites
      </h1>

      {unavailable && (
        <p className="text-center text-sm text-cream-dim bg-charcoal-lighter/50 rounded-lg px-4 py-3 mb-4">
          Favorites unavailable in private browsing.
        </p>
      )}

      {favCocktails.length === 0 ? (
        <p className="text-cream-dim text-center text-sm mt-8">
          No favorites yet. Tap the heart on any cocktail to save it here.
        </p>
      ) : (
        <>
          <p className="text-cream-dim text-center text-xs mb-4 font-sans tracking-wider">
            {favCocktails.length} {favCocktails.length === 1 ? 'favorite' : 'favorites'}
          </p>
          <div>
            {favCocktails.map((cocktail) => (
              <CocktailCard key={cocktail.id} cocktail={cocktail} />
            ))}
          </div>
        </>
      )}

      {favorites.size > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={handleExport} className="text-cream-dim text-xs underline hover:text-cream">
            Export Favorites
          </button>
          <button onClick={handleImport} className="text-cream-dim text-xs underline hover:text-cream">
            Import Favorites
          </button>
        </div>
      )}
      {favorites.size === 0 && (
        <div className="flex justify-center mt-8">
          <button onClick={handleImport} className="text-cream-dim text-xs underline hover:text-cream">
            Import Favorites
          </button>
        </div>
      )}
    </div>
  )
}
