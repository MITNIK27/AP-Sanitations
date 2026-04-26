// Resize PNB.jpg to 800x600 (4:3) with white padding, re-upload, re-patch all 4 products
//
// Usage:
//   node --env-file=.env.local scripts/resize-pnb-image.mjs

import { createClient } from '@sanity/client'
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const IMAGE_PATH = resolve(__dirname, '../pics/PNB.jpg')

const PNB_PRODUCT_IDS = [
  'productModel-pnb-kitchenmate-0',
  'productModel-pnb-kitchenmate-1',
  'productModel-pnb-kitchenmate-2',
  'productModel-pnb-kitchenmate-3',
]

// Resize to 800x600 (4:3) — fit inside with white background padding
console.log('Resizing PNB.jpg to 800×600 with white padding...')
const resizedBuffer = await sharp(IMAGE_PATH)
  .resize(800, 600, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .jpeg({ quality: 90 })
  .toBuffer()
console.log(`✓ Resized buffer: ${(resizedBuffer.length / 1024).toFixed(1)} KB`)

console.log('\nUploading resized image to Sanity...')
const imageAsset = await client.assets.upload('image', resizedBuffer, {
  filename: 'PNB-product.jpg',
  contentType: 'image/jpeg',
})
console.log(`✓ Uploaded: ${imageAsset._id}`)

console.log('\nPatching all 4 PNB product models...')
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

console.log('\nDone! All 4 PNB products updated with properly sized image.')
