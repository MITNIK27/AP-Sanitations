// Fix PNB Kitchenmate products — dedup vs move to Sofpour
//
// - Deletes 3 duplicate products (Sofpour already has equivalent)
// - Rebrands 4 unique products from PNB to Sofpour
//
// Usage:
//   node --env-file=.env.local scripts/fix-pnb-products.mjs

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

// Step 1: Look up Sofpour brand _id
console.log('Looking up Sofpour brand...')
const sofpour = await client.fetch(
  `*[_type == "brand" && id.current == "sofpour"][0]{ _id, name }`,
)
if (!sofpour) {
  console.error('Sofpour brand not found in Sanity. Make sure it exists with slug "sofpour".')
  process.exit(1)
}
console.log(`✓ Sofpour brand: ${sofpour.name} (${sofpour._id})`)

// Step 2: Delete duplicate products (Sofpour already has equivalent)
const DUPLICATES_TO_DELETE = [
  { id: 'productModel-pnb-kitchenmate-4', name: 'PNB H2O Plus Pressure Booster System' },
  { id: 'productModel-pnb-kitchenmate-9', name: 'PNB H2O Plus Carbon Filter' },
  { id: 'productModel-pnb-kitchenmate-10', name: 'PNB H2O Plus Super Water Softener' },
]

console.log('\nDeleting duplicate products (Sofpour already has these)...')
for (const { id, name } of DUPLICATES_TO_DELETE) {
  try {
    await client.delete(id)
    console.log(`  ✓ Deleted: ${name} (${id})`)
  } catch (err) {
    if (err.statusCode === 404) {
      console.log(`  ⚠ Already gone: ${id}`)
    } else {
      console.error(`  ✗ Failed to delete ${id}:`, err.message)
    }
  }
}

// Step 3: Rebrand unique products from PNB to Sofpour
const REBRAND_TO_SOFPOUR = [
  { id: 'productModel-pnb-kitchenmate-5', newName: 'Sofpour Dual Pump Booster System', order: 8 },
  { id: 'productModel-pnb-kitchenmate-6', newName: 'Sofpour Sewage & Drainage Pump', order: 9 },
  { id: 'productModel-pnb-kitchenmate-7', newName: 'Sofpour Hot Water Circulating Pump', order: 10 },
  { id: 'productModel-pnb-kitchenmate-8', newName: 'Sofpour Submersible Transfer Pump', order: 11 },
]

console.log('\nRebranding unique products to Sofpour...')
for (const { id, newName, order } of REBRAND_TO_SOFPOUR) {
  try {
    await client
      .patch(id)
      .set({
        name: newName,
        brand: { _type: 'reference', _ref: sofpour._id },
        order,
      })
      .commit()
    console.log(`  ✓ Rebranded → ${newName} (${id})`)
  } catch (err) {
    if (err.statusCode === 404) {
      console.log(`  ⚠ Not found (may not have been seeded): ${id}`)
    } else {
      console.error(`  ✗ Failed to rebrand ${id}:`, err.message)
    }
  }
}

console.log(`
Done!
  • 3 duplicate PNB products deleted
  • 4 unique products rebranded to Sofpour

PNB Kitchenmate now has only 4 stainless steel tank products.
Sofpour now includes: Dual Pump Booster, Sewage Pump, Hot Water Circulating Pump, Submersible Transfer Pump.
`)
