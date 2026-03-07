#!/usr/bin/env node
// Generates a stripped-down cocktail lookup for Cloudflare Pages Functions OG tags.
// Output: functions/data/cocktail-meta.json (~50KB vs ~972KB full dataset)

import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const cocktails = JSON.parse(readFileSync('src/data/cocktails.json', 'utf-8'))
const imageMap = JSON.parse(readFileSync('src/data/image-map.json', 'utf-8'))

const meta = {}
for (const c of cocktails) {
  const imgFile = imageMap[c.imageId]
  meta[c.slug] = {
    name: c.name,
    description: c.ingredientsText,
    image: imgFile ? `/images/cocktails/${imgFile}` : null,
  }
}

mkdirSync('functions/data', { recursive: true })
writeFileSync('functions/data/cocktail-meta.json', JSON.stringify(meta))

const sizeKB = (Buffer.byteLength(JSON.stringify(meta)) / 1024).toFixed(1)
console.log(`Generated functions/data/cocktail-meta.json (${sizeKB} KB, ${Object.keys(meta).length} cocktails)`)
