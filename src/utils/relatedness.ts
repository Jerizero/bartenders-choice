import type { Cocktail } from '../types'

function countShared(a: string[], b: string[]): number {
  let count = 0
  for (const tag of a) {
    if (b.includes(tag)) count++
  }
  return count
}

export function getRelated(cocktail: Cocktail, all: Cocktail[], limit = 6): Cocktail[] {
  const scores: { cocktail: Cocktail; score: number }[] = []

  for (const other of all) {
    if (other.id === cocktail.id) continue

    let score = 0
    score += countShared(cocktail.alcohol, other.alcohol) * 3
    score += countShared(cocktail.sensation, other.sensation) * 2
    score += countShared(cocktail.extras, other.extras) * 2
    score += countShared(cocktail.style, other.style) * 1
    if (cocktail.bartender && cocktail.bartender === other.bartender) score += 2
    if (cocktail.bar && cocktail.bar === other.bar) score += 1

    if (score > 0) scores.push({ cocktail: other, score })
  }

  scores.sort((a, b) => b.score - a.score)
  return scores.slice(0, limit).map((s) => s.cocktail)
}
