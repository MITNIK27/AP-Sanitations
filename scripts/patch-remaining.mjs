/**
 * Patches remaining WG SPA products:
 *   - Descriptions for Barcelona, Platinum Plus, Perfect Plus, Premium Plus
 *   - Galaxy primary image (re-uploads galaxy1.jpg and patches the document)
 *
 * Usage: node --env-file=.env.local scripts/patch-remaining.mjs
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

const DESCRIPTIONS = {
  'barcelona': {
    description: 'The Barcelona is a premium 4-seat outdoor spa featuring 36 hydromassage jets, dual ozonisers, and a built-in waterfall. Constructed with Aristech acrylic shell and stainless steel 316# frame for lasting durability.',
    features: [
      'Dimensions: 2100L × 1700W × 960H mm, water volume 650 L, seating for 4',
      '36 hydromassage water jets with waterfall valve',
      '3 kW heater, 3 HP 2-speed hydromassage pump, 1 HP circulation pump',
      'Dual ozonisers with Balboa control system and LED lighting',
      '4 cup holders with LED, 20 small LED lights, underwater LED, spa cover included',
    ],
  },
  'platinum-plus': {
    description: 'The Platinum Plus is a luxury lounge-style spa for 3 persons with 50 hydromassage jets, dual cascade waterfalls with chromotherapy, and a full suite of smart wellness amenities.',
    features: [
      'Size: 1830L × 1830W × 762D × 864H mm, lying concept with 1 recline position',
      '50 total jets: 4.5", 3.5", 2.5", 2.0", 1.5" and neck blaster jets',
      'Spa pump 2.5 hp + 1 hp, 0.5 hp circulation pump, 3 kW online heater',
      'Dual 4" cascade waterfalls with chromotherapy, 24+8 LED lights, aroma therapy',
      'Wine cooler, Bluetooth speaker, ozonizer, digital control panel, four-side skirting',
    ],
  },
  'perfect-plus': {
    description: 'The Perfect Plus is a feature-rich lounge spa seating 3 persons with 57 hydromassage jets and dual cascade waterfalls. It combines advanced hydrotherapy with comprehensive smart amenities in a compact design.',
    features: [
      'Size: 1980L × 1915W × 762D × 864H mm, lying concept with 1 recline position',
      '57 total jets: 4.5", 3.5", 2.5", 2.0", 1.5" and neck blaster jets',
      'Spa pump 2.5 hp + 1 hp, 0.5 hp circulation pump, 3 kW online heater',
      'Dual 4" cascade waterfalls with chromotherapy, 24+8 LED lights, aroma therapy',
      'Wine cooler, Bluetooth speaker, ozonizer, digital control panel, four-side skirting',
    ],
  },
  'premium-plus': {
    description: 'The Premium Plus is the largest in the Plus series with 68 hydromassage jets and 40+8 LED chromotherapy lights. Its spacious lounge design delivers a deeply personalised luxury spa experience.',
    features: [
      'Size: 2286L × 1930W × 762D × 864H mm, lying concept with 1 recline position',
      '68 total jets: 4.5", 3.5", 2.5", 2.0", 1.5" and 4 neck blaster jets',
      'Spa pumps 2 hp × 2 + 1 hp, 1 hp blower, 3 kW online heater',
      'Dual 4" cascade waterfalls with chromotherapy, 40+8 LED lights, aroma therapy',
      'Wine cooler, Bluetooth speaker, ozonizer, optional silver marble finish',
    ],
  },
}

async function patchDescriptions() {
  console.log('Patching descriptions…')
  for (const [slug, { description, features }] of Object.entries(DESCRIPTIONS)) {
    const docId = `productModel-wg-spa-${slug}`
    try {
      await client.patch(docId).set({ description, features }).commit()
      console.log(`  ✓ ${docId}`)
    } catch (err) {
      console.warn(`  ⚠ ${docId}: ${err.message}`)
    }
  }
}

async function fixGalaxyImage() {
  console.log('\nFixing Galaxy image…')
  const imgPath = path.join(__dirname, '../pics/WG/SPA/Galaxy/galaxy1.jpg')

  if (!fs.existsSync(imgPath)) {
    console.warn('  ⚠ galaxy1.jpg not found at expected path')
    return
  }

  const asset = await client.assets.upload(
    'image',
    fs.createReadStream(imgPath),
    { filename: 'galaxy1.jpg', contentType: 'image/jpeg' }
  )
  console.log(`  ✓ Uploaded asset: ${asset._id}`)

  await client
    .patch('productModel-wg-spa-galaxy')
    .set({
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      gallery: [{ _key: 'img-0', _type: 'image', asset: { _type: 'reference', _ref: asset._id } }],
    })
    .commit()
  console.log('  ✓ Patched productModel-wg-spa-galaxy with image')
}

async function main() {
  await patchDescriptions()
  await fixGalaxyImage()
  console.log('\nDone.')
}

main()
