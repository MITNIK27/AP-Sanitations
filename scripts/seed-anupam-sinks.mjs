/**
 * seed-anupam-sinks.mjs
 * Scrapes anupamsinks.in via WooCommerce Store API and seeds products into Sanity.
 * Sub-category = Series name (Unique Series, Prism Series, etc.)
 */

import { createClient } from '@sanity/client'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
})

const STORE_API = 'https://anupamsinks.in/wp-json/wc/store/v1/products'
const BRAND_ID = '02489527-bba1-498d-ba93-a7e7c424d8e9'  // Anupam brand _id
const CATEGORY_SLUG = 'kitchen-harmony'

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Series category slugs (priority order for sub-category)
const SERIES_SLUGS = new Set([
  'unique-series', 'signature-series', 'luxury-series', 'prism-series',
  'saga-series', 'elite-series', 'luxe-series', 'majestic-series',
  'ace-series', 'cube-series', 'zio-series', 'twister-series',
])

// Bowl type slug → friendly name
const BOWL_TYPE_NAMES = {
  'single-bowl-kitchen': 'Single Bowl',
  'double-bowl-kitchen': 'Double Bowl',
  'triple-bowl-kitchen-sink': 'Triple Bowl',
}

function pickSubCategory(categories) {
  // Prefer a "Series" category
  for (const cat of categories) {
    if (SERIES_SLUGS.has(cat.slug)) return cat.name
  }
  // Fall back to bowl type
  for (const cat of categories) {
    if (BOWL_TYPE_NAMES[cat.slug]) return BOWL_TYPE_NAMES[cat.slug]
  }
  return 'Kitchen Sinks'
}

function parseShortDescription(html) {
  // Strip all HTML tags
  const plain = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#[0-9]+;/g, '')
    .trim()

  const lines = plain.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  const specKeys = ['OVERALL SIZE', 'BOWL SIZE', 'DEPTH', 'MATERIAL', 'THICKNESS', 'DRAIN SIZE', 'WEIGHT']
  const features = []
  const descLines = []

  for (const line of lines) {
    const isSpec = specKeys.some(k => line.toUpperCase().startsWith(k))
    // Skip the product code header (e.g., "DOUBLE BOWL KITCHEN SINK- CS912DS")
    const isHeader = /^(SINGLE|DOUBLE|TRIPLE|CORNER)\s+BOWL/i.test(line)
    if (isSpec) {
      features.push(line.replace(/\s+/g, ' '))
    } else if (!isHeader && line.length > 20 && !/^\d/.test(line)) {
      descLines.push(line)
    }
  }

  const description = descLines.slice(0, 3).join(' ').slice(0, 300).trim()
  return { features: features.slice(0, 8), description }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function fetchAllSinks() {
  const all = []
  let page = 1
  while (true) {
    const url = `${STORE_API}?category=sinks&per_page=100&page=${page}`
    const res = await fetch(url, {
      headers: { 'User-Agent': CHROME_UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) { console.error('Fetch failed:', res.status); break }
    const data = await res.json()
    if (!data.length) break
    all.push(...data)
    const total = parseInt(res.headers.get('x-wp-total') || '0')
    console.log(`  Page ${page}: +${data.length} products (${all.length}/${total})`)
    if (all.length >= total) break
    page++
  }
  return all
}

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
      contentType: res.headers.get('content-type') || 'image/webp',
    })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch {
    return null
  }
}

async function deleteOldAnupamProducts() {
  const old = await client.fetch('*[_type == "productModel" && brand._ref == $brandId]._id', { brandId: BRAND_ID })
  if (!old.length) { console.log('No old Anupam products found'); return }
  console.log(`Found ${old.length} existing Anupam product(s): ${old.join(', ')}`)
  // Try to delete — may fail if token lacks update permission
  try {
    const tx = client.transaction()
    for (const id of old) tx.delete(id)
    await tx.commit()
    console.log('Deleted old products.')
  } catch {
    console.warn('⚠ Cannot delete old products (token lacks delete permission).')
    console.warn('  Please delete these manually in Sanity Studio:')
    old.forEach(id => console.warn('    -', id))
    console.warn('  Proceeding to create new individual sink products...\n')
  }
}

async function main() {
  console.log('=== Anupam Sinks Seeder ===\n')

  // 1. Delete old placeholder products
  await deleteOldAnupamProducts()

  // 2. Fetch all products
  console.log('\nFetching products from anupamsinks.in...')
  const rawProducts = await fetchAllSinks()
  console.log(`Total fetched: ${rawProducts.length}`)

  // 3. Process and group by sub-category
  const processed = rawProducts.map(p => {
    const subCategory = pickSubCategory(p.categories)
    const { features, description } = parseShortDescription(p.short_description || '')
    return {
      slug: p.slug,
      name: `Anupam ${p.name.replace(/^anupam\s*/i, '')}`,
      subCategory,
      description,
      features,
      images: (p.images || []).slice(0, 2).map(img => img.src),
    }
  })

  // Save scraped JSON for reference
  const jsonPath = resolve(__dirname, 'output', 'anupam-sinks-scraped.json')
  writeFileSync(jsonPath, JSON.stringify(processed, null, 2))
  console.log(`\nSaved ${processed.length} products to output/anupam-sinks-scraped.json`)

  // Sub-category summary
  const subCatCounts = {}
  for (const p of processed) subCatCounts[p.subCategory] = (subCatCounts[p.subCategory] || 0) + 1
  console.log('\nSub-category breakdown:')
  for (const [k, v] of Object.entries(subCatCounts)) console.log(`  ${k}: ${v}`)

  // 4. Seed into Sanity
  console.log('\n--- Seeding into Sanity ---')
  let created = 0, skipped = 0

  for (const p of processed) {
    const subSlug = slugify(p.subCategory)
    const nameSlug = p.slug.slice(0, 50)
    const docId = `productModel-anupam-${subSlug}-${nameSlug}`

    process.stdout.write(`  ${p.name.slice(0, 50)}... `)

    // Upload main image
    let imageAsset = null
    let gallery = []
    if (p.images.length > 0) {
      const mainFilename = p.slug + '-1.webp'
      imageAsset = await uploadImageFromUrl(p.images[0], mainFilename)
      if (imageAsset) {
        gallery.push(imageAsset)
        // Upload remaining gallery images
        for (let i = 1; i < p.images.length; i++) {
          const gImg = await uploadImageFromUrl(p.images[i], `${p.slug}-${i+1}.webp`)
          if (gImg) gallery.push(gImg)
        }
      }
    }

    const doc = {
      _type: 'productModel',
      _id: docId,
      name: p.name,
      brand: { _type: 'reference', _ref: BRAND_ID },
      category: CATEGORY_SLUG,
      subCategory: p.subCategory,
      description: p.description || '',
      features: p.features,
      order: 0,
      ...(imageAsset && { image: imageAsset }),
      ...(gallery.length > 0 && { gallery }),
    }

    try {
      await client.createOrReplace(doc)
      console.log('✓')
      created++
    } catch (err) {
      console.log('✗', err.message?.slice(0, 60))
      skipped++
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`)
  console.log('Visit /products/kitchen-harmony to verify.')
}

main().catch(console.error)
