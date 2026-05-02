// Product IDs that need object-contain (product shots on plain/white backgrounds).
// All other products default to object-cover (scene photographs).
export const PRODUCT_IMAGE_CONTAIN = new Set([
  'productModel-magicfalls-0',
  'productModel-magicfalls-1',
  'productModel-magicfalls-2',
  'productModel-magicfalls-3',
  'productModel-fountain-nozzles-0',
  'productModel-fountain-nozzles-1',
  'productModel-fountain-nozzles-2',
  'productModel-fountain-nozzles-3',
  'productModel-fountain-nozzles-4',
  'productModel-fountain-nozzles-5',
  'productModel-fountain-nozzles-6',
  'productModel-fountain-nozzles-7',
  'productModel-pnb-kitchenmate-5',
  'productModel-pnb-kitchenmate-6',
  'productModel-pnb-kitchenmate-7',
])

// Brand prefixes where all products use object-contain.
// Morzze images are 1200×1200 square studio shots on plain backgrounds.
export const PRODUCT_IMAGE_CONTAIN_PREFIXES: string[] = [
  'productModel-morzze-',
]

export function shouldContain(id: string): boolean {
  if (PRODUCT_IMAGE_CONTAIN.has(id)) return true
  return PRODUCT_IMAGE_CONTAIN_PREFIXES.some((prefix) => id.startsWith(prefix))
}
