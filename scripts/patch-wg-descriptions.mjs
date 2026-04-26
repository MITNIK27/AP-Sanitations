/**
 * Patches WG SPA productModel documents with descriptions and features
 * fetched from wovengoldindia.com.
 *
 * Usage: node --env-file=.env.local scripts/patch-wg-descriptions.mjs
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Keyed by the slug used in the _id (productModel-wg-spa-{slug})
const DATA = {
  'bliss': {
    description: 'The Bliss is a premium freestanding or built-in hot tub designed for spa-like relaxation at home. It features a spacious lying concept with reclining capability and Bluetooth-enabled comfort systems.',
    features: [
      'Multiple rotary jets (4.5" and 3.5") plus 22 spray jets for therapeutic massage',
      '0.5 hp circulation pump, 2.5 hp spa pump with nano filtration',
      '22 LED chromotherapy lights with 8 additional corner panel LEDs',
      'Bluetooth connectivity with integrated speaker system',
      'Ozoniser for water purification; freestanding or built-in installation',
    ],
  },
  'classic': {
    description: 'A premium hot tub engineered to accommodate 5 people with a lounge seating configuration. Built with sanitary-grade acrylic and fiberglass reinforcement, the Classic delivers comprehensive hydrotherapy with 157 jets.',
    features: [
      '157 total jets: unidirectional, turbo, and blower varieties',
      'Dual 2 hp water pumps, 1.5 hp circulation pump, 1 hp air pump, 3 kW heating',
      'Integrated ozonizer and cartridge filtration system',
      'Four cushioned pillows, textured slip-resistant bottom',
      'Digital control panel with Bluetooth connectivity and built-in speaker',
    ],
  },
  'emotion': {
    description: 'The Emotion Plus is a premium lounge-style spa designed for a deeply personalised relaxation experience. It combines multi-jet hydrotherapy with chromotherapy, aromatherapy, and Bluetooth audio.',
    features: [
      'Multiple jet sizes: 5", 3.5", 2.5", 2", and 1.5" air jets',
      '2.5 HP water pump and 0.5 HP circulation pump with 3 kW heater',
      '24-piece chromotherapy lighting system',
      'Aromatherapy dispenser and ozonizer for water purification',
      'Digital control panel with Bluetooth speaker connectivity',
    ],
  },
  'carmenta': {
    description: 'The Carmenta is a premium swim spa that blends therapeutic hydrotherapy with recreational aquatic use. It offers a sophisticated combination of swim jets and hydromassage in a compact footprint.',
    features: [
      '48 total jets: 5 dedicated swim jets and 33 hydromassage jets',
      'Accommodates 2 seated persons and 1 reclining person',
      '3 kW heating system with ozonizer for water sanitization',
      'Bluetooth connectivity with integrated speaker and LED lighting',
      'Dimensions: 4200L × 2200W × 1100H mm with 3 pillows included',
    ],
  },
  'galaxy': {
    description: 'The Galaxy is a large-format premium spa accommodating up to 6 users, with high-grade acrylic construction and fiberglass reinforcement. It features 85 jets and dual lounge positions for full-body relaxation.',
    features: [
      '85 total jets: 55 uni-directional, 10 turbo jets, and 20 blower jets',
      'Dual 2 hp water pumps, 1.5 hp circulation pump, 1 hp air pump',
      '3 kW heating system with ozonizer and cartridge filtration',
      'Digital control panel with Bluetooth connectivity and built-in speaker',
      'Seating for 4 users plus 2 lounge positions with four soft cushions',
    ],
  },
  'highlife': {
    description: 'The High Life Spa is a premium wellness bathtub designed for therapeutic relaxation. It features a spacious lying concept accommodating 1 recline position and seating for 2, with integrated chromotherapy lighting.',
    features: [
      '17 total rotary jets: three 3.5" and thirteen 2.5" plus one neck fall jet',
      '1.5 hp circulation pump and 1.0 hp spa pump with cartridge filtration',
      '3 kW online heater with LED chromotherapy lighting',
      'Electronic control panel with two air controllers',
      'Dimensions: 1930L × 1100W mm with two headrests and soft cushions',
    ],
  },
  'infinity': {
    description: 'The Infinity is a large-scale premium spa with a 3+2 lounge seating configuration. It combines 108 jets with luxury amenities including a wine cooler, aroma therapy, and chromotherapy lighting.',
    features: [
      '108 total jets: directional, rotary, fountain, and air jets',
      'Three 3 hp spa pumps plus circulation and blower pumps with nano-filtration',
      'Chromotherapy lighting, aroma therapy dispenser, and wine cooler',
      '3 kW online heater with ozonizer and Bluetooth connectivity',
      'Dimensions: 2235L × 2235W mm with soft cushions and reclining positions',
    ],
  },
  'modena': {
    description: 'The Modena is a premium hot tub system accommodating 6 seated guests plus 2 in lounge positions. Built with sanitary-grade acrylic and fiberglass, it features 100 jets and an advanced lighting system.',
    features: [
      '100 total jets: directional, rotational, ozone, and air jets',
      'Three 3 hp water pumps with circulation and air pump systems',
      '3 kW heater with ozonizer and cartridge filtration',
      '24 perimeter LED lights plus 3 fountain lights with Bluetooth speaker',
      'Dimensions: 3800L × 2250W × 900H mm with 6 soft cushions and 4 pillows',
    ],
  },
  'niwa': {
    description: 'The Niwa is a premium swim spa combining relaxation and aquatic exercise in a spacious 8,000-litre design. It features a dedicated swim area with powerful dual swim pumps alongside full hydrotherapy jets.',
    features: [
      'Seating capacity: 4 people with dedicated swim area',
      '58 stainless steel jets with 2 HP × 2 and 3 HP × 2 pumps for swim area',
      'Dual 3+3 kW heater (220–240 V) with 50 mg/h ozone generator',
      '5 underwater LED lights with advanced 100 sq ft filtration',
      'Dimensions: 5850 × 2250 × 1400 mm, Aristech acrylic shell with stainless steel frame',
    ],
  },
  'sentorini': {
    description: 'The Sentorini is a luxury large-format hot tub with 126 jets, designed for elegant wellness experiences. Built with high-grade acrylic and fiberglass, it features a lying concept with Bluetooth audio and full chromotherapy.',
    features: [
      '126 total jets: 95 uni-directional, 12 turbo jets, and 19 blower jets',
      'Dual 2 hp water pumps, 1.5 hp circulation pump, 1 hp air pump',
      '3 kW heater with ozonizer and cartridge filtration system',
      'Bluetooth speaker system with spa lighting and digital control panel',
      'Dimensions: 2500L × 2200W × 970H mm with 5 cushions and 3 pillows',
    ],
  },
  'swim-paradise': {
    description: 'The Swim Paradise is a premium swim spa combining powerful swimming jets with full hydro-massage capabilities. It seats 6 persons (3 sitting, 3 lying) with 124 total jets for a complete aquatic wellness experience.',
    features: [
      '124 total jets: 5 swim jets, 107 hydro-massage jets, 12 air jets',
      'Dual 2 HP pumps plus dedicated circulation systems',
      '3 kW heater (×2) for rapid and maintained water temperature',
      'Dimensions: 5860L × 2200W × 1100–1300H mm',
      'Acrylic construction with stainless steel #304 frame; seats 6 with 4 pillows',
    ],
  },
  'tiago': {
    description: 'The Tiago is a premium freestanding or built-in wellness spa seating 3 persons plus 1 lounge position. It blends hydrotherapy with luxury amenities including a wine cooler, dual cascade waterfalls, and Bluetooth audio.',
    features: [
      '45 total jets with sizes from 4.5" to 1.5" including specialised neck blaster jets',
      '2.5 hp spa pump and 1 hp blower with 3 kW online heater',
      '32 LED chromotherapy lights with dual cascade waterfalls',
      'Built-in wine cooler, Bluetooth speaker, aroma therapy, and ozonizer',
      'Dimensions: 1920L × 1535W × 762D × 864H mm with four-side skirting',
    ],
  },
}

async function main() {
  console.log('Patching WG SPA product descriptions…\n')

  for (const [slug, { description, features }] of Object.entries(DATA)) {
    const docId = `productModel-wg-spa-${slug}`
    try {
      await client
        .patch(docId)
        .set({ description, features })
        .commit()
      console.log(`✓ ${docId}`)
    } catch (err) {
      console.warn(`⚠ ${docId}: ${err.message}`)
    }
  }

  console.log(`\nDone. ${Object.keys(DATA).length} products patched.`)
  console.log('\nProducts without descriptions yet (check WG website manually):')
  console.log('  Barcelona, Envoy, Glow, Grandee, Perfect Plus, Platinum Plus, Premium Plus, Relay, Triumph')
}

main()
