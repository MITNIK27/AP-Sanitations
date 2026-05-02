/**
 * Upload Morzze category catalogue PDFs to Sanity, patch the brand catalogues
 * array, and attach the relevant PDF to each product's documents field.
 *
 * Usage:
 *   node --env-file=.env.local scripts/upload-morzze-catalogues.mjs [--dry-run] [--force]
 *
 * --dry-run  Print what would happen without writing anything to Sanity.
 * --force    Re-patch products that already have documents set.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE   = process.argv.includes('--force')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const CATALOGUES_DIR = path.join(__dirname, '../pics/Morzze catalogues')

// ─── PDF catalogue definitions ──────────────────────────────────────────────

const PDF_MAP = [
  { file: 'MorzzeStainlessSteelSink.pdf',  key: 'steel-sink',     label: 'Stainless Steel Sink'  },
  { file: 'MorzzeGraniteSink.pdf',         key: 'granite-sink',   label: 'Granite Sink'          },
  { file: 'MorzzeKitchenFaucet.pdf',       key: 'kitchen-faucet', label: 'Kitchen Faucet'        },
  { file: 'FoodWasteDisposer.pdf',         key: 'fwd',            label: 'Food Waste Disposer'   },
  { file: 'MorzzeWashBasin.pdf',           key: 'wash-basin',     label: 'Granite Wash Basin'    },
  { file: 'MorzzeBathroomFaucet.pdf',      key: 'bath-faucet',    label: 'Bathroom Faucet'       },
  { file: 'MorzzeAirTap.pdf',              key: 'air-tap',        label: 'Air Tap'               },
  { file: 'MorzzeElectricTowelWarmer.pdf', key: 'towel-warmer',   label: 'Electric Towel Warmer' },
  { file: 'MorzzeFloorDrainer.pdf',        key: 'floor-drainer',  label: 'Floor Drainer'         },
]

// ─── Product ID prefix → catalogue key ──────────────────────────────────────
// More-specific prefixes must appear before less-specific ones (msd-6 before msd-).

const PRODUCT_PDF_PREFIXES = [
  ['productModel-morzze-aura-',   'steel-sink'    ],
  ['productModel-morzze-vertex-', 'granite-sink'  ],
  ['productModel-morzze-mkf-',    'kitchen-faucet'],
  ['productModel-morzze-mkfg-',   'kitchen-faucet'],
  ['productModel-morzze-mkcf-',   'kitchen-faucet'],
  ['productModel-morzze-mkff-',   'kitchen-faucet'],
  ['productModel-morzze-mfwd-',   'fwd'           ],
  ['productModel-morzze-mbb-',    'wash-basin'    ],
  ['productModel-morzze-mbf-',    'bath-faucet'   ],
  ['productModel-morzze-mat-',    'air-tap'       ],
  ['productModel-morzze-mtw-',    'towel-warmer'  ],
  ['productModel-morzze-mbd-',    'floor-drainer' ],
  ['productModel-morzze-msd-6',   'floor-drainer' ],  // MSD-601/602/603 vs MSD-21/22/23 (accessories)
  // MSD-21/22/23, MDA, MSS, MGS, MSSC, MHS → no catalogue PDF
]

function getPdfKeyForProduct(productId) {
  for (const [prefix, key] of PRODUCT_PDF_PREFIXES) {
    if (productId.startsWith(prefix)) return key
  }
  return null
}

// ─── Phase 1: Upload PDFs ────────────────────────────────────────────────────

async function uploadPdfs() {
  console.log('\n── Phase 1: Uploading PDFs ──────────────────────────────────')
  const assetMap = {}

  for (const entry of PDF_MAP) {
    const filePath = path.join(CATALOGUES_DIR, entry.file)

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠  Not found, skipping: ${entry.file}`)
      continue
    }

    console.log(`  ${entry.label} (${entry.file})`)

    if (DRY_RUN) {
      assetMap[entry.key] = `dry-run-asset-${entry.key}`
      console.log(`    [dry-run] would upload`)
      continue
    }

    const asset = await client.assets.upload(
      'file',
      fs.createReadStream(filePath),
      {
        filename: entry.file,
        contentType: 'application/pdf',
        source: { id: `morzze-cat-${entry.key}`, name: `morzze-cat-${entry.key}` },
      }
    )
    assetMap[entry.key] = asset._id
    console.log(`    ✓ ${asset._id}`)
  }

  return assetMap
}

// ─── Phase 2: Patch brand catalogues array ───────────────────────────────────

async function patchBrandCatalogues(assetMap) {
  console.log('\n── Phase 2: Patching brand catalogues ───────────────────────')

  const brand = await client.fetch(
    `*[_type == "brand" && id.current == "morzze"][0]{ _id }`,
    {}
  )

  if (!brand?._id) {
    console.error('  ✗ Morzze brand document not found in Sanity')
    return
  }

  const catalogues = PDF_MAP
    .filter(({ key }) => assetMap[key])
    .map(({ key, label }) => ({
      _key: key,
      label,
      file: { _type: 'file', asset: { _type: 'reference', _ref: assetMap[key] } },
    }))

  if (DRY_RUN) {
    console.log(`  [dry-run] would patch brand ${brand._id} with ${catalogues.length} catalogues`)
    return
  }

  await client.patch(brand._id).set({ catalogues }).commit()
  console.log(`  ✓ Brand ${brand._id} — ${catalogues.length} catalogues set`)
}

// ─── Phase 3: Patch product documents ────────────────────────────────────────

async function patchProductDocuments(assetMap) {
  console.log('\n── Phase 3: Patching product documents ──────────────────────')

  const products = await client.fetch(
    `*[_type == "productModel" && brand._ref == "brand-morzze"]{ _id, "hasDocs": defined(documents) && count(documents) > 0 }`,
    {}
  )

  console.log(`  Found ${products.length} Morzze products`)

  let patched = 0
  let skippedNoPdf = 0
  let skippedExists = 0

  for (const product of products) {
    const pdfKey = getPdfKeyForProduct(product._id)

    if (!pdfKey || !assetMap[pdfKey]) {
      skippedNoPdf++
      continue
    }

    if (product.hasDocs && !FORCE) {
      skippedExists++
      continue
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] ${product._id} → ${pdfKey}`)
      patched++
      continue
    }

    await client.patch(product._id).set({
      documents: [{
        _key: 'cat-0',
        label: 'Product Catalogue',
        file: { _type: 'file', asset: { _type: 'reference', _ref: assetMap[pdfKey] } },
      }],
    }).commit()

    patched++
  }

  console.log(`\n  Patched:                       ${patched}`)
  console.log(`  Skipped (no PDF for category): ${skippedNoPdf}`)
  console.log(`  Skipped (already had docs):    ${skippedExists}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== Morzze Catalogue Upload${DRY_RUN ? ' [DRY RUN]' : ''}${FORCE ? ' [FORCE]' : ''} ===`)

  const assetMap = await uploadPdfs()
  await patchBrandCatalogues(assetMap)
  await patchProductDocuments(assetMap)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
