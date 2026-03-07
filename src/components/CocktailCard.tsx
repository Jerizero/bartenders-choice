import { Link } from 'react-router-dom'
import type { Cocktail } from '../types'
import imageMap from '../data/image-map.json'

const imgMap = imageMap as Record<string, string>

const PLACEHOLDER = (
  <svg viewBox="0 0 256 256" className="w-full h-full" aria-hidden>
    <rect width="256" height="256" fill="#2a2a2a" />
    <path d="M128 60 L140 100 L160 100 L145 120 L152 160 L128 140 L104 160 L111 120 L96 100 L116 100 Z" fill="#c9a84c" opacity="0.3" />
  </svg>
)

export default function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  const thumbFile = imgMap[cocktail.imageId]
  const thumbSrc = thumbFile ? `/images/thumbs/${thumbFile}` : null

  return (
    <Link
      to={`/cocktail/${cocktail.slug}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-charcoal-lighter/50 active:bg-charcoal-lighter/30 transition-colors duration-150"
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
        <div className="flex items-center gap-2">
          <p className="text-cream text-sm font-sans tracking-wide truncate">{cocktail.name}</p>
          {cocktail.new && (
            <span className="flex-shrink-0 text-[9px] font-sans tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-gold/20 text-gold">
              New
            </span>
          )}
        </div>
        <p className="text-cream-dim text-xs truncate">{cocktail.ingredientsText}</p>
      </div>
    </Link>
  )
}
