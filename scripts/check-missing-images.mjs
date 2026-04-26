// Finds WG shower/bathtub/faucet products in Sanity that are missing images,
// then re-uploads from the local scraped image files.
//
// Usage:
//   node --env-file=.env.local scripts/check-missing-images.mjs

import { createClient } from '@sanity/client'
import { readFileSync, createReadStream, existsSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Load scraped JSON files to find localImages paths
const JSON_FILES = {
  'shower-systems': resolve(__dirname, 'output/wg-scrape-shower-systems.json'),
  'bathtubs':       resolve(__dirname, 'output/wg-scrape-bathtubs.json'),
}

const productMap = new Map() // docId → localImages[]
for (const [cat, path] of Object.entries(JSON_FILES)) {
  if (!existsSync(path)) continue
  const products = JSON.parse(readFileSync(path, 'utf-8'))
  for (const p of products) {
    const shortName = p.name.replace(/^Woven Gold\s+/i, '').trim()
    const slug = shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const docId = `productModel-wg-${cat.replace('-', '-')}-${slug}`.slice(0, 80)
    if (Array.isArray(p.localImages) && p.localImages.length > 0) {
      productMap.set(docId, p.localImages)
    }
  }
}

console.log(`Loaded image paths for ${productMap.size} products from JSON files.\n`)

// Query Sanity for products missing images
console.log('Querying Sanity for products without images...')
const missing = await client.fetch(
  `*[_type == "productModel" && category in ["shower-systems","bathtubs"] && !defined(image)] { _id, name, category }`
)
console.log(`Found ${missing.length} products without images.\n`)

if (missing.length === 0) {
  console.log('All products have images. Nothing to fix.')
  process.exit(0)
}

let fixed = 0
let skipped = 0

for (const doc of missing) {
  const localImages = productMap.get(doc._id)
  if (!localImages || localImages.length === 0) {
    console.log(`  ⚠ No local images found for: ${doc.name} (${doc._id})`)
    skipped++
    continue
  }

  const imgPath = localImages[0]
  if (!existsSync(imgPath)) {
    console.log(`  ⚠ File not found: ${imgPath}`)
    skipped++
    continue
  }

  try {
    const stream = createReadStream(imgPath)
    const filename = basename(imgPath)
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

    const asset = await client.assets.upload('image', stream, { filename, contentType })

    await client.patch(doc._id).set({
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    }).commit()

    console.log(`  ✓ Fixed: ${doc.name}`)
    fixed++
  } catch (err) {
    console.error(`  ✗ Failed: ${doc.name}: ${err.message}`)
    skipped++
  }
}

console.log(`\nDone! Fixed ${fixed} products, skipped ${skipped}.`)
