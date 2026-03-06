import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import cocktailsData from '../data/cocktails.json'
import type { Cocktail } from '../types'
import useShake from '../hooks/useShake'

const cocktails = cocktailsData as Cocktail[]

export default function ShakeButton() {
  const navigate = useNavigate()

  const goToRandom = useCallback(() => {
    const random = cocktails[Math.floor(Math.random() * cocktails.length)]
    navigate(`/cocktail/${random.slug}`)
  }, [navigate])

  const { permissionGranted, supported, requestPermission } = useShake(goToRandom)

  const handleClick = async () => {
    if (!permissionGranted && supported) {
      const granted = await requestPermission()
      if (!granted) {
        // Permission denied or not supported — just go to random
        goToRandom()
      }
      return
    }
    goToRandom()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-gold hover:bg-gold/10 active:bg-gold/20 transition-colors text-sm font-sans tracking-wider uppercase"
      aria-label="Random cocktail"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
      </svg>
      {permissionGranted && supported ? 'Shake or Tap' : 'Random'}
    </button>
  )
}
