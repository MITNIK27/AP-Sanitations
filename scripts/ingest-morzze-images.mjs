/**
 * ingest-morzze-images.mjs
 *
 * Fetches verified Morzze product image URLs, uploads them to Sanity,
 * and patches each product document with the image reference.
 *
 * Image URLs are hardcoded from direct inspection of morzze.com category
 * pages — NOT guessed. The site has typos in directory names ("kitechen",
 * "steel shink", "Fauce ts"), leading spaces in folder names, and two
 * different base paths (/image/cache/catalog/ vs /image/catalog/), which
 * makes any pattern-based discovery unreliable.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-morzze-images.mjs
 *   node --env-file=.env.local scripts/ingest-morzze-images.mjs --dry-run
 *   node --env-file=.env.local scripts/ingest-morzze-images.mjs --force
 *   node --env-file=.env.local scripts/ingest-morzze-images.mjs --only=A01-201
 *
 * State is persisted to scripts/output/morzze-ingest-state.json after every
 * product so partial runs resume safely without re-uploading successes.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATE_FILE = path.resolve(__dirname, 'output/morzze-ingest-state.json')

// ── Sanity client ──────────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// ── CLI flags ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flags = {
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force'),
  only: (args.find((a) => a.startsWith('--only=')) ?? '').replace('--only=', '') || null,
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BASE = 'https://www.morzze.com'
const CACHE = `${BASE}/image/cache/catalog`
const NOCACHE = `${BASE}/image/catalog`
const RATE_MS = 300
const MIN_BYTES = 8_000

// ── PRODUCT_MAP ────────────────────────────────────────────────────────────────
//
// All image URLs verified by fetching the live morzze.com category and product
// pages (April 2026). The site contains numerous typos in directory names that
// make them impossible to predict — they are reproduced exactly here.
//
// imageUrl: null means no image exists on morzze.com for this product.
// contentType: 'image/png' for the few PNG files, otherwise omit (defaults to jpeg).

const PRODUCT_MAP = [

  // ── Steel Sinks — Aura Series ──────────────────────────────────────────────
  // Base: /image/cache/catalog/morzze%20product/kitechen%20sink/steel%20shink/
  // Note: "kitechen" and "shink" are the site's own typos.
  { id: 'productModel-morzze-aura-a01-201',   modelCode: 'A01-201',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-201/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a01-202',   modelCode: 'A01-202',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-202/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a01-203',   modelCode: 'A01-203',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-203/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a01-204',   modelCode: 'A01-204',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-204/1.png-1200x1200.png`,            contentType: 'image/png' },
  { id: 'productModel-morzze-aura-a02-205',   modelCode: 'A02-205',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A02-205/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a02-206',   modelCode: 'A02-206',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A02-206/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a03-207',   modelCode: 'A03-207',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A03-207/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a01-208lx', modelCode: 'A01-208LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-208LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a01-209lx', modelCode: 'A01-209LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A01-209LX/Artboard%201.jpg-1200x1200.jpg` },
  // A02-210LX: morzze.com shows a generic double-bowl demo image for this model
  { id: 'productModel-morzze-aura-a02-210lx', modelCode: 'A02-210LX', imageUrl: `${CACHE}/demo/Double%20bowl%20kitchen%20sink.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a02-211lx', modelCode: 'A02-211LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A02-211LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a02-212lx', modelCode: 'A02-212LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A02-212LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-aura-a02-213lx', modelCode: 'A02-213LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/steel%20shink/A02-213LX/Artboard%201.jpg-1200x1200.jpg` },

  // ── Granite Sinks — Vertex Series ─────────────────────────────────────────
  // Base: /image/cache/catalog/morzze%20product/kitechen%20sink/Granite%20Sink/
  // Several models have a leading space in their folder name (encoded as %20).
  { id: 'productModel-morzze-vertex-v01-101',   modelCode: 'V01-101',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-101/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-102',   modelCode: 'V01-102',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-102/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-103',   modelCode: 'V01-103',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-103/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-104',   modelCode: 'V01-104',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V01-104/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-105',   modelCode: 'V01-105',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-105/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-106',   modelCode: 'V01-106',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-106/granite1.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-107',   modelCode: 'V02-107',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V02-107/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v03-109',   modelCode: 'V03-109',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V03-109/granite1.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v03-110',   modelCode: 'V03-110',   imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V03-110/granite1.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-111lx', modelCode: 'V01-111LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-111LX/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-112lx', modelCode: 'V01-112LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-112LX/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-113lx', modelCode: 'V01-113LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-113LX/granite301.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v01-114lx', modelCode: 'V01-114LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V01-114LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-115lx', modelCode: 'V02-115LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V02-115LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-116lx', modelCode: 'V02-116LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V02-116LX/granite1.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-117lx', modelCode: 'V02-117LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V02-117LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-118lx', modelCode: 'V02-118LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V02-118LX/granite1.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v02-119lx', modelCode: 'V02-119LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/V02-119LX/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-vertex-v03-120lx', modelCode: 'V03-120LX', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Granite%20Sink/%20V03-120LX/Artboard%201.jpg-1200x1200.jpg` },

  // ── Kitchen Faucets ────────────────────────────────────────────────────────
  // Base: /image/cache/catalog/morzze%20product/faucet/
  // MKFG-30426 and MKCF-30435 use folder names without their prefix letter.
  // MKFF-30436 has a non-standard filename.
  { id: 'productModel-morzze-mkf-30421',   modelCode: 'MKF-30421',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30421/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30422',   modelCode: 'MKF-30422',   imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30422/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30423',   modelCode: 'MKF-30423',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30423/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30424',   modelCode: 'MKF-30424',   imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30424/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30425',   modelCode: 'MKF-30425',   imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30425/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkfg-30426',  modelCode: 'MKFG-30426',  imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30426/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30427',   modelCode: 'MKF-30427',   imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30427/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30428',   modelCode: 'MKF-30428',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30428/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30429',   modelCode: 'MKF-30429',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30429/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30430',   modelCode: 'MKF-30430',   imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30430/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30431',   modelCode: 'MKF-30431',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30431/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30432',   modelCode: 'MKF-30432',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30432/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30433',   modelCode: 'MKF-30433',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30433/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30434',   modelCode: 'MKF-30434',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30434/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkcf-30435',  modelCode: 'MKCF-30435',  imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30435/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkff-30436',  modelCode: 'MKFF-30436',  imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30436/Kitchenfaucet30436.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkff-30437',  modelCode: 'MKFF-30437',  imageUrl: `${CACHE}/morzze%20product/faucet/%20MKF-30437/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkff-30438',  modelCode: 'MKFF-30438',  imageUrl: `${CACHE}/morzze%20product/faucet/MKFF-30438/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30439',   modelCode: 'MKF-30439',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30439/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkcf-30440',  modelCode: 'MKCF-30440',  imageUrl: `${CACHE}/morzze%20product/faucet/MKCF-30440/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkcf-30441',  modelCode: 'MKCF-30441',  imageUrl: `${CACHE}/morzze%20product/faucet/MKCF-30441/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mkf-30442',   modelCode: 'MKF-30442',   imageUrl: `${CACHE}/morzze%20product/faucet/MKF-30442/Artboard%201.jpg-1200x1200.jpg` },

  // ── Food Waste Disposers ───────────────────────────────────────────────────
  // The directory has a trailing space: "Food%20Waste%20Disposer%20"
  // MFD-1102 also has a leading space in its own subfolder.
  { id: 'productModel-morzze-mfd-1101', modelCode: 'MFD-1101', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Food%20Waste%20Disposer%20/MFD-1101/Artboard%202.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mfd-1102', modelCode: 'MFD-1102', imageUrl: `${CACHE}/morzze%20product/kitechen%20sink/Food%20Waste%20Disposer%20/%20MFD-1102/Artboard%202.jpg-1200x1200.jpg` },

  // ── Kitchen Accessories ────────────────────────────────────────────────────
  // These use /image/catalog/ (no cache, no 1200x1200 suffix).
  // The " Kitchen Accessories" directory has a leading space.
  // MSSC-5011's folder on the server is named "MSS-5011" (missing C).
  { id: 'productModel-morzze-msd-21',    modelCode: 'MSD-21',    imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/msd21/MSD21.jpg` },
  { id: 'productModel-morzze-msd-22',    modelCode: 'MSD-22',    imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/%20msd22/MSD22.jpg` },
  { id: 'productModel-morzze-msd-23',    modelCode: 'MSD-23',    imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/%20msd23/MSD23.jpg` },
  { id: 'productModel-morzze-mss-501',   modelCode: 'MSS-501',   imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/MSS-501/Artboard%201.jpg` },
  { id: 'productModel-morzze-mgs-502',   modelCode: 'MGS-502',   imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/MGS-502/Artboard%201.jpg` },
  { id: 'productModel-morzze-mssc-5011', modelCode: 'MSSC-5011', imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/MSS-5011/Artboard%201.jpg` },
  { id: 'productModel-morzze-mhs-31',    modelCode: 'MHS-31',    imageUrl: `${NOCACHE}/morzze%20product/kitechen%20sink/%20Kitchen%20Accessories/MHS-31/Artboard%201.jpg` },
  // MDA-901 through MDA-905: no product pages exist on morzze.com for these drain adapters
  { id: 'productModel-morzze-mda-901', modelCode: 'MDA-901', imageUrl: null },
  { id: 'productModel-morzze-mda-902', modelCode: 'MDA-902', imageUrl: null },
  { id: 'productModel-morzze-mda-903', modelCode: 'MDA-903', imageUrl: null },
  { id: 'productModel-morzze-mda-904', modelCode: 'MDA-904', imageUrl: null },
  { id: 'productModel-morzze-mda-905', modelCode: 'MDA-905', imageUrl: null },

  // ── Granite Wash Basins ────────────────────────────────────────────────────
  // MBB-402 has a leading space in its folder name.
  { id: 'productModel-morzze-mbb-401', modelCode: 'MBB-401', imageUrl: `${CACHE}/morzze%20product/bathroom/basin/MBB-401/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbb-402', modelCode: 'MBB-402', imageUrl: `${CACHE}/morzze%20product/bathroom/basin/%20MBB-402/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbb-403', modelCode: 'MBB-403', imageUrl: `${CACHE}/morzze%20product/bathroom/basin/MBB-403/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbb-404', modelCode: 'MBB-404', imageUrl: `${CACHE}/morzze%20product/bathroom/basin/MBB-404/Artboard%201.jpg-1200x1200.jpg` },

  // ── Bathroom Faucets ───────────────────────────────────────────────────────
  // The site's folder naming here is particularly inconsistent ("Fauce ts", "Fauc e ts").
  // MBF-501 has no subfolder — it sits directly in /Bathroom%20Faucets/.
  // MBF-510 uses a demo/banners path.
  // MBF-507 has a typo in the filename: "Artboar" instead of "Artboard".
  { id: 'productModel-morzze-mbf-501',  modelCode: 'MBF-501',  imageUrl: `${CACHE}/Bathroom%20Faucets/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-501t', modelCode: 'MBF-501T', imageUrl: `${CACHE}/Bathroom%20Faucets/Bathroom%20Faucets%20(501T)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-502',  modelCode: 'MBF-502',  imageUrl: `${CACHE}/Bathroom%20Faucets/Bathroom%20Fauce%20ts%20(502)/Artboard%204.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-503',  modelCode: 'MBF-503',  imageUrl: `${CACHE}/Bathroom%20Faucets/%20Bathroom%20Fauce%20ts%20(503)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-504',  modelCode: 'MBF-504',  imageUrl: `${CACHE}/Bathroom%20Faucets/%20Bathroom%20Fauc%20e%20ts%20(504)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-505',  modelCode: 'MBF-505',  imageUrl: `${CACHE}/Bathroom%20Faucets/%20Bathroom%20Fauce%20ts(505)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-506',  modelCode: 'MBF-506',  imageUrl: `${CACHE}/Bathroom%20Faucets/%20Bathroom%20Fauc%20e%20ts%20(506)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-507',  modelCode: 'MBF-507',  imageUrl: `${CACHE}/Bathroom%20Faucets/507/black/Artboar%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-508',  modelCode: 'MBF-508',  imageUrl: `${CACHE}/Bathroom%20Faucets/508/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-509',  modelCode: 'MBF-509',  imageUrl: `${CACHE}/Bathroom%20Faucets/509/Chrome(509)/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbf-510',  modelCode: 'MBF-510',  imageUrl: `${CACHE}/demo/banners/MBF-510.jpg-1200x1200.jpg` },

  // ── Air Tap ────────────────────────────────────────────────────────────────
  // Uses /image/catalog/ path (no cache).
  { id: 'productModel-morzze-mat-4010', modelCode: 'MAT-4010', imageUrl: `${NOCACHE}/morzze%20product/bathroom/Air%20tap/MAT-4010/Artboard%201.jpg` },

  // ── Towel Warmers ──────────────────────────────────────────────────────────
  { id: 'productModel-morzze-mtw-6040',  modelCode: 'MTW-6040',  imageUrl: `${CACHE}/morzze%20product/bathroom/towel%20warmer/MTW-6040/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mtw-8050',  modelCode: 'MTW-8050',  imageUrl: `${CACHE}/morzze%20product/bathroom/towel%20warmer/MTW-8050/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mtw-11050', modelCode: 'MTW-11050', imageUrl: `${CACHE}/morzze%20product/bathroom/towel%20warmer/MTW-11050/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mtw-12050', modelCode: 'MTW-12050', imageUrl: `${CACHE}/morzze%20product/bathroom/towel%20warmer/MTW-12050/Artboard%201.jpg-1200x1200.jpg` },

  // ── Floor Drainers ─────────────────────────────────────────────────────────
  // Several models have a leading space in their folder name.
  // MBD-606 and MBD-614 use non-standard Artboard numbers.
  // MBD-613 is a PNG with a descriptive filename.
  { id: 'productModel-morzze-msd-601', modelCode: 'MSD-601', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MSD-601/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-msd-602', modelCode: 'MSD-602', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MSD-602/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-msd-603', modelCode: 'MSD-603', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MSD-603/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-604', modelCode: 'MBD-604', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MBD-604/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-605', modelCode: 'MBD-605', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-605/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-606', modelCode: 'MBD-606', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MBD-606/Artboard%202.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-607', modelCode: 'MBD-607', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-607/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-608', modelCode: 'MBD-608', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-608/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-609', modelCode: 'MBD-609', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-609/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-610', modelCode: 'MBD-610', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MBD-610/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-611', modelCode: 'MBD-611', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-611/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-612', modelCode: 'MBD-612', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/%20MBD-612/Artboard%201.jpg-1200x1200.jpg` },
  { id: 'productModel-morzze-mbd-613', modelCode: 'MBD-613', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MBD-613/Morzze%20Floor%20drainer%20mbd-613.png-1200x1200.png`, contentType: 'image/png' },
  { id: 'productModel-morzze-mbd-614', modelCode: 'MBD-614', imageUrl: `${CACHE}/morzze%20product/bathroom/floor_Drainer/MBD-614/Artboard%204.jpg-1200x1200.jpg` },
]

// ── State helpers ──────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }
  catch { return { version: 1, products: {} } }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

// ── HTTP helpers ───────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function fetchBuffer(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url.split('/').slice(-2).join('/')}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < MIN_BYTES) throw new Error(`Image too small (${buf.length} B) — may be a placeholder`)
  return buf
}

// ── Sanity helpers ─────────────────────────────────────────────────────────────

async function alreadyHasImage(docId) {
  const doc = await client.fetch(`*[_id == $id][0]{ "has": defined(image.asset) }`, { id: docId })
  return doc?.has === true
}

async function uploadToSanity(buffer, modelCode, contentType = 'image/jpeg') {
  const ext = contentType === 'image/png' ? 'png' : 'jpg'
  const asset = await client.assets.upload('image', buffer, {
    filename: `morzze-${modelCode}-1200x1200.${ext}`,
    contentType,
    source: { id: `morzze-${modelCode}`, name: `morzze-${modelCode}` },
  })
  return asset._id
}

async function patchProduct(docId, assetId) {
  await client.patch(docId)
    .set({ image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } } })
    .commit()
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID — run with --env-file=.env.local')
    process.exit(1)
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('✗ Missing SANITY_API_WRITE_TOKEN — run with --env-file=.env.local')
    process.exit(1)
  }

  console.log('=== Morzze Image Ingestion ===')
  console.log(`Options: dryRun=${flags.dryRun}  force=${flags.force}  only=${flags.only ?? 'all'}\n`)

  const state = loadState()
  const products = flags.only
    ? PRODUCT_MAP.filter((p) => p.modelCode.toLowerCase() === flags.only.toLowerCase())
    : PRODUCT_MAP

  if (flags.only && products.length === 0) {
    console.error(`✗ No product found for model code: ${flags.only}`)
    process.exit(1)
  }

  const counts = { patched: 0, skipped: 0, noUrl: 0, downloadFail: 0, uploadFail: 0, patchFail: 0 }
  const noUrlList = []

  for (const product of products) {
    const { id, modelCode, imageUrl, contentType } = product
    const stateEntry = state.products[id] ?? {}
    const label = modelCode.padEnd(14)

    // No image exists on the source website
    if (!imageUrl) {
      if (stateEntry.status !== 'no-url-found') {
        state.products[id] = { status: 'no-url-found', modelCode, updatedAt: new Date().toISOString() }
        saveState(state)
      }
      console.log(`  ${label} — no image on morzze.com`)
      noUrlList.push({ id, modelCode })
      counts.noUrl++
      continue
    }

    // Already done — skip unless --force
    if (stateEntry.status === 'done' && !flags.force) {
      console.log(`  ${label} ⏭  already done`)
      counts.skipped++
      continue
    }

    // Dry run: just report what would happen
    if (flags.dryRun) {
      console.log(`  ${label} → ${imageUrl.split('/').slice(-2).join('/')}`)
      continue
    }

    // Sanity document check (Layer 2 duplicate guard)
    if (!flags.force && await alreadyHasImage(id)) {
      console.log(`  ${label} ⏭  Sanity image already set`)
      state.products[id] = { status: 'skipped', modelCode, reason: 'already-has-image', updatedAt: new Date().toISOString() }
      saveState(state)
      counts.skipped++
      continue
    }

    process.stdout.write(`  ${label} downloading... `)
    let buffer
    try {
      await sleep(RATE_MS)
      buffer = await fetchBuffer(imageUrl)
      process.stdout.write(`${Math.round(buffer.length / 1024)} KB  uploading... `)
    } catch (err) {
      process.stdout.write(`✗ ${err.message}\n`)
      state.products[id] = { status: 'failed', modelCode, phase: 'download', error: err.message, imageUrl, updatedAt: new Date().toISOString() }
      saveState(state)
      counts.downloadFail++
      continue
    }

    let assetId
    try {
      assetId = await uploadToSanity(buffer, modelCode, contentType ?? 'image/jpeg')
      process.stdout.write('patching... ')
    } catch (err) {
      process.stdout.write(`✗ upload: ${err.message}\n`)
      state.products[id] = { status: 'failed', modelCode, phase: 'upload', error: err.message, imageUrl, updatedAt: new Date().toISOString() }
      saveState(state)
      counts.uploadFail++
      continue
    }

    try {
      await patchProduct(id, assetId)
      process.stdout.write('✓\n')
      state.products[id] = { status: 'done', modelCode, sanityAssetId: assetId, imageUrl, patchedAt: new Date().toISOString() }
      counts.patched++
    } catch (err) {
      process.stdout.write(`✗ patch: ${err.message}\n`)
      state.products[id] = { status: 'failed', modelCode, phase: 'patch', error: err.message, imageUrl, sanityAssetId: assetId, updatedAt: new Date().toISOString() }
      counts.patchFail++
    }

    saveState(state)
  }

  if (!flags.dryRun) {
    saveState(state)
    console.log(`\nState saved → ${STATE_FILE}\n`)
  }

  const divider = '─'.repeat(50)
  console.log('[Report]')
  console.log(divider)
  console.log(`  ✓ Patched:              ${String(counts.patched).padStart(4)}`)
  console.log(`  ⏭ Skipped (exists):     ${String(counts.skipped).padStart(4)}`)
  console.log(`  — No URL (morzze.com):  ${String(counts.noUrl).padStart(4)}`)
  console.log(`  ✗ Download failed:      ${String(counts.downloadFail).padStart(4)}`)
  console.log(`  ✗ Upload failed:        ${String(counts.uploadFail).padStart(4)}`)
  console.log(`  ✗ Patch failed:         ${String(counts.patchFail).padStart(4)}`)
  console.log(divider)

  if (noUrlList.length > 0) {
    console.log('\nProducts with no image on morzze.com (manual upload via Sanity Studio):')
    for (const { modelCode, id } of noUrlList) {
      console.log(`  - ${modelCode.padEnd(12)} ${id}`)
    }
  }

  if (counts.downloadFail + counts.uploadFail + counts.patchFail > 0) {
    console.log('\nRe-run to retry failed products (state file skips successes automatically).')
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
