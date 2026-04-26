// Seeds scraped Woven Gold products into Sanity.
// Reads from scripts/output/wg-scrape-{category}.json and uploads local images.
//
// Usage:
//   node --env-file=.env.local scripts/seed-wg-scraped.mjs <category> <folderName>
//
// Examples:
//   node --env-file=.env.local scripts/seed-wg-scraped.mjs shower-systems Showers
//   node --env-file=.env.local scripts/seed-wg-scraped.mjs bathtubs Bathtubs
//   node --env-file=.env.local scripts/seed-wg-scraped.mjs bathroom-faucets Faucets

import { createClient } from '@sanity/client'
import { readFileSync, createReadStream, existsSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const [,, category, folderName] = process.argv
if (!category || !folderName) {
  console.error('Usage: node --env-file=.env.local scripts/seed-wg-scraped.mjs <category> <folderName>')
  console.error('Example: node --env-file=.env.local scripts/seed-wg-scraped.mjs shower-systems Showers')
  process.exit(1)
}

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

// ── Load scraped JSON ──────────────────────────────────────────────────────

const jsonPath = resolve(__dirname, `output/wg-scrape-${category}.json`)
if (!existsSync(jsonPath)) {
  console.error(`JSON file not found: ${jsonPath}`)
  console.error(`Run the scraper first: node scripts/scrape-wg-products.mjs`)
  process.exit(1)
}

const products = JSON.parse(readFileSync(jsonPath, 'utf-8'))
console.log(`Loaded ${products.length} products from ${jsonPath}`)

// ── Lookup brand ───────────────────────────────────────────────────────────

const brand = await client.fetch(
  `*[_type == "brand" && id.current == "woven-gold"][0]{ _id, name }`,
)
if (!brand) {
  console.error('Woven Gold brand not found in Sanity. Make sure a brand with slug "woven-gold" exists.')
  process.exit(1)
}
console.log(`✓ Brand: ${brand.name} (${brand._id})\n`)

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function uploadImageIfNeeded(filePath) {
  if (!existsSync(filePath)) return null
  const filename = basename(filePath)
  try {
    const stream = createReadStream(filePath)
    const asset = await client.assets.upload('image', stream, {
      filename,
      contentType: 'image/jpeg',
    })
    return asset._id
  } catch (err) {
    console.error(`    ✗ Image upload failed (${filename}):`, err.message)
    return null
  }
}

// ── Seed products ──────────────────────────────────────────────────────────

let created = 0
let skipped = 0

for (const [i, p] of products.entries()) {
  if (!p.name?.trim()) {
    console.log(`  ⚠ Skipping entry ${i + 1} — no name`)
    skipped++
    continue
  }

  // Upload images
  const galleryRefs = []
  const localImages = Array.isArray(p.localImages) ? p.localImages : []
  for (const imgPath of localImages) {
    const assetId = await uploadImageIfNeeded(imgPath)
    if (assetId) {
      galleryRefs.push({ _type: 'image', _key: assetId, asset: { _type: 'reference', _ref: assetId } })
    }
  }

  // Use first image as primary image too
  const primaryImage = galleryRefs.length > 0
    ? { _type: 'image', asset: { _type: 'reference', _ref: galleryRefs[0].asset._ref } }
    : undefined

  const nameSlug = slugify(p.name.replace(/^Woven Gold\s+/i, ''))
  const docId = `productModel-wg-${slugify(category)}-${nameSlug}`.slice(0, 80)

  const doc = {
    _id: docId,
    _type: 'productModel',
    name: p.name.trim(),
    brand: { _type: 'reference', _ref: brand._id },
    category: p.category || category,
    order: (i + 1) * 10,
    ...(p.subCategory?.trim() && { subCategory: p.subCategory.trim() }),
    ...(primaryImage && { image: primaryImage }),
    ...(galleryRefs.length > 1 && { gallery: galleryRefs }),
    ...(p.description?.trim() && { description: p.description.trim() }),
    ...(Array.isArray(p.features) && p.features.length > 0 && {
      features: p.features.filter(f => typeof f === 'string' && f.trim()),
    }),
  }

  try {
    await client.createOrReplace(doc)
    const imgCount = galleryRefs.length
    console.log(`  ✓ ${p.name} [${p.subCategory ?? 'no subCat'}] (${imgCount} images) → ${docId}`)
    created++
  } catch (err) {
    console.error(`  ✗ Failed: ${p.name}:`, err.message)
  }
}

console.log(`
Done! ${created} products created/updated, ${skipped} skipped.
Visit /products/${category} to verify.
`)
