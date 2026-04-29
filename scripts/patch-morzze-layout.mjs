/**
 * patch-morzze-layout.mjs
 * One-time script: updates the Morzze brand document in Sanity to set
 * layout: 'image-left', fixing the brand strip orientation on the homepage.
 *
 * Root cause: seed-morzze.mjs set layout: 'image-right' explicitly, which
 * overrides the index-based alternation fallback in ClientPage.tsx.
 *
 * Usage (run once):
 *   node --env-file=.env.local scripts/patch-morzze-layout.mjs
 */

import { createClient } from '@sanity/client'

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

console.log('Patching Morzze brand layout to image-left...')

try {
  const result = await client
    .patch('brand-morzze')
    .set({ layout: 'image-left' })
    .commit()

  console.log(`✓ Done. Updated: ${result._id} — layout is now 'image-left'`)
  console.log('  Morzze will now appear image-left / text-right on the homepage.')
} catch (err) {
  console.error('Patch failed:', err.message)
  process.exit(1)
}
