// Sanity Seed Script
// Reads a completed products JSON and creates productModel documents in Sanity.
//
// Usage:
//   node --env-file=.env.local scripts/seed-products.mjs <brand-slug> <category>
//
// Example:
//   node --env-file=.env.local scripts/seed-products.mjs anupam wellness-spa
//
// Prerequisites:
//   1. Brand document must exist in Sanity Studio with matching slug
//   2. scripts/output/[brand-slug]-products.json must be filled in
//   3. SANITY_API_WRITE_TOKEN must be set in .env.local
//
// Valid categories:
//   wellness-spa | pure-life | kitchen-harmony | swimming-pool | invisible-infrastructure

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const [,, brandSlug, category, filePrefix = brandSlug] = process.argv

const VALID_CATEGORIES = ['wellness-spa', 'pure-life', 'kitchen-harmony', 'swimming-pool', 'invisible-infrastructure', 'shower-systems', 'bathroom-faucets', 'bathtubs']

if (!brandSlug || !category) {
  console.error('Usage: node --env-file=.env.local scripts/seed-products.mjs <brand-slug> <category>')
  console.error('Example: node --env-file=.env.local scripts/seed-products.mjs anupam wellness-spa')
  process.exit(1)
}

if (!VALID_CATEGORIES.includes(category)) {
  console.error(`Invalid category "${category}". Valid options: ${VALID_CATEGORIES.join(' | ')}`)
  process.exit(1)
}

// Sanity write client
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

// 1. Find brand by slug
console.log(`Looking up brand "${brandSlug}" in Sanity...`)
const brand = await client.fetch(
  `*[_type == "brand" && id.current == $slug][0]{ _id, name }`,
  { slug: brandSlug }
)
if (!brand) {
  console.error(`Brand "${brandSlug}" not found in Sanity. Create it in Studio first (brand → id slug = "${brandSlug}").`)
  process.exit(1)
}
console.log(`✓ Found brand: ${brand.name} (${brand._id})`)

// 2. Load the JSON file
const jsonPath = resolve(dirname(fileURLToPath(import.meta.url)), `output/${filePrefix}-products.json`)
let products
try {
  products = JSON.parse(readFileSync(jsonPath, 'utf-8'))
} catch {
  console.error(`Could not read ${jsonPath}`)
  console.error(`Run extraction first: node scripts/extract-pdf.mjs "<pdf-path>" ${brandSlug}`)
  process.exit(1)
}

if (!Array.isArray(products) || products.length === 0) {
  console.error('JSON file is empty or not an array.')
  process.exit(1)
}

console.log(`Found ${products.length} entries in JSON. Processing...`)

// 3. Create documents in Sanity
let created = 0
let skipped = 0

for (const [i, p] of products.entries()) {
  if (!p.name || p.name.trim() === '') {
    console.log(`  ⚠ Skipping entry ${i + 1} — no name set`)
    skipped++
    continue
  }

  const productCategory = p.category && VALID_CATEGORIES.includes(p.category) ? p.category : category

  // Use createOrReplace with a deterministic _id to avoid duplicates on re-run
  const docId = `productModel-${filePrefix}-${i}`

  const doc = {
    _id: docId,
    _type: 'productModel',
    name: p.name.trim(),
    brand: { _type: 'reference', _ref: brand._id },
    category: productCategory,
    order: i + 1,
    ...(p.subCategory?.trim() && { subCategory: p.subCategory.trim() }),
    ...(p.description?.trim() && { description: p.description.trim() }),
    ...(Array.isArray(p.features) && p.features.length > 0 && {
      features: p.features.filter(f => typeof f === 'string' && f.trim()).map(f => f.trim()),
    }),
  }

  try {
    await client.createOrReplace(doc)
    console.log(`  ✓ ${p.name} → ${productCategory} (${docId})`)
    created++
  } catch (err) {
    console.error(`  ✗ Failed to create "${p.name}":`, err.message)
  }
}

console.log(`
Done! ${created} product(s) created/updated, ${skipped} skipped.

Next steps:
1. Open Sanity Studio → Product Models to verify entries
2. Add product images to each entry in Studio
3. Visit your site to see products on the category page
`)
