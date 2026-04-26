// Upload PNB.jpg to Sanity and assign it to all 4 PNB product models
//
// Usage:
//   node --env-file=.env.local scripts/seed-pnb-image.mjs

import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

const IMAGE_PATH = resolve(__dirname, '../pics/PNB.jpg')

const PNB_PRODUCT_IDS = [
  'productModel-pnb-kitchenmate-0',
  'productModel-pnb-kitchenmate-1',
  'productModel-pnb-kitchenmate-2',
  'productModel-pnb-kitchenmate-3',
]

console.log('Uploading PNB.jpg to Sanity...')
const imageAsset = await client.assets.upload('image', createReadStream(IMAGE_PATH), {
  filename: 'PNB.jpg',
  contentType: 'image/jpeg',
})
console.log(`✓ Uploaded: ${imageAsset._id}`)

console.log('\nPatching all 4 PNB product models with the image...')
for (const id of PNB_PRODUCT_IDS) {
  try {
    await client
      .patch(id)
      .set({ image: { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } })
      .commit()
    console.log(`  ✓ Patched: ${id}`)
  } catch (err) {
    if (err.statusCode === 404) {
      console.log(`  ⚠ Not found: ${id}`)
    } else {
      console.error(`  ✗ Failed: ${id} —`, err.message)
    }
  }
}

console.log('\nDone! All PNB products now share the same product image.')
