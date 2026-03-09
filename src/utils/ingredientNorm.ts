// Normalizes raw ingredient names from the database into clean,
// matchable ingredient names for the My Bar feature.

// Quantity prefix with unit (e.g., "0.25 oz ", "2 dashes ", "barspoon ")
const QTY_PREFIX =
  /^(?:\d+(?:[./]\d+)?\s*(?:oz\.?|dashes?|barspoons?|slices?|grinds?\s+of|drops?|splash|pinch)\s+)/i

// Standalone prefix words without a number
const WORD_PREFIX = /^(?:dash|half|pinch|bottle\s+of|barspoon)\s+/i

const LEADING_NUM = /^\d+(?:[./]\d+)?\s+/

// Trailing form words (wedge, slices, slice, cubes, cube, pieces)
const TRAILING_FORM = /\s+(?:wedge|wedges|slices?|cubes?|pieces?|disc)$/i

const ALIASES: Record<string, string> = {
  'angosutra bitters': 'angostura bitters',
  'angosutra': 'angostura bitters',
  'angostura': 'angostura bitters',
  'ango': 'angostura bitters',
  'simple': 'simple syrup',
  'peychauds bitters': "peychaud's bitters",
  'peychaud bitters': "peychaud's bitters",
  'peychauds': "peychaud's bitters",
  'peychaud': "peychaud's bitters",
  'cream': 'whipped cream',
  'white sugar': 'sugar',
  'strawberries': 'strawberry',
  'limes': 'lime',
  'lemons': 'lemon',
  'oranges': 'orange',
  'cucumbers': 'cucumber',
  'blackberries': 'blackberry',
  'raspberries': 'raspberry',
  'berries': 'berry',
  'grapes': 'grape',
  // Accent normalization
  'cachaça': 'cachaca',
  'curaçao': 'curacao',
  'café lolita': 'cafe lolita',
  'crème de cacao': 'creme de cacao',
  'crème de cassis': 'creme de cassis',
  'crème de menthe': 'creme de menthe',
  'crème de violette/yvette': 'creme de violette',
  // Brand variants
  "gosling's": 'goslings',
  "gosling\u2019s": 'goslings',
  "gosling's rum": 'goslings',
  "gosling\u2019s rum": 'goslings',
  'marschino': 'maraschino',
  'maraschino liqueur': 'maraschino',
  'peach liquer': 'peach liqueur',
  'green chatreuse': 'green chartreuse',
  // Double-space typo
  'pear  brandy': 'pear brandy',
  // Combined bitters
  'orange and angostura bitters': 'orange bitters',
  'angostura amaro': 'angostura bitters',
  // Juice normalization — "lime juice" and "lime" are the same ingredient
  'lime juice': 'lime',
  'lime chunks': 'lime',
  'lemon/lime': 'lemon/lime juice',
  'orange juice': 'orange',
  'pineapple juice': 'pineapple',
  'watermelon juice': 'watermelon',
  'white grapefruit': 'grapefruit',
  'granny smith apple juice': 'apple cider',
  'pear juice': 'pear',
  'juice': 'lemon/lime juice',
  // Flower water variants
  'orange flower': 'orange flower water',
  'rose water': 'rosewater',
  // Typo fixes
  'amontadillo sherry': 'amontillado sherry',
  'cherry herring': 'cherry heering',
  // Same product, different names
  'allspice liqueur': 'allspice dram',
  'averna amaro': 'averna',
  'velvet falernum': 'falernum',
  'coco lopez': 'coconut cream',
  'amaro sfumato rabarbaro': 'sfumato amaro',
  'lofi gentian amaro': 'lo-fi amaro',
  'cholula hot sauce': 'cholula',
  'lolita': 'cafe lolita',
  'fernet': 'fernet branca',
  // Blackstrap rum spelling variants
  'black strap rum': 'blackstrap rum',
  'back strap rum': 'blackstrap rum',
  'cruzan black strap rum': 'blackstrap rum',
  // Bruised cucumber is just cucumber
  'bruised cucumber': 'cucumber',
  // Whiskey spelling variants
  'japanese whiskey': 'japanese whisky',
  'irish': 'irish whiskey',
}

function cleanOne(raw: string): string {
  let s = raw.trim().toLowerCase()
  if (!s || s === '- -') return ''

  // Normalize smart quotes to straight quotes
  s = s.replace(/[\u2018\u2019]/g, "'")

  // Strip all parentheticals (floated, squeezed & discarded, etc.)
  s = s.replace(/\s*\(.*?\)/g, '').trim()

  // Strip trailing descriptors
  s = s
    .replace(/,?\s*floated$/i, '')
    .replace(/,?\s*muddled$/i, '')
    .replace(/,?\s*cut into.*$/i, '')
    .replace(/,?\s*sweetened with.*$/i, '')
    .replace(/\s*\boptional$/i, '')
    .trim()

  // Strip quantity prefix  (e.g., "0.25 oz ", "2 dashes ", "barspoon ")
  s = s.replace(QTY_PREFIX, '').trim()

  // Strip leading bare numbers (e.g., "2 orange slices" → "orange slices")
  s = s.replace(LEADING_NUM, '').trim()

  // Strip standalone word prefixes (e.g., "dash absinthe" → "absinthe")
  s = s.replace(WORD_PREFIX, '').trim()

  // Strip leading "fresh" (e.g. "fresh cucumber slices" → "cucumber slices")
  s = s.replace(/^fresh\s+/i, '').trim()

  // Strip "liberal amount of"
  s = s.replace(/^liberal\s+amount\s+of\s+/i, '').trim()

  // Strip "hand whipped cream float..." → "whipped cream"
  if (s.startsWith('hand whipped')) {
    return 'whipped cream'
  }

  // Handle "X or Y" patterns (e.g., "underberg or 0.25 oz amargo vallet")
  if (s.includes(' or ')) {
    s = s.split(' or ')[0].trim()
  }

  // Strip trailing form words (wedge, slices, etc.)
  s = s.replace(TRAILING_FORM, '').trim()

  // Fix aliases / typos / normalize
  if (ALIASES[s]) s = ALIASES[s]

  return s
}

// Brand names containing "&" that should NOT be split
const AMPERSAND_BRANDS = new Set(['smith & cross'])

/**
 * Takes a raw ingredient name (which may be compound/dirty) and returns
 * an array of clean, normalized ingredient names.
 */
export function normalizeIngredientName(raw: string): string[] {
  // Strip parentheticals from the raw string BEFORE splitting
  const stripped = raw.replace(/\s*\(.*?\)/g, '')

  // Split on commas first
  const commaParts = stripped.split(',').map((s) => s.trim())
  const allParts: string[] = []

  for (const part of commaParts) {
    const lower = part.toLowerCase().trim()
    // Only split on "&" if it's not a known brand name
    if (lower.includes('&') && !AMPERSAND_BRANDS.has(lower.trim())) {
      allParts.push(...part.split('&').map((s) => s.trim()))
    } else {
      allParts.push(part)
    }
  }

  const results: string[] = []
  for (const part of allParts) {
    const cleaned = cleanOne(part)
    if (cleaned && cleaned !== '- -') {
      results.push(cleaned)
    }
  }

  return [...new Set(results)]
}

/**
 * Builds a deduplicated, sorted list of all clean ingredient names
 * from the cocktail data.
 */
export function buildIngredientList(
  cocktails: { ingredients: { name: string }[] }[]
): string[] {
  const names = new Set<string>()
  for (const c of cocktails) {
    for (const ing of c.ingredients) {
      for (const n of normalizeIngredientName(ing.name)) {
        names.add(n)
      }
    }
  }
  return [...names].sort()
}

/**
 * Returns the normalized ingredient keys for a cocktail.
 */
export function getCocktailIngredientKeys(
  ingredients: { name: string }[]
): string[] {
  const keys: string[] = []
  for (const ing of ingredients) {
    for (const n of normalizeIngredientName(ing.name)) {
      keys.push(n)
    }
  }
  return keys
}
