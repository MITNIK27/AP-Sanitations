/**
 * Migrates old Woven Gold products (productModel-woven-gold-*) to the new
 * SPA products (productModel-wg-spa-*):
 *   1. Copies description + features from old → new (where new is missing them)
 *   2. Deletes all old productModel-woven-gold-* documents
 *
 * Usage: node --env-file=.env.local scripts/migrate-wg-products.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/^woven gold\s+/i, '')   // strip "Woven Gold" prefix
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function main() {
  // 1. Fetch all old WG products
  const oldProducts = await client.fetch(
    `*[_type == "productModel" && _id match "productModel-woven-gold-*"] {
      _id, name, description, features
    }`
  )
  console.log(`Found ${oldProducts.length} old products to migrate.\n`)

  // 2. Fetch new SPA products to know which are missing descriptions
  const newProducts = await client.fetch(
    `*[_type == "productModel" && _id match "productModel-wg-spa-*"] {
      _id, name, description
    }`
  )
  const newById = Object.fromEntries(newProducts.map(p => [p._id, p]))

  // 3. For each old product, try to match to a new product and patch missing data
  for (const old of oldProducts) {
    const slug = toSlug(old.name)
    const newId = `productModel-wg-spa-${slug}`

    if (!newById[newId]) {
      console.log(`  ⚠ No new product found for "${old.name}" (tried ${newId})`)
      continue
    }

    const newDoc = newById[newId]
    if (!newDoc.description && old.description) {
      try {
        await client
          .patch(newId)
          .set({
            description: old.description,
            ...(old.features?.length ? { features: old.features } : {}),
          })
          .commit()
        console.log(`  ✓ Copied description to ${newId}`)
      } catch (err) {
        console.warn(`  ⚠ Failed to patch ${newId}: ${err.message}`)
      }
    } else {
      console.log(`  — ${newId} already has a description, skipping copy`)
    }
  }

  // 4. Delete all old products
  console.log('\nDeleting old products…')
  for (const old of oldProducts) {
    try {
      await client.delete(old._id)
      console.log(`  ✓ Deleted ${old._id} ("${old.name}")`)
    } catch (err) {
      console.warn(`  ⚠ Failed to delete ${old._id}: ${err.message}`)
    }
  }

  console.log('\nDone. All old Woven Gold products removed.')
}

main()
