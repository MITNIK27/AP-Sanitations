// Fixes the faucet seeding — faucet pages are collection pages, not individual product pages.
// Fetches the main faucets listing page image per collection and creates proper entries.
//
// Usage:
//   node --env-file=.env.local scripts/fix-wg-faucets.mjs

import { createClient } from '@sanity/client'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://www.wovengoldindia.com'
const PICS_DIR = resolve(__dirname, '../pics/WG/Faucets')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

// Faucet collections with their listing page URLs
const FAUCET_COLLECTIONS = [
  { name: 'Armonia',    slug: 'armonia',    url: '/armonia.php',    subCategory: 'Armonia'    },
  { name: 'Goccia',     slug: 'goccia',     url: '/goccia.php',     subCategory: 'Goccia'     },
  { name: 'Prestigio',  slug: 'prestigio',  url: '/prestigio.php',  subCategory: 'Prestigio'  },
  { name: 'Eclettica',  slug: 'eclettica',  url: '/eclettica.php',  subCategory: 'Eclettica'  },
  { name: 'Eleganza',   slug: 'eleganza',   url: '/eleganza.php',   subCategory: 'Eleganza'   },
  { name: 'Stile Vivo', slug: 'stile-vivo', url: '/stilevivo.php',  subCategory: 'Stile Vivo' },
  { name: 'Moderna',    slug: 'moderna',    url: '/moderna.php',    subCategory: 'Moderna'    },
  { name: "D'Aqua",     slug: 'daqua',      url: '/daqua.php',      subCategory: "D'Aqua"     },
  { name: 'Opulenza',   slug: 'opulenza',   url: '/opulenza.php',   subCategory: 'Opulenza'   },
  { name: 'Savoy',      slug: 'savoy',      url: '/savoy.php',      subCategory: 'Savoy'      },
  { name: 'Virtus',     slug: 'virtus',     url: '/virtus.php',     subCategory: 'Virtus'     },
  { name: 'Splendor',   slug: 'splendor',   url: '/splendor.php',   subCategory: 'Splendor'   },
]

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AP-Sanitations-Scraper/1.0)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

function extractFirstProductImage(html, pageUrl) {
  // Look for product images in the asset paths (not navigation/logo images)
  const regex = /<img[^>]+src=["']([^"']*assets\/images[^"']+)["']/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    const src = m[1]
    if (src.includes('logo') || src.includes('banner') || src.includes('icon')) continue
    return src.startsWith('http') ? src : new URL(src, pageUrl).href
  }
  return null
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AP-Sanitations-Scraper/1.0)' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok || !res.body) return false
    const stream = createWriteStream(destPath)
    await pipeline(res.body, stream)
    return true
  } catch { return false }
}

// Get Woven Gold brand
const brand = await client.fetch(
  `*[_type == "brand" && id.current == "woven-gold"][0]{ _id, name }`,
)
if (!brand) { console.error('Woven Gold brand not found'); process.exit(1) }
console.log(`✓ Brand: ${brand.name}\n`)

// First delete the bad faucet docs (all named "Calypso")
const badIds = await client.fetch(
  `*[_type == "productModel" && category == "bathroom-faucets"]._id`
)
for (const id of badIds) {
  await client.delete(id)
}
console.log(`Deleted ${badIds.length} bad faucet documents\n`)

let created = 0

for (const [i, col] of FAUCET_COLLECTIONS.entries()) {
  const pageUrl = BASE_URL + col.url
  const html = await fetchHtml(pageUrl)

  let assetId = null

  if (html) {
    const imgUrl = extractFirstProductImage(html, pageUrl)
    if (imgUrl) {
      const folderPath = resolve(PICS_DIR, col.slug)
      if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })
      const ext = imgUrl.split('?')[0].split('.').pop()?.replace(/[^a-z]/g, '') || 'jpg'
      const destPath = resolve(folderPath, `${col.slug}-1.${ext}`)

      const ok = await downloadImage(imgUrl, destPath)
      if (ok) {
        try {
          const { createReadStream } = await import('fs')
          const stream = createReadStream(destPath)
          const asset = await client.assets.upload('image', stream, { filename: `${col.slug}-1.${ext}` })
          assetId = asset._id
        } catch (err) {
          console.log(`  ⚠ Image upload failed for ${col.name}: ${err.message}`)
        }
      }
    }
  }

  const docId = `productModel-wg-bathroom-faucets-${col.slug}`
  const doc = {
    _id: docId,
    _type: 'productModel',
    name: `Woven Gold ${col.name} Collection`,
    brand: { _type: 'reference', _ref: brand._id },
    category: 'bathroom-faucets',
    subCategory: col.subCategory,
    order: (i + 1) * 10,
    description: `The Woven Gold ${col.name} collection — European-designed basin mixers, single-lever faucets, and bathroom fittings crafted for luxury interiors.`,
    features: [
      'European design language',
      'Available in chrome, matt black, brushed gold, and rose gold finishes',
      'Single-lever and thermostatic variants',
      'Ceramic disc cartridge for smooth operation',
    ],
    ...(assetId && {
      image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
    }),
  }

  await client.createOrReplace(doc)
  console.log(`  ✓ Woven Gold ${col.name} Collection${assetId ? ' (with image)' : ' (no image)'} → ${docId}`)
  created++
}

console.log(`\nDone! ${created} faucet collection products created.`)
