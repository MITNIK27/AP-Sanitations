// Re-fetches WG product detail pages to extract features and auto-generate descriptions.
// Fixes two issues:
//   1. Bathtub pages have different HTML (no colon after <strong> labels)
//   2. Some shower products have empty features
//
// Patches Sanity documents with the extracted features + generated description.
//
// Usage:
//   node --env-file=.env.local scripts/patch-wg-features.mjs

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const BASE_URL = 'https://www.wovengoldindia.com'

// ── Sub-category → listing URL ─────────────────────────────────────────────

const LISTING_URLS = {
  // Bathtubs
  'Rectangular Tub':         `${BASE_URL}/rectangular-tub.php`,
  'Round Tub':               `${BASE_URL}/round-tub.php`,
  'Corner Tub':              `${BASE_URL}/corner-tub.php`,
  'Oval Tub':                `${BASE_URL}/oval-tub.php`,
  'Rectangular Whirlpool':   `${BASE_URL}/rectangular-whirlpool.php`,
  'Round Whirlpool':         `${BASE_URL}/round-whirlpool.php`,
  'Corner Whirlpool':        `${BASE_URL}/corner-whirlpool.php`,
  'Special Shape Whirlpool': `${BASE_URL}/special-shape-whirlpool.php`,
  'Freestanding':            `${BASE_URL}/freestanding-bath.php`,
  // Showers
  'Multifunction Shower':    `${BASE_URL}/multifunctional-rain-shower.php`,
  'Single Flow Shower':      `${BASE_URL}/single-flow-shower.php`,
  'Body Jets':               `${BASE_URL}/body-jets.php`,
  'Shower Panel':            `${BASE_URL}/shower-panels.php`,
  'Diverters & Mixer':       `${BASE_URL}/diverters-mixers-shower.php`,
  'Steam Shower':            `${BASE_URL}/multifunctional-steam-shower.php`,
  'Sliding Enclosure':       `${BASE_URL}/sliding-shower.php`,
  'Openable Enclosure':      `${BASE_URL}/openable-shower.php`,
}

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

function extractProductLinksWithNames(html, baseUrl) {
  // Find product links paired with their h3/h4 product names
  const products = []
  // Pattern: <a href="...php">...<h3>NAME</h3> or <h4>NAME</h4>
  const linkRegex = /<a\s+href=["']([^"']+\.php)["'][^>]*>/gi
  let m
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1]
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('?') || href.includes('..')) continue
    // Look for product name in the nearby HTML (within 500 chars after the link)
    const snippet = html.slice(m.index, m.index + 500)
    const nameMatch = snippet.match(/<h[2-4][^>]*>\s*([^<]{2,60})\s*<\/h[2-4]>/i)
    if (nameMatch) {
      const fullUrl = new URL(href, baseUrl).href
      products.push({ url: fullUrl, name: nameMatch[1].trim() })
    }
  }
  return products
}

function extractFeaturesFromPage(html) {
  const features = []
  let m

  // Pattern 1: Bathtub-simple — <p><strong>LABEL</strong><ul><li>VALUE</li></ul>
  const bathtubRegex = /<p>\s*<strong>([^<]+)<\/strong>\s*<ul>\s*<li>([^<]+)<\/li>/gi
  while ((m = bathtubRegex.exec(html)) !== null) {
    const label = m[1].trim().replace(/:$/, '')
    const value = m[2].trim()
    if (label && value) features.push(`${label}: ${value}`)
  }

  // Pattern 2: Shower/inline — <strong>LABEL:</strong> or <strong>LABEL: </strong> then VALUE
  const showerSpecRegex = /<strong>([^<:]+?)\s*:\s*<\/strong>\s*([^<\n]{1,120})/gi
  while ((m = showerSpecRegex.exec(html)) !== null) {
    const label = m[1].trim()
    const value = m[2].trim().replace(/<[^>]+>/g, '').trim()
    if (/^(Ans|Q|A)$/i.test(label)) continue
    if (value && value.length > 1) features.push(`${label}: ${value}`)
  }

  // Pattern 3: Section header → list  — <strong>HEADER</strong></p><ul><li>...</li></ul>
  const sectionRegex = /<strong>([A-Za-z][^<]{2,40}?)<\/strong>\s*(?:<br\s*\/?>)?\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/gi
  while ((m = sectionRegex.exec(html)) !== null) {
    const header = m[1].trim().replace(/:$/, '')
    const listHtml = m[2]
    const items = [...listHtml.matchAll(/<li>([^<]{2,120})<\/li>/gi)].map(li => li[1].trim())
    if (items.length > 0) features.push(`${header}: ${items[0]}`)
    for (const item of items.slice(1)) features.push(item)
  }

  // Pattern 4: <li> items under <strong>Features:</strong><br>
  const featuresBlockMatch = html.match(/<strong>Features?:<\/strong>\s*<br\s*\/?>\s*<ul>([\s\S]*?)<\/ul>/i)
  if (featuresBlockMatch) {
    const liRegex = /<li>([^<]+)<\/li>/gi
    while ((m = liRegex.exec(featuresBlockMatch[1])) !== null) {
      const val = m[1].trim()
      if (val) features.push(val)
    }
  }

  // Deduplicate and filter junk
  return [...new Set(features)].filter(f =>
    f.length > 2 &&
    !/^(Ans:|Q:|A:)/i.test(f) &&
    !/whirlpool bath/i.test(f)
  ).slice(0, 10)
}

function generateDescription(name, subCategory, features) {
  if (features.length === 0) return ''
  // Auto-generate description from features
  const shortName = name.replace(/^Woven Gold\s+/i, '').trim()
  const specParts = features.slice(0, 4).map(f => {
    // "Size: 1830 x 762 x 420 mm" → keep as-is
    return f
  })
  return `Woven Gold ${shortName} — ${subCategory}. ${specParts.join('. ')}.`
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Build product URL map per sub-category ─────────────────────────────────

console.log('Building product URL map from listing pages...\n')
const urlMap = new Map() // key: "subCategory||productNameLower" → productPageUrl

const uniqueSubCats = [...new Set(Object.keys(LISTING_URLS))]
for (const subCat of uniqueSubCats) {
  const listingUrl = LISTING_URLS[subCat]
  const html = await fetchHtml(listingUrl)
  if (!html) {
    console.log(`  ⚠ Could not fetch listing for ${subCat}`)
    continue
  }
  const products = extractProductLinksWithNames(html, listingUrl)
  for (const { url, name } of products) {
    const key = `${subCat}||${name.toLowerCase()}`
    if (!urlMap.has(key)) urlMap.set(key, url)
  }
  console.log(`  ${subCat}: found ${products.length} product links`)
}

// ── Process each category JSON ─────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'shower-systems', file: 'wg-scrape-shower-systems.json' },
  { slug: 'bathtubs',       file: 'wg-scrape-bathtubs.json' },
]

let totalPatched = 0
let totalSkipped = 0

for (const cat of CATEGORIES) {
  const jsonPath = resolve(__dirname, 'output', cat.file)
  const products = JSON.parse(readFileSync(jsonPath, 'utf-8'))

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Category: ${cat.slug} (${products.length} products)`)
  console.log('─'.repeat(50))

  let changed = 0

  for (const p of products) {
    const needsFeatures = !Array.isArray(p.features) || p.features.length === 0

    if (!needsFeatures) {
      // Already has features — just generate description if missing
      if (!p.description && p.features.length > 0) {
        p.description = generateDescription(p.name, p.subCategory ?? '', p.features)
      }
      continue
    }

    // Try to find the product page URL
    const shortName = p.name.replace(/^Woven Gold\s+/i, '').trim()
    // Also try stripping a leading "The " (e.g., "The Tunisia Lounge" → "Tunisia Lounge")
    const shortNameNoThe = shortName.replace(/^The\s+/i, '').trim()
    const key = `${p.subCategory}||${shortName.toLowerCase()}`
    const keyNoThe = `${p.subCategory}||${shortNameNoThe.toLowerCase()}`
    const productUrl = urlMap.get(key) ?? urlMap.get(keyNoThe)

    if (!productUrl) {
      // Try partial match (use shortNameNoThe for better matching)
      const matchBase = shortNameNoThe.toLowerCase()
      let found = null
      for (const [k, v] of urlMap.entries()) {
        if (k.startsWith(`${p.subCategory}||`) && k.includes(matchBase.slice(0, 5))) {
          found = v
          break
        }
      }
      if (!found) {
        totalSkipped++
        continue
      }
    }

    const url = productUrl ?? [...urlMap.entries()].find(([k]) => k.startsWith(`${p.subCategory}||`) && k.includes(shortName.toLowerCase().slice(0, 4)))?.[1]
    if (!url) { totalSkipped++; continue }

    const html = await fetchHtml(url)
    if (!html) { totalSkipped++; continue }

    const features = extractFeaturesFromPage(html)
    if (features.length === 0) { totalSkipped++; continue }

    p.features = features
    p.description = generateDescription(p.name, p.subCategory ?? '', features)

    // Patch in Sanity
    const docId = `productModel-wg-${slugify(cat.slug)}-${slugify(shortName)}`.slice(0, 80)
    try {
      await client.patch(docId).set({ features, description: p.description }).commit()
      process.stdout.write('✓')
      changed++
      totalPatched++
    } catch (err) {
      process.stdout.write('✗')
      totalSkipped++
    }
  }

  // Also patch existing products that have features but no description
  for (const p of products) {
    if (p.description || !p.features?.length) continue
    const shortName = p.name.replace(/^Woven Gold\s+/i, '').trim()
    p.description = generateDescription(p.name, p.subCategory ?? '', p.features)
    const docId = `productModel-wg-${slugify(cat.slug)}-${slugify(shortName)}`.slice(0, 80)
    try {
      await client.patch(docId).set({ description: p.description }).commit()
      process.stdout.write('·')
      changed++
      totalPatched++
    } catch {
      process.stdout.write('×')
    }
  }

  // Save updated JSON
  writeFileSync(jsonPath, JSON.stringify(products, null, 2))
  console.log(`\n  ✓ ${changed} products updated`)
}

console.log(`\nDone! Patched ${totalPatched} products, skipped ${totalSkipped}.`)
