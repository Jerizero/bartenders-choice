import { Link } from 'react-router-dom'
import { guides } from '../data/guides'

export default function Guides() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center py-4 font-sans">
        Guides
      </h1>
      <div className="space-y-3 max-w-lg mx-auto">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guides/${guide.slug}`}
            className="flex items-center gap-4 p-3 rounded-lg border border-charcoal-lighter/50 active:bg-charcoal-lighter/30 transition-colors"
          >
            {guide.image ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-charcoal-light">
                <img
                  src={`/images/guides/${guide.image}`}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-charcoal-light flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gold-dim">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            <span className="text-cream text-sm font-sans tracking-wide">{guide.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
