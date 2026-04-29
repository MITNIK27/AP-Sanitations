/**
 * Static registry mapping brand slugs to local logo files in public/pics/Logos/.
 * Used as fallback when a product has no image and the brand has no Sanity-hosted image.
 * To add a new brand: drop the logo into public/pics/Logos/ and add one entry here.
 */
export const BRAND_LOGOS: Record<string, string> = {
  anupam:            '/pics/Logos/Anupam.png',
  'woven-gold':      '/pics/Logos/woven-gold.png',
  sofpour:           '/pics/Logos/Sofpour.jpg',
  'pnb-kitchenmate': '/pics/Logos/H2O-PNB.jpg',
  morzze:            '/pics/Logos/Morzze.png',
}
