import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import { MyBarProvider } from './context/MyBarContext'
import { UserDataProvider } from './context/UserDataContext'
import RecipeBook from './pages/RecipeBook'
import CocktailDetail from './pages/CocktailDetail'
import IFeelLike from './pages/IFeelLike'
import Favorites from './pages/Favorites'
import MyBar from './pages/MyBar'
import Guides from './pages/Guides'
import GuideDetail from './pages/GuideDetail'

function NavIcon({ d, label }: { d: string; label: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-label={label}>
      <path d={d} />
    </svg>
  )
}

const tabs = [
  { path: '/recipes', label: 'Recipes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { path: '/i-feel-like', label: 'I Feel Like', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
  { path: '/favorites', label: 'Favorites', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  { path: '/my-bar', label: 'My Bar', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' },
  { path: '/guides', label: 'Guides', icon: 'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342' },
]

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
      <MyBarProvider>
      <UserDataProvider>
      <div className="flex flex-col min-h-dvh">
        <main className="flex-1 pb-20">
          <Routes>
            <Route path="/" element={<Navigate to="/i-feel-like" replace />} />
            <Route path="/recipes" element={<RecipeBook />} />
            <Route path="/cocktail/:slug" element={<CocktailDetail />} />
            <Route path="/i-feel-like" element={<IFeelLike />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-bar" element={<MyBar />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/:slug" element={<GuideDetail />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-charcoal-light/95 backdrop-blur-sm border-t border-charcoal-lighter z-50">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors duration-200 ${
                    isActive ? 'text-gold' : 'text-cream-dim hover:text-cream'
                  }`
                }
              >
                <NavIcon d={tab.icon} label={tab.label} />
                <span className="tracking-wider uppercase text-[10px] font-sans">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </UserDataProvider>
    </MyBarProvider>
    </FavoritesProvider>
    </BrowserRouter>
  )
}
