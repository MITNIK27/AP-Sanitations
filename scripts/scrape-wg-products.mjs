// WG Website Scraper — Downloads product images and extracts product data
// from wovengoldindia.com for Shower Systems, Bathtubs, and Bathroom Faucets.
//
// Downloads images to:
//   pics/WG/Showers/{SubCategorySlug}/{ProductName}/
//   pics/WG/Bathtubs/{SubCategorySlug}/{ProductName}/
//   pics/WG/Faucets/{SubCategorySlug}/{ProductName}/
//
// Outputs JSON files:
//   scripts/output/wg-scrape-shower-systems.json
//   scripts/output/wg-scrape-bathtubs.json
//   scripts/output/wg-scrape-bathroom-faucets.json
//
// Usage:
//   node scripts/scrape-wg-products.mjs

import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PICS_DIR = resolve(__dirname, '../pics/WG')
const OUTPUT_DIR = resolve(__dirname, 'output')
const BASE_URL = 'https://www.wovengoldindia.com'

// ── Sub-category definitions ───────────────────────────────────────────────

const SHOWER_SUB_CATS = [
  { url: '/multifunctional-rain-shower.php', subCategory: 'Multifunction Shower',  slug: 'multifunction' },
  { url: '/single-flow-shower.php',          subCategory: 'Single Flow Shower',    slug: 'single-flow' },
  { url: '/body-jets.php',                   subCategory: 'Body Jets',             slug: 'body-jets' },
  { url: '/shower-panels.php',               subCategory: 'Shower Panel',          slug: 'shower-panel' },
  { url: '/diverters-mixers-shower.php',     subCategory: 'Diverters & Mixer',     slug: 'diverters-mixer' },
  { url: '/multifunctional-steam-shower.php',subCategory: 'Steam Shower',          slug: 'steam-shower' },
  { url: '/sliding-shower.php',              subCategory: 'Sliding Enclosure',     slug: 'sliding-enclosure' },
  { url: '/openable-shower.php',             subCategory: 'Openable Enclosure',    slug: 'openable-enclosure' },
]

const BATHTUB_SUB_CATS = [
  { url: '/rectangular-tub.php',       subCategory: 'Rectangular Tub',          slug: 'rectangular-tub' },
  { url: '/round-tub.php',             subCategory: 'Round Tub',                slug: 'round-tub' },
  { url: '/corner-tub.php',            subCategory: 'Corner Tub',               slug: 'corner-tub' },
  { url: '/oval-tub.php',              subCategory: 'Oval Tub',                 slug: 'oval-tub' },
  { url: '/rectangular-whirlpool.php', subCategory: 'Rectangular Whirlpool',    slug: 'rectangular-whirlpool' },
  { url: '/round-whirlpool.php',       subCategory: 'Round Whirlpool',          slug: 'round-whirlpool' },
  { url: '/corner-whirlpool.php',      subCategory: 'Corner Whirlpool',         slug: 'corner-whirlpool' },
  { url: '/special-shape-whirlpool.php',subCategory: 'Special Shape Whirlpool', slug: 'special-shape-whirlpool' },
  { url: '/freestanding-bath.php',     subCategory: 'Freestanding',             slug: 'freestanding' },
]

const FAUCET_SUB_CATS = [
  { url: '/armonia.php',    subCategory: 'Armonia',    slug: 'armonia' },
  { url: '/goccia.php',     subCategory: 'Goccia',     slug: 'goccia' },
  { url: '/prestigio.php',  subCategory: 'Prestigio',  slug: 'prestigio' },
  { url: '/eclettica.php',  subCategory: 'Eclettica',  slug: 'eclettica' },
  { url: '/eleganza.php',   subCategory: 'Eleganza',   slug: 'eleganza' },
  { url: '/stilevivo.php',  subCategory: 'Stile Vivo', slug: 'stile-vivo' },
  { url: '/moderna.php',    subCategory: 'Moderna',    slug: 'moderna' },
  { url: '/daqua.php',      subCategory: "D'Aqua",     slug: 'daqua' },
  { url: '/opulenza.php',   subCategory: 'Opulenza',   slug: 'opulenza' },
  { url: '/savoy.php',      subCategory: 'Savoy',      slug: 'savoy' },
  { url: '/virtus.php',     subCategory: 'Virtus',     slug: 'virtus' },
  { url: '/splendor.php',   subCategory: 'Splendor',   slug: 'splendor' },
]

const CATEGORIES = [
  { slug: 'shower-systems',   folder: 'Showers',  subCats: SHOWER_SUB_CATS  },
  { slug: 'bathtubs',         folder: 'Bathtubs', subCats: BATHTUB_SUB_CATS },
  { slug: 'bathroom-faucets', folder: 'Faucets',  subCats: FAUCET_SUB_CATS  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AP-Sanitations-Scraper/1.0)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractProductLinks(html, basePageUrl) {
  // Find all <a href="...php"> relative links on the listing page
  const links = []
  const regex = /<a\s+[^>]*href=["']([^"']+\.php)["'][^>]*>/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    const href = m[1]
    // Skip navigation links (absolute, anchors, or same-page links)
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('/')) continue
    // Only product paths (contain a folder separator or are simple name.php)
    if (href.includes('..') || href.startsWith('?')) continue
    const full = new URL(href, basePageUrl).href
    if (!links.includes(full)) links.push(full)
  }
  return links
}

function extractProductName(html) {
  // Try <h3> or <h2> inside product detail content
  let m = html.match(/<h3[^>]*>\s*([^<]{2,60})\s*<\/h3>/i)
  if (m) return m[1].trim()
  m = html.match(/<h2[^>]*>\s*([^<]{2,60})\s*<\/h2>/i)
  if (m) return m[1].trim()
  return null
}

function extractSlideImages(html) {
  // <img class="mySlides" src="...">
  const imgs = []
  const regex = /<img[^>]+class=["'][^"']*mySlides[^"']*["'][^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    imgs.push(m[1])
  }
  // Also try src before class
  const regex2 = /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*mySlides[^"']*["']/gi
  while ((m = regex2.exec(html)) !== null) {
    if (!imgs.includes(m[1])) imgs.push(m[1])
  }
  return imgs
}

function extractListingImages(html) {
  // On listing pages, find first image per product link block
  const imgs = []
  const regex = /<img[^>]+src=["']([^"']+(?:assets\/images)[^"']+)["']/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    const src = m[1]
    if (!imgs.includes(src)) imgs.push(src)
  }
  return imgs
}

function extractFeatures(html) {
  const features = []
  // <strong>Label:</strong> <li>Value</li> or <strong>Label:</strong> Value
  const regex = /<strong>([^<]+):<\/strong>\s*(?:<li>([^<]+)<\/li>|([^<\n]{2,80}))/gi
  let m
  while ((m = regex.exec(html)) !== null) {
    const key = m[1].trim()
    const val = (m[2] || m[3] || '').trim()
    if (val) features.push(`${key}: ${val}`)
  }
  return features.slice(0, 8)
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
  } catch {
    return false
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

for (const cat of CATEGORIES) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`Category: ${cat.slug}`)
  console.log('─'.repeat(60))

  const allProducts = []

  for (const sub of cat.subCats) {
    const listingUrl = BASE_URL + sub.url
    console.log(`\n  Sub-category: ${sub.subCategory}`)
    console.log(`  Fetching: ${listingUrl}`)

    const html = await fetchHtml(listingUrl)
    if (!html) {
      console.log(`  ⚠ Could not fetch ${listingUrl} — skipping`)
      continue
    }

    const productLinks = extractProductLinks(html, listingUrl)
    console.log(`  Found ${productLinks.length} product links`)

    if (productLinks.length === 0) {
      // Listing page may itself be the product page — try to extract directly
      const listingImages = extractListingImages(html)
      if (listingImages.length > 0) {
        console.log(`  (no sub-pages — treating listing as product with ${listingImages.length} images)`)
        const name = `Woven Gold ${sub.subCategory}`
        const nameSlug = slugify(name)
        const folderPath = resolve(PICS_DIR, cat.folder, sub.slug, nameSlug)
        if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })

        const downloadedImages = []
        for (const imgSrc of listingImages.slice(0, 6)) {
          const imgUrl = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, BASE_URL).href
          const ext = imgUrl.split('?')[0].split('.').pop() || 'jpg'
          const filename = `image-${downloadedImages.length + 1}.${ext}`
          const destPath = resolve(folderPath, filename)
          const ok = await downloadImage(imgUrl, destPath)
          if (ok) downloadedImages.push(destPath)
        }

        allProducts.push({
          name,
          subCategory: sub.subCategory,
          category: cat.slug,
          description: '',
          features: extractFeatures(html),
          localImages: downloadedImages,
        })
      }
      continue
    }

    for (const productUrl of productLinks) {
      const productHtml = await fetchHtml(productUrl)
      if (!productHtml) continue

      const rawName = extractProductName(productHtml)
      if (!rawName) continue

      const name = `Woven Gold ${rawName}`
      const nameSlug = slugify(rawName)
      const folderPath = resolve(PICS_DIR, cat.folder, sub.slug, nameSlug)
      if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })

      // Extract mySlides images first, fallback to listing images
      let imgSrcs = extractSlideImages(productHtml)
      if (imgSrcs.length === 0) imgSrcs = extractListingImages(productHtml)

      const downloadedImages = []
      for (const imgSrc of imgSrcs.slice(0, 6)) {
        const imgUrl = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, productUrl).href
        const ext = imgUrl.split('?')[0].split('.').pop()?.replace(/[^a-z]/g, '') || 'jpg'
        const filename = `${nameSlug}-${downloadedImages.length + 1}.${ext}`
        const destPath = resolve(folderPath, filename)
        if (!existsSync(destPath)) {
          const ok = await downloadImage(imgUrl, destPath)
          if (ok) {
            downloadedImages.push(destPath)
            process.stdout.write('.')
          }
        } else {
          downloadedImages.push(destPath)
          process.stdout.write('·')
        }
      }

      const features = extractFeatures(productHtml)
      allProducts.push({
        name,
        subCategory: sub.subCategory,
        category: cat.slug,
        description: features.length > 0 ? '' : '',
        features,
        localImages: downloadedImages,
      })

      console.log(`\n    ✓ ${name} (${downloadedImages.length} images)`)
    }
  }

  // Write JSON output
  const outPath = resolve(OUTPUT_DIR, `wg-scrape-${cat.slug}.json`)
  writeFileSync(outPath, JSON.stringify(allProducts, null, 2))
  console.log(`\n  ✓ Wrote ${allProducts.length} products to ${outPath}`)
}

console.log('\n\nScraping complete.')
console.log('Review the pics/WG/ folders, then run:')
console.log('  node --env-file=.env.local scripts/seed-wg-scraped.mjs shower-systems Showers')
console.log('  node --env-file=.env.local scripts/seed-wg-scraped.mjs bathtubs Bathtubs')
console.log('  node --env-file=.env.local scripts/seed-wg-scraped.mjs bathroom-faucets Faucets')
