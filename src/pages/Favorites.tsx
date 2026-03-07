import cocktailsData from '../data/cocktails.json'
import type { Cocktail } from '../types'
import CocktailCard from '../components/CocktailCard'
import { useFavoritesContext } from '../context/FavoritesContext'
import { useUserDataContext } from '../context/UserDataContext'
import { useMyBarContext } from '../context/MyBarContext'

const cocktails = cocktailsData as Cocktail[]

const DATA_VERSION = 1

export default function Favorites() {
  const { favorites, unavailable, importFavorites } = useFavoritesContext()
  const { exportData: exportUserData, importData: importUserData } = useUserDataContext()
  const { exportBar, importBar } = useMyBarContext()

  const favCocktails = cocktails
    .filter((c) => favorites.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleExportAll = () => {
    const bundle = JSON.stringify({
      version: DATA_VERSION,
      favorites: [...favorites],
      userData: exportUserData(),
      myBar: exportBar(),
    })
    navigator.clipboard.writeText(bundle).then(() => {
      alert('All data copied to clipboard! Save this text to restore later.')
    }).catch(() => {
      prompt('Copy this text to save your data:', bundle)
    })
  }

  const handleImportAll = () => {
    const raw = prompt('Paste your exported data:')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      // Support both old format (plain array of favorite IDs) and new bundle
      if (Array.isArray(parsed)) {
        importFavorites(raw)
        alert('Favorites restored!')
        return
      }
      if (!parsed.version || typeof parsed !== 'object') {
        alert('Invalid data — could not restore.')
        return
      }
      if (parsed.favorites) importFavorites(JSON.stringify(parsed.favorites))
      if (parsed.userData) importUserData(parsed.userData)
      if (parsed.myBar) importBar(parsed.myBar)
      alert('All data restored!')
    } catch {
      alert('Invalid data — could not restore.')
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

      <div className="flex justify-center gap-4 mt-8">
        {favorites.size > 0 && (
          <button onClick={handleExportAll} className="text-cream-dim text-xs underline hover:text-cream">
            Export All Data
          </button>
        )}
        <button onClick={handleImportAll} className="text-cream-dim text-xs underline hover:text-cream">
          Import Data
        </button>
      </div>
    </div>
  )
}
