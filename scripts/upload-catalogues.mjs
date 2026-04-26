/**
 * Upload catalogue PDFs to Sanity and patch brand documents.
 * Usage: node --env-file=.env.local scripts/upload-catalogues.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const CATALOGUES_DIR = path.join(__dirname, '../pics/Catalogues')

// Map brand slug → PDF filename in pics/Catalogues/
const BRAND_CATALOGUES = [
  { slug: 'sofpour',          file: 'OCR 1. Sofpour Water Softener (1).pdf',  label: 'Sofpour'          },
  { slug: 'fountain-nozzles', file: 'Fountaion Nozzles.pdf',                  label: 'Fountain Nozzles' },
  { slug: 'magicfalls',       file: 'WaterFall.pdf',                           label: 'MagicFalls'       },
  { slug: 'anupam',           file: 'OCR Anupam-Kitchen-Catelogue (1).pdf',   label: 'Anupam'           },
]

async function getBrandDocId(slug) {
  const doc = await client.fetch(
    `*[_type == "brand" && id.current == $slug][0]{ _id }`,
    { slug }
  )
  return doc?._id ?? null
}

async function uploadAndPatch(entry) {
  const filePath = path.join(CATALOGUES_DIR, entry.file)

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠  File not found, skipping: ${entry.file}`)
    return
  }

  console.log(`\n[${entry.label}] Uploading ${entry.file} …`)

  // Upload PDF asset
  const asset = await client.assets.upload(
    'file',
    fs.createReadStream(filePath),
    { filename: entry.file, contentType: 'application/pdf' }
  )
  console.log(`  ✓ Uploaded asset: ${asset._id}`)

  // Find brand document
  const brandId = await getBrandDocId(entry.slug)
  if (!brandId) {
    console.warn(`  ⚠  Brand not found in Sanity for slug "${entry.slug}"`)
    return
  }

  // Patch brand with catalogue reference
  await client
    .patch(brandId)
    .set({
      catalogue: {
        _type: 'file',
        asset: { _type: 'reference', _ref: asset._id },
      },
    })
    .commit()

  console.log(`  ✓ Patched brand ${brandId} with catalogue`)
}

async function main() {
  console.log('Uploading catalogues to Sanity …\n')
  for (const entry of BRAND_CATALOGUES) {
    try {
      await uploadAndPatch(entry)
    } catch (err) {
      console.error(`  ✗ Error for ${entry.label}:`, err.message)
    }
  }
  console.log('\nDone.')
}

main()
