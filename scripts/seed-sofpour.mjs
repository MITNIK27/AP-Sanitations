/**
 * seed-sofpour.mjs
 * Seeds Sofpour product models into Sanity.
 * - Deletes old generic placeholder products (sofpour-0 … sofpour-6)
 * - Creates individual model documents per product line
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-sofpour.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const BRAND_ID = '07464ad1-ea72-43d0-b795-4cb3def51ea4' // Sofpour brand _id
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Product definitions ────────────────────────────────────────────────────
// Images are fetched from sofpour.com and uploaded to Sanity.

const PRODUCTS = [
  // ── Water Softeners (pure-life) ──────────────────────────────────────────

  {
    id: 'productModel-sofpour-aurize-1248',
    name: 'Sofpour Aurize 1248',
    category: 'pure-life',
    subCategory: 'Aurize',
    description: 'Premium automatic water softener ideal for 2-3 family members. Intelligent auto-regeneration keeps your water consistently soft.',
    features: ['Model: Aurize 1248', 'Ideal for 2–3 family members', 'Automatic regeneration', 'Premium series build quality'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/Premium-Series-Softener-1025x1536.jpg',
    order: 10,
  },
  {
    id: 'productModel-sofpour-aurize-1354',
    name: 'Sofpour Aurize 1354',
    category: 'pure-life',
    subCategory: 'Aurize',
    description: 'Premium automatic water softener ideal for 2-3 family members. Eliminates limescale and protects appliances.',
    features: ['Model: Aurize 1354', 'Ideal for 2–3 family members', 'Automatic regeneration', 'Premium series build quality'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/IMG-20240311-WA0022-Copy-1025x1536.jpg',
    order: 20,
  },
  {
    id: 'productModel-sofpour-aurize-1054',
    name: 'Sofpour Aurize 1054',
    category: 'pure-life',
    subCategory: 'Aurize',
    description: 'Compact premium automatic water softener ideal for 2-3 family members. Slim footprint with full automatic operation.',
    features: ['Model: Aurize 1054', 'Ideal for 2–3 family members', 'Automatic regeneration', 'Compact design'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/IMG-20240311-WA0022-1025x1536.jpg',
    order: 30,
  },

  {
    id: 'productModel-sofpour-cleora-spa1248',
    name: 'Sofpour Cleora SPA 1248',
    category: 'pure-life',
    subCategory: 'Cleora',
    description: 'Automatic water softener designed for 2-3 family members. Reduces hardness to protect plumbing and appliances.',
    features: ['Model: SPA 1248', 'Ideal for 2–3 family members', 'Automatic regeneration', 'Digital control valve'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/thg78i0p0ce3n3foictw-1.jpg',
    order: 40,
  },
  {
    id: 'productModel-sofpour-cleora-spa1354',
    name: 'Sofpour Cleora SPA 1354',
    category: 'pure-life',
    subCategory: 'Cleora',
    description: 'Automatic water softener designed for 4-5 family members. Higher resin capacity for busier households.',
    features: ['Model: SPA 1354', 'Ideal for 4–5 family members', 'Automatic regeneration', 'Digital control valve'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/Sofpour-SPA-1354.png',
    order: 50,
  },
  {
    id: 'productModel-sofpour-cleora-spa1465',
    name: 'Sofpour Cleora SPA 1465',
    category: 'pure-life',
    subCategory: 'Cleora',
    description: 'Automatic water softener designed for 6-8 family members. Larger resin tank for high-demand households.',
    features: ['Model: SPA 1465', 'Ideal for 6–8 family members', 'Automatic regeneration', 'High-capacity resin tank'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/Sofpour-SPA-1465.png',
    order: 60,
  },
  {
    id: 'productModel-sofpour-cleora-spa1665',
    name: 'Sofpour Cleora SPA 1665',
    category: 'pure-life',
    subCategory: 'Cleora',
    description: 'Heavy-duty automatic water softener for large families and small commercial establishments.',
    features: ['Model: SPA 1665', 'Ideal for large families & small commercial use', 'Automatic regeneration', 'Commercial-grade capacity'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/Sofpour-SPA-1665-1536x1024.png',
    order: 70,
  },

  {
    id: 'productModel-sofpour-zucion-zna1354',
    name: 'Sofpour Zucion ZNA-1354',
    category: 'pure-life',
    subCategory: 'Zucion',
    description: 'Designed for 6-8 family members. High-capacity softener with durable fibreglass tank and smart auto-regeneration.',
    features: ['Model: ZNA-1354', 'Designed for 6–8 family members', 'Fibreglass pressure vessel', 'Automatic regeneration'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/pic1-scaled.jpg',
    order: 80,
  },
  {
    id: 'productModel-sofpour-zucion-zna1248',
    name: 'Sofpour Zucion ZNA-1248',
    category: 'pure-life',
    subCategory: 'Zucion',
    description: 'Designed for 4-5 family members. Reliable mid-size softener with durable fibreglass tank.',
    features: ['Model: ZNA-1248', 'Designed for 4–5 family members', 'Fibreglass pressure vessel', 'Automatic regeneration'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/pic2-scaled.jpg',
    order: 90,
  },
  {
    id: 'productModel-sofpour-zucion-zna1054',
    name: 'Sofpour Zucion ZNA-1054',
    category: 'pure-life',
    subCategory: 'Zucion',
    description: 'Designed for 2-3 family members. Compact entry-level softener with fibreglass tank construction.',
    features: ['Model: ZNA-1054', 'Designed for 2–3 family members', 'Fibreglass pressure vessel', 'Automatic regeneration'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/elementor/thumbs/pic3-scaled-qx71e3w8n0ev6yqhavi9b5rvug06dzktvts31lj1jc.jpg',
    order: 100,
  },

  {
    id: 'productModel-sofpour-compact-junior-i',
    name: 'Sofpour Compact Junior I',
    category: 'pure-life',
    subCategory: 'Compact',
    description: 'Slim apartment-friendly water softener ideal for 2-3 family members in flats. Space-saving design for urban homes.',
    features: ['Model: Sofpour Junior I', 'Ideal for 2–3 family members', 'Apartment / flat installation', 'Compact slim design', 'Automatic regeneration'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/elementor/thumbs/Sofpour-Junior-I-qx71e2yfo14vk69074lvsj6ripg1a9qg8iq3nszpnk.png',
    order: 110,
  },
  {
    id: 'productModel-sofpour-compact-junior-ii',
    name: 'Sofpour Compact Junior II',
    category: 'pure-life',
    subCategory: 'Compact',
    description: 'Slim apartment-friendly water softener ideal for 4-5 family members in flats. Larger capacity in the same compact footprint.',
    features: ['Model: Sofpour Junior II', 'Ideal for 4–5 family members', 'Apartment / flat installation', 'Compact slim design', 'Automatic regeneration'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/elementor/thumbs/Sofpour-Junior-II-qx71e2yfo14vk69074lvsj6ripg1a9qg8iq3nszpnk.png',
    order: 120,
  },

  // ── Heat Pump Water Heaters (wellness-spa) ───────────────────────────────

  {
    id: 'productModel-sofpour-hp-shp200',
    name: 'Sofpour SHP 200',
    category: 'wellness-spa',
    subCategory: 'Residential Heat Pump',
    description: 'Air source heat pump water heater with 200-litre storage, designed for small families. Available in SE, E, and H outdoor unit configurations.',
    features: ['Model: SHP 200 SE/E/H', 'Storage: 200 litres', 'Designed for small families', 'Air source heat pump technology', 'Multiple outdoor unit options', 'Energy-efficient hot water'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/4uzir4997ul6dkr8ofzx.jpg',
    order: 10,
  },
  {
    id: 'productModel-sofpour-hp-shp300',
    name: 'Sofpour SHP 300',
    category: 'wellness-spa',
    subCategory: 'Residential Heat Pump',
    description: 'Air source heat pump water heater with 300-litre storage, designed for small to medium families. Available in SE, E, H, and X configurations.',
    features: ['Model: SHP 300 SE/E/H/X', 'Storage: 300 litres', 'Designed for small-medium families', 'Air source heat pump technology', 'Multiple outdoor unit options'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/1nb5qnuo31dzd77u57o1.jpg',
    order: 20,
  },
  {
    id: 'productModel-sofpour-hp-shp500',
    name: 'Sofpour SHP 500',
    category: 'wellness-spa',
    subCategory: 'Residential Heat Pump',
    description: 'Air source heat pump water heater with 500-litre storage, suited for large families. Available in E, H, and X configurations.',
    features: ['Model: SHP 500 E/H/X', 'Storage: 500 litres', 'Suited for large families', 'Air source heat pump technology', 'High-capacity hot water supply'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/frhzdur0ch7qpcb21hal.jpg',
    order: 30,
  },
  {
    id: 'productModel-sofpour-hp-pool',
    name: 'Sofpour Swimming Pool Heat Pump',
    category: 'wellness-spa',
    subCategory: 'Residential Heat Pump',
    description: 'Heat pump system for swimming pools, scalable from small residential pools to Olympic-sized installations.',
    features: ['Application: Residential to Olympic-size pools', 'Air source heat pump technology', 'Scalable capacity', 'Energy-efficient pool heating'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/emovyb2mdvo1y1eudgse.jpg',
    order: 40,
  },

  {
    id: 'productModel-sofpour-hp-shp1000',
    name: 'Sofpour SHP 1000',
    category: 'wellness-spa',
    subCategory: 'Commercial Heat Pump',
    description: '1000-litre heat pump water heater for large families, hotels, and small commercial establishments. Available in E and H outdoor unit options.',
    features: ['Model: SHP 1000 E/H', 'Storage: 1000 litres', 'For large families, hotels & small commercial', 'Air source heat pump technology', 'Multiple outdoor unit configurations'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/10/SHP-1000-E-H-Opti.jpg',
    order: 50,
  },
  {
    id: 'productModel-sofpour-hp-commercial',
    name: 'Sofpour Commercial Heat Pump',
    category: 'wellness-spa',
    subCategory: 'Commercial Heat Pump',
    description: 'Industrial-grade heat pump water heating solutions for large hotels, resorts, hospitals, and industries.',
    features: ['Application: Hotels, resorts, hospitals, industries', 'Scalable capacity', 'Air source heat pump technology', 'High-demand hot water supply'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/r8e80hwjgrmcgl2py55i.jpg',
    order: 60,
  },

  // ── Pressure Boosters (pure-life) ────────────────────────────────────────

  {
    id: 'productModel-sofpour-pump-pss',
    name: 'Sofpour PSS Series Pressure Booster',
    category: 'pure-life',
    subCategory: 'Pressure Booster',
    description: 'Domestic pressure booster pump for residential water pressure enhancement. Quiet operation with automatic pressure control.',
    features: ['Series: PSS', 'Power range: 0.37 kW – 1.1 kW', 'Application: Residential pressure boosting', 'Automatic pressure control', 'Quiet operation'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/qx11nm8muubg4dqu8sa4-scaled.jpg',
    order: 130,
  },
  {
    id: 'productModel-sofpour-pump-fss',
    name: 'Sofpour FSS Series Pressure Booster',
    category: 'pure-life',
    subCategory: 'Pressure Booster',
    description: 'Premium residential pressure booster pump for enhanced water pressure throughout the home.',
    features: ['Series: FSS', 'Power range: 0.37 kW – 1.1 kW', 'Application: Premium residential boosting', 'Automatic pressure control', 'Durable stainless construction'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/g73rrjil9k9aefn6uzgu-scaled.jpg',
    order: 140,
  },
  {
    id: 'productModel-sofpour-pump-economy',
    name: 'Sofpour Economy Series Pressure Booster',
    category: 'pure-life',
    subCategory: 'Pressure Booster',
    description: 'Budget-friendly domestic pressure booster for reliable water pressure in residential applications.',
    features: ['Series: Economy', 'Power range: 0.37 kW – 0.75 kW', 'Application: Domestic water pressure', 'Cost-effective solution', 'Easy installation'],
    imageUrl: 'https://sofpour.com/wp-content/uploads/2024/07/fkt8sl791r8eblcsb1e5.jpg',
    order: 150,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

async function uploadImageFromUrl(url, filename) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': CHROME_UA },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: res.headers.get('content-type') || 'image/jpeg',
    })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (err) {
    console.error(`  Image upload failed: ${err.message}`)
    return null
  }
}

function imageFilename(product) {
  const ext = product.imageUrl.split('?')[0].split('.').pop()?.replace(/[^a-z]/g, '') || 'jpg'
  return `${product.id}.${ext}`
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Sofpour Seeder ===\n')

  // 1. Delete old generic placeholder products
  const OLD_IDS = [
    'productModel-sofpour-0', 'productModel-sofpour-1', 'productModel-sofpour-2',
    'productModel-sofpour-3', 'productModel-sofpour-4', 'productModel-sofpour-5',
    'productModel-sofpour-6',
  ]
  console.log('Deleting old placeholder products...')
  const tx = client.transaction()
  for (const id of OLD_IDS) tx.delete(id)
  try {
    await tx.commit()
    console.log(`  Deleted ${OLD_IDS.length} placeholder products.`)
  } catch (err) {
    console.warn(`  Could not delete placeholders: ${err.message}`)
  }

  // 2. Create new individual products
  console.log('\n--- Seeding products ---')
  let created = 0, skipped = 0

  for (const p of PRODUCTS) {
    process.stdout.write(`  [${p.category}] ${p.name}... `)

    // Upload image
    const imageAsset = await uploadImageFromUrl(p.imageUrl, imageFilename(p))

    const doc = {
      _id: p.id,
      _type: 'productModel',
      name: p.name,
      brand: { _type: 'reference', _ref: BRAND_ID },
      category: p.category,
      subCategory: p.subCategory,
      description: p.description,
      features: p.features,
      order: p.order,
      ...(imageAsset && { image: imageAsset }),
    }

    try {
      await client.createOrReplace(doc)
      console.log('✓')
      created++
    } catch (err) {
      console.log('✗', err.message?.slice(0, 80))
      skipped++
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`)
  console.log('Verify at /products/pure-life and /products/wellness-spa')
}

main().catch(console.error)
