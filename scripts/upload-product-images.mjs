/**
 * upload-product-images.mjs
 *
 * Uploads locally stored product images to Sanity assets, then patches
 * each product document's `image` and `gallery` fields.
 *
 * Covers:
 *   - MagicFalls waterfalls  (4 products, 1 image each)
 *   - Swimming Pool nozzles  (8 products, 2–3 images each → card image + gallery)
 *   - Sofpour pressure pumps (3 products, 1 image each — IDs still under pnb-kitchenmate)
 *
 * Usage:
 *   node --env-file=.env.local scripts/upload-product-images.mjs
 *
 * After a successful run, remove the corresponding entries from:
 *   lib/productImages.ts
 *   lib/productGalleries.ts
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../public/pics')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// ── Product definitions ────────────────────────────────────────────────────
//
// `id`      — Sanity document _id (or null to resolve by name)
// `name`    — product name in Sanity (used to look up _id when id is null)
// `image`   — path relative to public/pics/ — used as the main card image
// `gallery` — additional images for the detail page carousel (optional)

const PRODUCTS = [
  // ── MagicFalls waterfalls ──────────────────────────────────────────────
  {
    id: 'productModel-magicfalls-0',
    image: 'Magicfalls/sheet waterfall.jpg',
  },
  {
    id: 'productModel-magicfalls-1',
    image: 'Magicfalls/arc sheet waterfall.jpg',
  },
  {
    id: 'productModel-magicfalls-2',
    image: 'Magicfalls/rainfall waterfall.jpg',
  },
  {
    id: 'productModel-magicfalls-3',
    image: 'Magicfalls/arc rainfall waterfall.jpg',
  },

  // ── Swimming Pool nozzles (IDs resolved by name at runtime) ───────────
  {
    name: 'Bell Nozzle',
    image: 'Swimming Pool systems/Bell Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Bell Nozzle/pic1.jpg',
      'Swimming Pool systems/Bell Nozzle/pic2.jpg',
    ],
  },
  {
    name: 'Cascade Nozzle',
    image: 'Swimming Pool systems/Cascade Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Cascade Nozzle/pic1.jpg',
      'Swimming Pool systems/Cascade Nozzle/pic2.jpg',
    ],
  },
  {
    name: 'Clear Stream Nozzle',
    image: 'Swimming Pool systems/Clear Stream Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Clear Stream Nozzle/pic1.jpg',
      'Swimming Pool systems/Clear Stream Nozzle/pic2.jpg',
    ],
  },
  {
    name: 'Compact Rainbow Jet',
    image: 'Swimming Pool systems/Compact Rainbow Jet/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Compact Rainbow Jet/pic1.jpg',
      'Swimming Pool systems/Compact Rainbow Jet/pic2.jpg',
    ],
  },
  {
    name: 'Fan Jet Nozzle',
    // pic2 is the higher-quality image for the card
    image: 'Swimming Pool systems/Fan Jet Nozzle/pic2.jpg',
    gallery: [
      'Swimming Pool systems/Fan Jet Nozzle/pic2.jpg',
      'Swimming Pool systems/Fan Jet Nozzle/pic1.jpg',
    ],
  },
  {
    name: 'Finger Jet Nozzle',
    image: 'Swimming Pool systems/Finger Jet Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Finger Jet Nozzle/pic1.jpg',
      'Swimming Pool systems/Finger Jet Nozzle/pic2.jpg',
    ],
  },
  {
    name: 'Foam Nozzle',
    image: 'Swimming Pool systems/Foam Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Foam Nozzle/pic1.jpg',
      'Swimming Pool systems/Foam Nozzle/pic2.jpg',
      'Swimming Pool systems/Foam Nozzle/pic3jpg.jpg',
    ],
  },
  {
    name: 'Rotating Nozzle',
    image: 'Swimming Pool systems/Rotating Nozzle/pic1.jpg',
    gallery: [
      'Swimming Pool systems/Rotating Nozzle/pic1.jpg',
      'Swimming Pool systems/Rotating Nozzle/pic2.jpg',
    ],
  },

  // ── Sofpour pressure pumps (IDs still under pnb-kitchenmate namespace) ─
  {
    id: 'productModel-pnb-kitchenmate-5',
    image: 'Sofpour pumps images/Residential premium.jpg',
  },
  {
    id: 'productModel-pnb-kitchenmate-6',
    image: 'Sofpour pumps images/Domestic economy.jpg',
  },
  {
    id: 'productModel-pnb-kitchenmate-7',
    image: 'Sofpour pumps images/Domestic pump.jpg',
  },
  // productModel-pnb-kitchenmate-8 (Submersible Transfer Pump) — no image available yet
]

// ── Helpers ────────────────────────────────────────────────────────────────

function extOf(filePath) {
  return path.extname(filePath).replace('.', '') || 'jpg'
}

function mimeOf(ext) {
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

async function uploadFile(relPath) {
  const absPath = path.join(PUBLIC_DIR, relPath)
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`)
  }
  const buffer = fs.readFileSync(absPath)
  const filename = path.basename(relPath)
  const ext = extOf(relPath)
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: mimeOf(ext),
  })
  return asset._id
}

function imageRef(assetId, key) {
  return {
    _type: 'image',
    ...(key && { _key: key }),
    asset: { _type: 'reference', _ref: assetId },
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Product Image Uploader ===\n')

  // Resolve name → _id for products without a hardcoded id
  const needNames = PRODUCTS.filter((p) => !p.id && p.name).map((p) => p.name)
  const idByName = {}
  if (needNames.length > 0) {
    console.log('Resolving product IDs by name...')
    const docs = await client.fetch(
      `*[_type == "productModel" && name in $names]{ _id, name }`,
      { names: needNames }
    )
    for (const doc of docs) idByName[doc.name] = doc._id
    for (const name of needNames) {
      if (!idByName[name]) {
        console.warn(`  ⚠ Could not find product: "${name}" — skipping`)
      } else {
        console.log(`  ✓ ${name} → ${idByName[name]}`)
      }
    }
    console.log()
  }

  let ok = 0
  let fail = 0

  for (const p of PRODUCTS) {
    const docId = p.id ?? idByName[p.name]
    const label = p.name ?? p.id

    if (!docId) {
      console.log(`SKIP  ${label} (no _id resolved)`)
      fail++
      continue
    }

    process.stdout.write(`  ${label}... `)

    try {
      // Upload main image
      const mainAssetId = await uploadFile(p.image)
      const patch = client.patch(docId).set({ image: imageRef(mainAssetId) })

      // Upload gallery images (if any)
      if (p.gallery && p.gallery.length > 0) {
        const galleryItems = []
        for (let i = 0; i < p.gallery.length; i++) {
          const assetId = await uploadFile(p.gallery[i])
          galleryItems.push(imageRef(assetId, `gallery-${i}`))
        }
        patch.set({ gallery: galleryItems })
      }

      await patch.commit()
      console.log('✓')
      ok++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      fail++
    }
  }

  console.log(`\n✅ Done — ${ok} patched, ${fail} failed`)
  console.log('\nNext step: remove the corresponding entries from')
  console.log('  lib/productImages.ts')
  console.log('  lib/productGalleries.ts')
  console.log('(Sanity now serves these images via model.imageSrc / model.gallery)')
}

main().catch(console.error)
