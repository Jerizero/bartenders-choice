import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { guides } from '../data/guides'

const mdModules = import.meta.glob('../content/*.md', { query: '?raw', import: 'default' })

function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3)
    if (end !== -1) return md.slice(end + 3).trim()
  }
  return md
}

// Safe: only renders our own static bundled markdown, not user input
function renderMarkdown(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      const withBold = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      const withBreaks = withBold.replace(/\\n/g, '<br/>')
      return `<p>${withBreaks}</p>`
    })
    .join('')
}

export default function GuideDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)

  const guide = guides.find((g) => g.slug === slug)

  useEffect(() => {
    const loader = mdModules[`../content/${slug}.md`]
    if (loader) {
      (loader() as Promise<string>).then((raw) => {
        setContent(stripFrontmatter(raw))
      })
    }
  }, [slug])

  if (!guide) {
    return (
      <div className="p-8 text-center">
        <p className="text-cream-dim">Guide not found.</p>
        <button onClick={() => navigate('/guides')} className="text-gold mt-4 underline text-sm">
          Back to guides
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-30 bg-charcoal/80 backdrop-blur-sm rounded-full p-2 text-cream hover:text-gold transition-colors"
        aria-label="Go back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {guide.image && (
        <div className="w-full aspect-[4/3] bg-charcoal-light overflow-hidden">
          <img
            src={`/images/guides/${guide.image}`}
            alt={guide.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-5 pt-6">
        <h1 className="text-xl text-gold tracking-widest uppercase text-center font-sans mb-6">
          {guide.title}
        </h1>

        {content === null ? (
          <p className="text-cream-dim text-center text-sm">Loading...</p>
        ) : (
          <div
            className="text-cream text-sm leading-relaxed space-y-4 [&_strong]:text-gold [&_strong]:font-sans [&_strong]:tracking-wider"
            // Safe: renders only our own static bundled markdown files, not user input
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  )
}
