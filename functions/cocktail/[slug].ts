import cocktailMeta from '../data/cocktail-meta.json'

const SITE_URL = 'https://bartenders-choice.pages.dev'
const SITE_NAME = "Bartender's Choice"

const meta = cocktailMeta as Record<string, { name: string; description: string; image: string | null }>

export const onRequest: PagesFunction = async (context) => {
  const slug = context.params.slug as string
  const cocktail = meta[slug]

  // If we don't recognize the slug, pass through unchanged
  if (!cocktail) {
    return context.next()
  }

  const response = await context.next()

  const ogTitle = `${cocktail.name} | ${SITE_NAME}`
  const ogDescription = cocktail.description
  const ogUrl = `${SITE_URL}/cocktail/${slug}`
  const ogImage = cocktail.image ? `${SITE_URL}${cocktail.image}` : `${SITE_URL}/images/logo.png`

  return new HTMLRewriter()
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', ogTitle)
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute('content', ogDescription)
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', ogImage)
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', ogUrl)
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', ogTitle)
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute('content', ogDescription)
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', ogImage)
      },
    })
    .on('meta[name="twitter:card"]', {
      element(el) {
        el.setAttribute('content', cocktail.image ? 'summary_large_image' : 'summary')
      },
    })
    .on('title', {
      element(el) {
        el.setInnerContent(ogTitle)
      },
    })
    .transform(response)
}
