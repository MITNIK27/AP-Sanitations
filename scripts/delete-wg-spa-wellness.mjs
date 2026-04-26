/**
 * Deletes the old WG SPA products that were seeded into wellness-spa
 * (Barcelona, Bliss, etc.). These are superseded by the properly scraped
 * bathtub/shower/faucet products in their dedicated categories.
 *
 * Usage: node --env-file=.env.local scripts/delete-wg-spa-wellness.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const SPA_FOLDERS = [
  'Barcelona', 'Bliss', 'Carmenta', 'Classic', 'Emotion', 'Envoy', 'Galaxy',
  'Glow', 'Grandee', 'Highlife', 'Infinity', 'Modena', 'Niwa', 'Perfect Plus',
  'Platinum Plus', 'Premium Plus', 'Relay', 'Sentorini', 'Swim paradise',
  'Tiago', 'Triumph',
]

const IDS_TO_DELETE = SPA_FOLDERS.map(f => `productModel-wg-spa-${toSlug(f)}`)

console.log('=== Deleting old WG SPA wellness-spa products ===\n')
console.log('IDs to delete:')
IDS_TO_DELETE.forEach(id => console.log(' ', id))
console.log()

let deleted = 0
let notFound = 0

for (const id of IDS_TO_DELETE) {
  try {
    await client.delete(id)
    console.log(`  ✓ deleted: ${id}`)
    deleted++
  } catch (err) {
    if (err.message?.includes('not found') || err.statusCode === 404) {
      console.log(`  - not found (skipped): ${id}`)
      notFound++
    } else {
      console.error(`  ✗ error deleting ${id}: ${err.message}`)
    }
  }
}

console.log(`\n✅ Done! Deleted: ${deleted}, Not found: ${notFound}`)
