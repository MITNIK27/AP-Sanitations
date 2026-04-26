/**
 * Uploads the WG master catalogue PDF and patches the woven-gold brand doc.
 *
 * Usage: node --env-file=.env.local scripts/upload-wg-catalogue.mjs
 */

import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'fs'
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

const CATALOGUE_PATH = resolve(__dirname, '../pics/WG-Master Catalogue Web.pdf')
const BRAND_SLUG = 'woven-gold'

console.log('=== WG Catalogue Upload ===\n')

if (!existsSync(CATALOGUE_PATH)) {
  console.error(`✗ File not found: ${CATALOGUE_PATH}`)
  process.exit(1)
}

// Find the brand document
const brand = await client.fetch(
  `*[_type == "brand" && id.current == $slug][0]{ _id, name }`,
  { slug: BRAND_SLUG }
)

if (!brand) {
  console.error(`✗ Brand "${BRAND_SLUG}" not found in Sanity.`)
  process.exit(1)
}

console.log(`Brand: ${brand.name} (${brand._id})`)
console.log(`Uploading: ${CATALOGUE_PATH}\n`)

const asset = await client.assets.upload(
  'file',
  createReadStream(CATALOGUE_PATH),
  { filename: 'WG-Master Catalogue Web.pdf', contentType: 'application/pdf' }
)

console.log(`✓ Uploaded PDF → asset ID: ${asset._id}`)

await client
  .patch(brand._id)
  .set({
    catalogue: {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    },
  })
  .commit()

console.log(`✓ Patched brand "${brand.name}" with catalogue URL`)
console.log('\n✅ Done! The WG catalogue will now show on /products/shower-systems, /products/bathtubs, and /products/bathroom-faucets')
