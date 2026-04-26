// Cleans up the scraped WG product JSON files by removing:
//   - Entries with 0 images (navigation links, footer links, etc.)
//   - Entries with invalid names (HTML entities, generic nav text)
//   - Duplicate names within the same sub-category
//
// Usage:
//   node scripts/clean-wg-scrape.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = resolve(__dirname, 'output')

// Names that clearly aren't products (from WG site navigation/footer)
const INVALID_NAME_PATTERNS = [
  /get in touch/i,
  /showroom address/i,
  /mobile number/i,
  /posted your message/i,
  /see what we can do/i,
  /new technologies/i,
  /therapy with the flow/i,
  /enter your/i,
  /&nbsp;/,
  /catalogue/i,
  /^\s*$/,
  /^woven gold calypso$/i,  // SPA whirlpool tub appearing in nav on all WG pages
]

// Patterns that indicate corrupted/FAQ features (not real product specs)
const FAQ_FEATURE_PATTERNS = [
  /^Ans:/i,
  /^Q:/i,
  /^A:/i,
  /whirlpool bath/i,
  /jacuzzi/i,
]

function cleanFeatures(features) {
  if (!Array.isArray(features)) return []
  return features.filter(f =>
    typeof f === 'string' &&
    f.trim().length > 0 &&
    !FAQ_FEATURE_PATTERNS.some(rx => rx.test(f))
  )
}

function isValidProduct(p) {
  // Must have at least 1 downloaded image
  if (!Array.isArray(p.localImages) || p.localImages.length === 0) return false
  // Name must not match invalid patterns
  if (INVALID_NAME_PATTERNS.some(rx => rx.test(p.name))) return false
  // Name must be reasonable length (2–80 chars after trimming "Woven Gold ")
  const shortName = p.name.replace(/^Woven Gold\s+/i, '').trim()
  if (shortName.length < 2 || shortName.length > 80) return false
  return true
}

const CATEGORIES = ['shower-systems', 'bathtubs', 'bathroom-faucets']

for (const cat of CATEGORIES) {
  const jsonPath = resolve(OUTPUT_DIR, `wg-scrape-${cat}.json`)
  if (!existsSync(jsonPath)) {
    console.log(`  ⚠ ${jsonPath} not found — skipping`)
    continue
  }

  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  const before = raw.length

  // Filter to valid products only
  const valid = raw.filter(isValidProduct)

  // Deduplicate within each sub-category (keep first occurrence)
  const seen = new Set()
  const deduped = valid.filter(p => {
    const key = `${p.subCategory ?? ''}||${p.name.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Clean corrupted features on each entry
  for (const p of deduped) {
    p.features = cleanFeatures(p.features)
  }

  const after = deduped.length
  writeFileSync(jsonPath, JSON.stringify(deduped, null, 2))

  console.log(`${cat}: ${before} → ${after} products (removed ${before - after} invalid/duplicate entries)`)

  // Print summary by sub-category
  const bySub = {}
  for (const p of deduped) {
    const sub = p.subCategory ?? 'Other'
    bySub[sub] = (bySub[sub] ?? 0) + 1
  }
  for (const [sub, count] of Object.entries(bySub)) {
    console.log(`  ${sub}: ${count}`)
  }
  console.log()
}
