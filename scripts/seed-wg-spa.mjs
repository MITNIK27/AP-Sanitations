/**
 * Seed all Woven Gold SPA products from pics/WG/SPA/
 * Reads each product subfolder, uploads images + PDFs to Sanity,
 * then creates/replaces productModel documents.
 *
 * Usage: node --env-file=.env.local scripts/seed-wg-spa.mjs
 *
 * Each folder becomes one productModel:
 *   - _id: productModel-wg-spa-{slug}
 *   - brand: woven-gold
 *   - category: wellness-spa
 *   - gallery: all .jpg images in the folder
 *   - documents: all .pdf files, labelled by filename
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const SPA_DIR = path.join(__dirname, '../pics/WG/SPA')

// ─── helpers ─────────────────────────────────────────────────────────────────

function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Derive a human-readable label from a PDF filename */
function detectLabel(filename) {
  const f = filename.toLowerCase()
  if (f.includes('install')) return 'Installation Guide'
  if (f.includes('manual') || f.includes('user')) return 'User Manual'
  if (f.includes('technical') || f.includes('tech') || f.includes('-td') || f.endsWith('td.pdf')) return 'Technical Drawing'
  return 'Technical Drawing'   // default for WG — most PDFs are technical drawings
}

async function getBrandId(slug) {
  const doc = await client.fetch(
    `*[_type == "brand" && id.current == $slug][0]{ _id }`,
    { slug }
  )
  return doc?._id ?? null
}

async function uploadImage(filePath, filename) {
  return client.assets.upload(
    'image',
    fs.createReadStream(filePath),
    { filename, contentType: 'image/jpeg' }
  )
}

async function uploadFile(filePath, filename) {
  return client.assets.upload(
    'file',
    fs.createReadStream(filePath),
    { filename, contentType: 'application/pdf' }
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function seedProduct(productFolder, brandId, order) {
  const folderPath = path.join(SPA_DIR, productFolder)
  const files = fs.readdirSync(folderPath)

  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort()
  const pdfFiles   = files.filter(f => /\.pdf$/i.test(f)).sort()

  const slug = toSlug(productFolder)
  const docId = `productModel-wg-spa-${slug}`
  const productName = productFolder
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  console.log(`\n[${productName}] (${imageFiles.length} images, ${pdfFiles.length} PDFs)`)

  // Upload images
  const uploadedImages = []
  for (const imgFile of imageFiles) {
    const filePath = path.join(folderPath, imgFile)
    try {
      const asset = await uploadImage(filePath, imgFile)
      uploadedImages.push(asset)
      console.log(`  ✓ image: ${imgFile}`)
    } catch (err) {
      console.warn(`  ⚠ image upload failed (${imgFile}): ${err.message}`)
    }
  }

  // Upload PDFs
  const uploadedPdfs = []
  for (const pdfFile of pdfFiles) {
    const filePath = path.join(folderPath, pdfFile)
    try {
      const asset = await uploadFile(filePath, pdfFile)
      uploadedPdfs.push({ asset, label: detectLabel(pdfFile) })
      console.log(`  ✓ pdf:   ${pdfFile} → "${detectLabel(pdfFile)}"`)
    } catch (err) {
      console.warn(`  ⚠ pdf upload failed (${pdfFile}): ${err.message}`)
    }
  }

  if (uploadedImages.length === 0 && uploadedPdfs.length === 0) {
    console.warn(`  ⚠ no assets uploaded, skipping document creation`)
    return
  }

  // Build gallery array (all images)
  const gallery = uploadedImages.map((asset, i) => ({
    _key: `img-${i}`,
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  }))

  // Build documents array
  const documents = uploadedPdfs.map(({ asset, label }, i) => ({
    _key: `doc-${i}`,
    label,
    file: {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    },
  }))

  // Primary image = first uploaded image
  const primaryImage = uploadedImages[0]
    ? {
        _type: 'image',
        asset: { _type: 'reference', _ref: uploadedImages[0]._id },
      }
    : undefined

  const doc = {
    _id: docId,
    _type: 'productModel',
    name: productName,
    brand: { _type: 'reference', _ref: brandId },
    category: 'wellness-spa',
    order,
    ...(primaryImage && { image: primaryImage }),
    ...(gallery.length > 0 && { gallery }),
    ...(documents.length > 0 && { documents }),
  }

  await client.createOrReplace(doc)
  console.log(`  ✓ created/updated: ${docId}`)
}

async function main() {
  console.log('Seeding Woven Gold SPA products…\n')

  // Fetch brand ID once
  const brandId = await getBrandId('woven-gold')
  if (!brandId) {
    console.error('✗ Brand "woven-gold" not found in Sanity. Aborting.')
    process.exit(1)
  }
  console.log(`Brand ID: ${brandId}`)

  // Get all product folders sorted alphabetically
  const folders = fs.readdirSync(SPA_DIR)
    .filter(f => fs.statSync(path.join(SPA_DIR, f)).isDirectory())
    .sort()

  console.log(`Found ${folders.length} product folders:\n  ${folders.join(', ')}\n`)

  for (let i = 0; i < folders.length; i++) {
    try {
      await seedProduct(folders[i], brandId, (i + 1) * 10)
    } catch (err) {
      console.error(`  ✗ Error for "${folders[i]}": ${err.message}`)
    }
  }

  // Auto-delete the old Swim Paradise document that was created before this script existed
  const OLD_SWIM_ID = 'productModel-woven-gold-0'
  try {
    await client.delete(OLD_SWIM_ID)
    console.log(`\n✓ Removed legacy duplicate: ${OLD_SWIM_ID}`)
  } catch {
    // Already deleted or never existed — fine
  }

  console.log('\n─────────────────────────────────────────')
  console.log('Done seeding SPA products.')
  console.log('─────────────────────────────────────────\n')
}

main()
