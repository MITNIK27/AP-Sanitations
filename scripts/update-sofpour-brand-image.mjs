// Upload Sofpour1.jpeg to Sanity and set it as the Sofpour brand image.
//
// Usage:
//   node --env-file=.env.local scripts/update-sofpour-brand-image.mjs

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

const IMAGE_PATH = resolve(__dirname, '../public/pics/Sofpour1.jpeg')

// Resolve the Sofpour brand document ID
console.log('Looking up Sofpour brand...')
const brand = await client.fetch(
  `*[_type == "brand" && id.current == "sofpour"][0]{ _id, name }`
)
if (!brand) {
  console.error('Sofpour brand not found in Sanity. Make sure the brand document exists with slug "sofpour".')
  process.exit(1)
}
console.log(`✓ Found: ${brand.name} (${brand._id})`)

// Upload the image
console.log('\nUploading Sofpour1.jpeg...')
const asset = await client.assets.upload('image', createReadStream(IMAGE_PATH), {
  filename: 'Sofpour1.jpeg',
  contentType: 'image/jpeg',
})
console.log(`✓ Uploaded: ${asset._id}`)

// Patch the brand document
console.log('\nPatching Sofpour brand image...')
await client
  .patch(brand._id)
  .set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
  .commit()
console.log(`✓ Sofpour brand image updated.`)
