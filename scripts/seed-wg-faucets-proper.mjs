// Properly seeds WG Faucet products from collection pages.
// Each collection page (armonia.php etc.) lists individual faucet models as cards.
// Each model becomes a separate productModel document.
//
// Deletes the 11 wrong existing faucet documents first.
//
// Usage:
//   node --env-file=.env.local scripts/seed-wg-faucets-proper.mjs

import { createClient } from '@sanity/client'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const BASE_URL = 'https://www.wovengoldindia.com'
const FAUCETS_DIR = resolve(__dirname, '../pics/WG/Faucets')

const FAUCET_COLLECTIONS = [
  { slug: 'armonia',   label: 'Armonia' },
  { slug: 'goccia',    label: 'Goccia' },
  { slug: 'prestigio', label: 'Prestigio' },
  { slug: 'eclettica', label: 'Eclettica' },
  { slug: 'eleganza',  label: 'Eleganza' },
  { slug: 'stile_vivo', label: 'Stile Vivo' },
  { slug: 'moderna',   label: 'Moderna' },
  { slug: 'daqua',     label: "D'Aqua" },
  { slug: 'opulenza',  label: 'Opulenza' },
  { slug: 'savoy',     label: 'Savoy' },
  { slug: 'virtus',    label: 'Virtus' },
  { slug: 'splendor',  label: 'Splendor' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok || !res.body) return false
    const stream = createWriteStream(destPath)
    await pipeline(res.body, stream)
    return true
  } catch {
    return false
  }
}

function extractFaucetCards(html) {
  // Split on card boundaries — HTML comments between </div> tags break the nested-div regex
  const cards = []
  const parts = html.split('<div class="shop-product-card">')
  for (let i = 1; i < parts.length; i++) {
    const cardHtml = parts[i]

    // Model code from <h4 class="product-name">
    const modelMatch = cardHtml.match(/<h4[^>]*class=["'][^"']*product-name[^"']*["'][^>]*>([^<]+)<\/h4>/)
    if (!modelMatch) continue
    const modelCode = modelMatch[1].trim()

    // Image src from inside .shop-p-slider
    const imgMatch = cardHtml.match(/<img[^>]+src=["']([^"']+\.(?:png|jpg|jpeg|webp))["']/i)
    const imgSrc = imgMatch ? imgMatch[1] : null

    // Description text — everything after </h4> and before the PDF <a>
    const afterH4 = cardHtml.slice(cardHtml.indexOf('</h4>') + 5)
    const beforePdf = afterH4.split(/href=["'][^"']*\.pdf["']/i)[0]
    const descRaw = beforePdf
      .replace(/<a[^>]*>/gi, '')
      .replace(/<\/a>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 1)
    const features = descRaw.slice(0, 5)
    const description = features.join('. ')

    // PDF href
    const pdfMatch = cardHtml.match(/<a[^>]+href=["']([^"']*\.pdf)["']/i)
    const pdfUrl = pdfMatch ? pdfMatch[1] : null

    cards.push({ modelCode, imgSrc, features, description, pdfUrl })
  }
  return cards
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Step 1: Delete the 11 wrong existing faucet documents ──────────────────

console.log('Deleting wrong existing faucet documents...')
const existingFaucetDocs = await client.fetch(
  `*[_type == "productModel" && category == "bathroom-faucets"]{ _id, name }`
)
for (const doc of existingFaucetDocs) {
  try {
    await client.delete(doc._id)
    console.log(`  ✓ Deleted: ${doc.name} (${doc._id})`)
  } catch (err) {
    console.log(`  ⚠ Could not delete ${doc._id}: ${err.message}`)
  }
}

// ── Step 2: Look up Woven Gold brand ──────────────────────────────────────

const brand = await client.fetch(
  `*[_type == "brand" && id.current == "woven-gold"][0]{ _id, name }`,
)
if (!brand) {
  console.error('Woven Gold brand not found.')
  process.exit(1)
}
console.log(`\n✓ Brand: ${brand.name} (${brand._id})\n`)

// ── Step 3: Scrape each collection and seed individual models ───────────────

let totalCreated = 0
let order = 10

for (const collection of FAUCET_COLLECTIONS) {
  const collectionUrl = `${BASE_URL}/${collection.slug}.php`
  console.log(`\nFetching ${collection.label} from ${collectionUrl}...`)

  const html = await fetchHtml(collectionUrl)
  if (!html) {
    console.log(`  ⚠ Could not fetch — skipping`)
    continue
  }

  const cards = extractFaucetCards(html)
  console.log(`  Found ${cards.length} product cards`)

  if (cards.length === 0) {
    // Fallback: create one entry for the collection itself using listing images
    const imgMatch = html.match(/<img[^>]+src=["'](faucets\/[^"']+\.(?:png|jpg))["']/i)
    if (imgMatch) {
      cards.push({
        modelCode: collection.label,
        imgSrc: imgMatch[1],
        features: [],
        description: `Woven Gold ${collection.label} faucet collection.`,
        pdfUrl: null,
      })
    }
  }

  const collectionFolder = resolve(FAUCETS_DIR, collection.slug)
  if (!existsSync(collectionFolder)) mkdirSync(collectionFolder, { recursive: true })

  for (const card of cards) {
    const { modelCode, imgSrc, features, description } = card

    // Download image
    let assetId = null
    if (imgSrc) {
      const imgUrl = imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}/${imgSrc}`
      const ext = imgUrl.split('?')[0].split('.').pop()?.replace(/[^a-z]/g, '') || 'png'
      const filename = `${slugify(modelCode)}.${ext}`
      const destPath = resolve(collectionFolder, filename)

      const ok = await downloadImage(imgUrl, destPath)
      if (ok) {
        try {
          const { createReadStream } = await import('fs')
          const stream = createReadStream(destPath)
          const asset = await client.assets.upload('image', stream, {
            filename,
            contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          })
          assetId = asset._id
        } catch (err) {
          console.log(`    ✗ Image upload failed: ${err.message}`)
        }
      }
    }

    const docId = `productModel-wg-faucet-${slugify(collection.slug)}-${slugify(modelCode)}`.slice(0, 80)
    const doc = {
      _id: docId,
      _type: 'productModel',
      name: `Woven Gold ${modelCode}`,
      brand: { _type: 'reference', _ref: brand._id },
      category: 'bathroom-faucets',
      subCategory: collection.label,
      order,
      ...(description.trim() && { description: description.trim() }),
      ...(features.length > 0 && { features }),
      ...(assetId && {
        image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
      }),
    }

    try {
      await client.createOrReplace(doc)
      console.log(`  ✓ ${doc.name} (${docId})`)
      totalCreated++
      order += 10
    } catch (err) {
      console.error(`  ✗ Failed: ${modelCode}: ${err.message}`)
    }
  }
}

console.log(`\nDone! Created ${totalCreated} faucet products.`)
console.log('Visit /products/bathroom-faucets to verify.')
