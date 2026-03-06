import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import cocktailsData from '../data/cocktails.json'
import imageMap from '../data/image-map.json'
import type { Cocktail } from '../types'

const cocktails = cocktailsData as Cocktail[]
const imgMap = imageMap as Record<string, string>

const PLACEHOLDER_SVG = (
  <svg viewBox="0 0 820 820" className="w-full h-full" aria-hidden>
    <rect width="820" height="820" fill="#2a2a2a" />
    <path d="M410 200 L440 310 L520 310 L455 370 L480 480 L410 420 L340 480 L365 370 L300 310 L380 310 Z" fill="#c9a84c" opacity="0.25" />
  </svg>
)

export default function CocktailDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [useMetric, setUseMetric] = useState(false)
  const [imgError, setImgError] = useState(false)

  const cocktail = cocktails.find((c) => c.slug === slug)

  if (!cocktail) {
    return (
      <div className="p-8 text-center">
        <p className="text-cream-dim">Cocktail not found.</p>
        <button onClick={() => navigate('/recipes')} className="text-gold mt-4 underline text-sm">
          Back to recipes
        </button>
      </div>
    )
  }

  const imgFile = imgMap[cocktail.imageId]
  const imgSrc = imgFile ? `/images/cocktails/${imgFile}` : null

  return (
    <div className="pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-30 bg-charcoal/80 backdrop-blur-sm rounded-full p-2 text-cream hover:text-gold transition-colors"
        aria-label="Go back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Hero image */}
      <div className="w-full aspect-square bg-charcoal-light overflow-hidden">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={cocktail.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          PLACEHOLDER_SVG
        )}
      </div>

      {/* Content */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-charcoal rounded-t-2xl pt-6 px-1">
          {/* Name */}
          <h1 className="text-2xl text-gold tracking-widest uppercase text-center font-sans">
            {cocktail.name}
          </h1>

          {/* Bar / Bartender */}
          {(cocktail.bartender || cocktail.bar) && (
            <p className="text-cream-dim text-xs text-center mt-2 tracking-wider font-sans">
              {cocktail.bartender && <span>{cocktail.bartender}</span>}
              {cocktail.bartender && cocktail.bar && <span> &mdash; </span>}
              {cocktail.bar && <span>{cocktail.bar}</span>}
            </p>
          )}

          {/* Story */}
          {cocktail.story && (
            <p className="text-cream-dim text-sm leading-relaxed mt-5 italic">
              {cocktail.story}
            </p>
          )}

          {/* Ingredients */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gold text-xs tracking-[0.2em] uppercase font-sans">Ingredients</h2>
              <button
                onClick={() => setUseMetric(!useMetric)}
                className="text-[10px] tracking-wider uppercase font-sans px-3 py-1 rounded-full border border-charcoal-lighter text-cream-dim hover:text-gold hover:border-gold transition-colors"
              >
                {useMetric ? 'ML' : 'OZ'}
              </button>
            </div>
            <ul className="space-y-2">
              {cocktail.ingredients.map((ing, i) => {
                const qty = useMetric
                  ? ing.qtyMetric
                    ? `${ing.qtyMetric} ml`
                    : ing.qty
                  : ing.qty
                    ? isNaN(Number(ing.qty))
                      ? ing.qty
                      : `${ing.qty} oz`
                    : ''
                return (
                  <li key={i} className="flex justify-between items-baseline border-b border-charcoal-lighter/30 pb-2">
                    <span className="text-cream text-sm capitalize">{ing.name}</span>
                    <span className="text-cream-dim text-sm tabular-nums ml-4 whitespace-nowrap">{qty}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Method */}
          {cocktail.method && (
            <div className="mt-8">
              <h2 className="text-gold text-xs tracking-[0.2em] uppercase font-sans mb-3">Method</h2>
              <p className="text-cream text-sm leading-relaxed">{cocktail.method}</p>
            </div>
          )}

          {/* Rating */}
          {cocktail.rating > 0 && (
            <div className="mt-8 flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  className={`w-4 h-4 ${
                    i < Math.floor(cocktail.rating)
                      ? 'text-gold'
                      : i < cocktail.rating
                        ? 'text-gold-dim'
                        : 'text-charcoal-lighter'
                  }`}
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-cream-dim text-xs ml-2 tabular-nums">{cocktail.rating}</span>
            </div>
          )}

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {cocktail.alcohol.map((tag) => (
              <span key={tag} className="text-[10px] tracking-wider uppercase font-sans px-2 py-1 rounded-full bg-charcoal-lighter/50 text-cream-dim">
                {tag}
              </span>
            ))}
            {cocktail.sensation.map((tag) => (
              <span key={tag} className="text-[10px] tracking-wider uppercase font-sans px-2 py-1 rounded-full bg-charcoal-lighter/50 text-cream-dim">
                {tag}
              </span>
            ))}
            {cocktail.style.map((tag) => (
              <span key={tag} className="text-[10px] tracking-wider uppercase font-sans px-2 py-1 rounded-full bg-charcoal-lighter/50 text-cream-dim">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
