export interface Guide {
  slug: string
  title: string
  image: string | null
}

export const guides: Guide[] = [
  { slug: 'foreword', title: "Welcome to Bartender's Choice", image: null },
  { slug: 'glassware', title: 'Glassware & Equipment', image: 'glassware.png' },
  { slug: 'ice', title: 'Ice', image: 'ice.png' },
  { slug: 'jigger', title: 'How to Jigger', image: 'jigger.png' },
  { slug: 'shake', title: 'How to Shake', image: 'shake.png' },
  { slug: 'stir', title: 'How to Stir', image: 'stir.png' },
  { slug: 'shaking-vs-stirring', title: 'Shaking vs. Stirring', image: 'stirring.png' },
  { slug: 'muddle', title: 'How to Muddle', image: 'muddle.png' },
  { slug: 'swizzle', title: 'How to Swizzle', image: 'swizzle.png' },
  { slug: 'twists', title: 'Twists', image: 'twists.png' },
  { slug: 'syrup-and-juices', title: 'Syrup and Juices', image: 'juices.png' },
  { slug: 'glossary', title: 'Glossary', image: null },
  { slug: 'thanks', title: 'Special Thanks', image: null },
]
