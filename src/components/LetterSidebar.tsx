interface Props {
  letters: string[]
  activeLetter: string
  onLetterClick: (letter: string) => void
}

export default function LetterSidebar({ letters, activeLetter, onLetterClick }: Props) {
  return (
    <nav
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center py-1 px-1"
      aria-label="Alphabetical navigation"
    >
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(letter)}
          className={`text-[10px] font-sans leading-tight px-1.5 py-[1px] rounded-sm transition-colors duration-100 ${
            letter === activeLetter
              ? 'text-gold font-bold'
              : 'text-cream-dim/70 active:text-gold'
          }`}
          aria-label={`Jump to ${letter}`}
        >
          {letter}
        </button>
      ))}
    </nav>
  )
}
