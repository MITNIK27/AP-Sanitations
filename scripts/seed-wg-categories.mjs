// Creates (or updates) the 3 new Woven Gold product category documents in Sanity.
// These are _type: "product" documents that power /products/shower-systems, /products/bathroom-faucets,
// and /products/bathtubs. Without them those URLs return 404.
//
// Usage:
//   node --env-file=.env.local scripts/seed-wg-categories.mjs

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('SANITY_API_WRITE_TOKEN is not set. Add it to .env.local')
  process.exit(1)
}

const CATEGORIES = [
  {
    _id: 'product-shower-systems',
    slug: 'shower-systems',
    number: '06',
    category: 'Shower Systems',
    title: 'Shower Systems',
    description: 'Complete shower solutions — multifunction rain showers, body jets, steam cabins, enclosures and thermostatic mixers by Woven Gold.',
    order: 6,
  },
  {
    _id: 'product-bathroom-faucets',
    slug: 'bathroom-faucets',
    number: '07',
    category: 'Bathroom Faucets',
    title: 'Bathroom Faucets',
    description: 'European designer faucet collections — 16 distinct ranges from Woven Gold including basin mixers, single-lever, and floor-mounted configurations.',
    order: 7,
  },
  {
    _id: 'product-bathtubs',
    slug: 'bathtubs',
    number: '08',
    category: 'Bathtubs',
    title: 'Bathtubs',
    description: "From freestanding statement pieces to whirlpool baths — Woven Gold's complete plain, whirlpool, and freestanding bathtub range.",
    order: 8,
  },
]

// Shared grid/style defaults (used by bento grid on home page when it is expanded later)
const GRID_DEFAULTS = {
  bg: 'bg-stone/5',
  text: 'text-charcoal',
  border: 'border-gold/40',
  gridCols: 'md:col-span-1',
  gridRows: 'md:row-span-1',
}

console.log('Upserting 3 Woven Gold category documents...\n')

for (const cat of CATEGORIES) {
  const doc = {
    _id: cat._id,
    _type: 'product',
    id: { _type: 'slug', current: cat.slug },
    number: cat.number,
    category: cat.category,
    title: cat.title,
    description: cat.description,
    order: cat.order,
    ...GRID_DEFAULTS,
  }

  try {
    await client.createOrReplace(doc)
    console.log(`  ✓ ${cat.title} → /products/${cat.slug} (${cat._id})`)
  } catch (err) {
    console.error(`  ✗ Failed: ${cat.title}:`, err.message)
  }
}

console.log(`
Done! Three new category pages are now active:
  • /products/shower-systems
  • /products/bathroom-faucets
  • /products/bathtubs
`)
