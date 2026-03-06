import { createContext, useContext, type ReactNode } from 'react'
import useFavorites from '../hooks/useFavorites'

type FavoritesCtx = ReturnType<typeof useFavorites>

const FavoritesContext = createContext<FavoritesCtx | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favs = useFavorites()
  return <FavoritesContext.Provider value={favs}>{children}</FavoritesContext.Provider>
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavoritesContext must be used within FavoritesProvider')
  return ctx
}
