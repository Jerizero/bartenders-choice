// Categorizes normalized ingredient names into bar shelf groups

export type SubCategory = {
  label: string
  ingredients: string[]
}

export type Category = {
  label: string
  emoji: string
  ingredients: string[]
  subcategories?: SubCategory[]
}

// Word-boundary matching to avoid "gin" matching "ginger"
function matchesAny(name: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    if (name === kw) return true
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?:^|\\s|[^a-z])${escaped}(?:$|\\s|[^a-z])`, 'i').test(name)
  })
}

// --- Spirit sub-categories ---
const GIN_KW = ['gin', 'genever', 'old tom gin', 'navy strength gin']
const VODKA_KW = ['vodka']
const WHISKEY_KW = [
  'whiskey', 'whisky', 'rye', 'bourbon', 'scotch', 'irish whiskey', 'irish',
  'highland scotch', 'islay scotch', 'japanese whiskey', 'japanese whisky',
]
const RUM_KW = [
  'rum', 'agricole', 'rhum', 'smith & cross', 'goslings', 'appletons',
  'cruzan', 'back strap', 'black strap', 'blackstrap', 'pot still',
  'overproof', 'gold rhum',
]
const TEQUILA_KW = ['tequila', 'mezcal', 'anejo', 'blanco', 'reposado']
const BRANDY_KW = [
  'brandy', 'cognac', 'calvados', 'applejack', 'pisco', 'pear brandy',
  'apricot brandy', 'spanish brandy',
]
const OTHER_SPIRIT_KW = ['aquavit', 'aguardiente', 'cachaca', 'cachaça']

// --- Other categories ---
const LIQUEUR_KW = [
  'liqueur', 'amaretto', 'campari', 'aperol', 'chartreuse', 'cointreau',
  'curacao', 'curaçao', 'maraschino', 'benedictine', 'drambuie', 'galliano',
  'suze', 'pimms', 'cassis', 'falernum', 'velvet falernum', 'allspice dram',
  'allspice liqueur', 'cherry heering', 'cherry herring', 'cafe lolita',
  'lolita', 'creme de', 'crème de', 'ancho reyes', 'licor 43',
  'st. germain', 'elderflower', 'punch fantasia', 'biscotti', 'coco lopez',
  'coconut cream', 'coffee liqueur', 'bruto americano', 'gran classico',
  'gary classico',
]

const AMARO_KW = [
  'amaro', 'fernet', 'cynar', 'averna', 'braulio', 'sfumato',
  'amer picon', 'punt e mes', 'underberg', 'lo-fi amaro', 'lofi gentian',
  'byrrh',
]

const VERMOUTH_WINE_KW = [
  'vermouth', 'sherry', 'port', 'madeira', 'wine', 'champagne', 'prosecco',
  'cocchi americano', 'cocchi rosa', 'lillet', 'blanc vermouth',
  'cappelletti',
]

const BITTERS_KW = ['bitters', 'angostura', 'peychaud']

const SYRUP_KW = [
  'syrup', 'simple', 'honey', 'grenadine', 'orgeat', 'agave',
  'demerara syrup', 'cane syrup', 'maple', 'sugar', 'brown sugar',
  'coconut syrup', 'passionfruit',
]

const CITRUS_JUICE_KW = [
  'lemon', 'lime', 'orange', 'grapefruit', 'juice', 'pineapple',
  'apple cider', 'watermelon', 'pear juice', 'granny smith',
  'cold brew coffee',
]

const MIXER_KW = [
  'club soda', 'soda', 'tonic', 'sprite', 'ginger', 'beer', 'modelo',
  'cola',
]

function toSubCat(label: string, items: string[]): SubCategory | null {
  return items.length > 0 ? { label, ingredients: items } : null
}

export function categorizeIngredients(names: string[]): Category[] {
  const gin: string[] = []
  const vodka: string[] = []
  const whiskey: string[] = []
  const rum: string[] = []
  const tequila: string[] = []
  const brandy: string[] = []
  const otherSpirits: string[] = []
  const liqueurs: string[] = []
  const amari: string[] = []
  const vermouthWine: string[] = []
  const bitters: string[] = []
  const syrups: string[] = []
  const citrusJuice: string[] = []
  const mixers: string[] = []
  const other: string[] = []

  for (const name of names) {
    if (matchesAny(name, BITTERS_KW)) {
      bitters.push(name)
    } else if (matchesAny(name, AMARO_KW)) {
      amari.push(name)
    } else if (matchesAny(name, VERMOUTH_WINE_KW)) {
      vermouthWine.push(name)
    } else if (matchesAny(name, LIQUEUR_KW)) {
      liqueurs.push(name)
    } else if (matchesAny(name, GIN_KW)) {
      gin.push(name)
    } else if (matchesAny(name, VODKA_KW)) {
      vodka.push(name)
    } else if (matchesAny(name, WHISKEY_KW)) {
      whiskey.push(name)
    } else if (matchesAny(name, RUM_KW)) {
      rum.push(name)
    } else if (matchesAny(name, TEQUILA_KW)) {
      tequila.push(name)
    } else if (matchesAny(name, BRANDY_KW)) {
      brandy.push(name)
    } else if (matchesAny(name, OTHER_SPIRIT_KW)) {
      otherSpirits.push(name)
    } else if (matchesAny(name, SYRUP_KW)) {
      syrups.push(name)
    } else if (matchesAny(name, CITRUS_JUICE_KW)) {
      citrusJuice.push(name)
    } else if (matchesAny(name, MIXER_KW)) {
      mixers.push(name)
    } else {
      other.push(name)
    }
  }

  // Build spirits as a parent category with subcategories
  const spiritSubs = [
    toSubCat('Gin', gin),
    toSubCat('Vodka', vodka),
    toSubCat('Whiskey & Bourbon', whiskey),
    toSubCat('Rum', rum),
    toSubCat('Tequila & Mezcal', tequila),
    toSubCat('Brandy & Cognac', brandy),
    toSubCat('Other', otherSpirits),
  ].filter((s): s is SubCategory => s !== null)

  const allSpirits = [...gin, ...vodka, ...whiskey, ...rum, ...tequila, ...brandy, ...otherSpirits]

  return [
    { label: 'Spirits', emoji: '\uD83C\uDF7E', ingredients: allSpirits, subcategories: spiritSubs },
    { label: 'Liqueurs', emoji: '\uD83C\uDF78', ingredients: liqueurs },
    { label: 'Amari & Aperitivi', emoji: '\uD83C\uDF3F', ingredients: amari },
    { label: 'Vermouth & Wine', emoji: '\uD83C\uDF77', ingredients: vermouthWine },
    { label: 'Bitters', emoji: '\uD83D\uDCA7', ingredients: bitters },
    { label: 'Syrups & Sweeteners', emoji: '\uD83C\uDF6F', ingredients: syrups },
    { label: 'Citrus & Juice', emoji: '\uD83C\uDF4B', ingredients: citrusJuice },
    { label: 'Mixers', emoji: '\uD83E\uDDCA', ingredients: mixers },
    { label: 'Garnishes & Other', emoji: '\uD83C\uDF3F', ingredients: other },
  ].filter((cat) => cat.ingredients.length > 0)
}
