export interface Ingredient {
  qty: string
  qtyMetric: string
  name: string
}

export interface Cocktail {
  id: number
  slug: string
  name: string
  story: string
  image: string
  imageId: string
  isFavorite: boolean
  notes: string | null
  bar: string
  bartender: string
  new: boolean
  method: string
  lightDark: string
  alcohol: string[]
  sensation: string[]
  style: string[]
  extras: string[]
  rating: number
  ingredientsText: string
  ingredients: Ingredient[]
}
