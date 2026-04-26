// PDF Text Extraction Script
// Extracts raw text from a PDF catalogue and generates a template JSON for review.
//
// Usage:
//   node scripts/extract-pdf.mjs "C:/Users/Parth/Desktop/anupam.pdf" anupam
//
// Output files (in scripts/output/):
//   [brandSlug]-raw.txt      — raw text per page (review this to find product info)
//   [brandSlug]-products.json — template JSON to fill in (one slot per page)
//
// After filling in the JSON, run:
//   node --env-file=.env.local scripts/seed-products.mjs anupam wellness-spa

import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'

const [,, pdfPath, brandSlug] = process.argv

if (!pdfPath || !brandSlug) {
  console.error('Usage: node scripts/extract-pdf.mjs "<pdf-path>" <brand-slug>')
  console.error('Example: node scripts/extract-pdf.mjs "C:/Users/Parth/Desktop/anupam.pdf" anupam')
  process.exit(1)
}

const outputDir = resolve(dirname(fileURLToPath(import.meta.url)), 'output')
mkdirSync(outputDir, { recursive: true })

// Load pdfjs-dist (Node.js compatible legacy build)
let pdfjsLib
try {
  pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
} catch {
  console.error('Could not load pdfjs-dist. Make sure it is installed: npm install pdfjs-dist')
  process.exit(1)
}

// Point to the worker file (required by pdfjs-dist v5+)
// createRequire resolves node_modules paths correctly on Windows
const require = createRequire(import.meta.url)
const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href

console.log(`Reading PDF: ${pdfPath}`)
let pdfData
try {
  pdfData = new Uint8Array(readFileSync(resolve(pdfPath)))
} catch {
  console.error(`Could not read file: ${pdfPath}`)
  process.exit(1)
}

let doc
try {
  doc = await pdfjsLib.getDocument({ data: pdfData, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise
} catch (err) {
  console.error('Failed to parse PDF:', err.message)
  process.exit(1)
}

console.log(`PDF loaded — ${doc.numPages} pages`)

let rawText = `PDF: ${pdfPath}\nBrand: ${brandSlug}\nPages: ${doc.numPages}\n`
rawText += '='.repeat(60) + '\n\n'

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i)
  const content = await page.getTextContent()
  const pageText = content.items
    .filter(item => 'str' in item)
    .map(item => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  rawText += `--- Page ${i} ---\n`
  rawText += pageText || '[No text found on this page — may be image-based]'
  rawText += '\n\n'
}

const rawPath = resolve(outputDir, `${brandSlug}-raw.txt`)
writeFileSync(rawPath, rawText, 'utf-8')
console.log(`✓ Raw text → ${rawPath}`)

// Generate template JSON — one slot per page as a starting point
// User should edit this file: remove extra slots, fill in product details
const VALID_CATEGORIES = ['wellness-spa', 'pure-life', 'kitchen-harmony', 'swimming-pool', 'invisible-infrastructure']

const template = Array.from({ length: doc.numPages }, (_, i) => ({
  name: '',
  description: '',
  features: [],
  category: 'wellness-spa',  // EDIT THIS per product
  _pageHint: `See page ${i + 1} in ${brandSlug}-raw.txt`,
}))

const jsonPath = resolve(outputDir, `${brandSlug}-products.json`)
writeFileSync(jsonPath, JSON.stringify(template, null, 2), 'utf-8')
console.log(`✓ Template JSON → ${jsonPath}`)

console.log(`
Next steps:
1. Open scripts/output/${brandSlug}-raw.txt to see extracted text
2. Open scripts/output/${brandSlug}-products.json and fill in product details:
   - Set "name", "description", "features" for each product
   - Set "category" to one of: ${VALID_CATEGORIES.join(', ')}
   - Delete slots for pages that aren't products (intro pages, etc.)
   - Remove the "_pageHint" field from each entry before seeding
3. Run: node --env-file=.env.local scripts/seed-products.mjs ${brandSlug} <category>
`)
