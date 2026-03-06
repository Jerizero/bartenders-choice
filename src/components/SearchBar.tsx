interface Props {
  value: string
  onChange: (value: string) => void
  resultCount: number
}

export default function SearchBar({ value, onChange, resultCount }: Props) {
  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-dim"
        >
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search cocktails, ingredients, bars..."
          className="w-full bg-charcoal-light border border-charcoal-lighter rounded-lg pl-10 pr-10 py-2.5 text-sm text-cream placeholder:text-cream-dim/50 focus:outline-none focus:border-gold/50 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-dim hover:text-cream"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {value && (
        <p className="text-cream-dim text-xs mt-2 text-center font-sans tracking-wider">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </p>
      )}
    </div>
  )
}
