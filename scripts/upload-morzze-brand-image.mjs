/**
 * Upload the Morzze brand hero image to Sanity and patch the brand document.
 * Usage: node --env-file=.env.local scripts/upload-morzze-brand-image.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const IMAGE_PATH = path.join(__dirname, '../public/pics/Morzze.png')

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error('Image not found:', IMAGE_PATH)
    process.exit(1)
  }

  console.log('Uploading Morzze brand image…')
  const asset = await client.assets.upload(
    'image',
    fs.createReadStream(IMAGE_PATH),
    {
      filename: 'morzze-brand.png',
      contentType: 'image/png',
      source: { id: 'morzze-brand-hero', name: 'morzze-brand-hero' },
    }
  )
  console.log('✓ Uploaded:', asset._id)

  await client.patch('brand-morzze').set({
    image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
  }).commit()
  console.log('✓ Patched brand-morzze with image')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
