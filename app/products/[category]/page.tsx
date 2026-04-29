import { notFound } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getProducts, getProductModelsByCategory, getBrands } from '../../../sanity/lib/queries'
import { buildWhatsAppUrl } from '../../../lib/whatsapp'
import { PaginatedProductGrid } from './PaginatedProductGrid'
import { GroupedProductGrid } from './GroupedProductGrid'
import { CatalogueSection } from './CatalogueSection'
import { APLogo } from '../../../components/APLogo'
import { SearchTriggerButton } from '../../../components/SearchTriggerButton'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ category: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const products = await getProducts()
  const product = products.find((p) => p.id === category)
  if (!product) return {}
  return {
    title: `${product.title} — AP Sanitations`,
    description: product.description,
  }
}

export default async function ProductCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ series?: string }>
}) {
  const { category } = await params
  const { series: selectedSeries } = await searchParams
  const [products, models, allBrands] = await Promise.all([
    getProducts(),
    getProductModelsByCategory(category),
    getBrands(),
  ])

  const product = products.find((p) => p.id === category)
  if (!product) notFound()

  const relevantBrands = allBrands.filter((b) => b.categories?.includes(category))

  // Generate QR codes for brands that have a catalogue PDF
  const brandsWithQr = (
    await Promise.all(
      relevantBrands
        .filter((b) => b.catalogueUrl)
        .map(async (b) => {
          try {
            const qrDataUrl = await QRCode.toDataURL(b.catalogueUrl!, {
              width: 200,
              margin: 2,
              color: { dark: '#1A1914', light: '#FDFCFA' },
            })
            return { ...b, qrDataUrl, catalogueUrl: b.catalogueUrl! }
          } catch {
            return null
          }
        })
    )
  ).filter((b): b is NonNullable<typeof b> => b !== null)

  const waUrl = buildWhatsAppUrl(
    `Hi, I'm looking for ${product.title} solutions from AP Sanitations, Indore. Please get in touch.`
  )

  return (
    <main className="min-h-screen bg-cream text-charcoal">

      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-cream/95 backdrop-blur-sm border-b border-stone/10">
        <Link href="/#products" className="font-sans text-sm text-stone hover:text-charcoal transition-colors duration-300 flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to site
        </Link>
        <div className="flex items-center gap-2">
          <SearchTriggerButton variant="dark" />
          <Link href="/" className="hover:opacity-75 transition-opacity duration-300">
            <APLogo size="sm" variant="light" />
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 container-wide">
        <p className="label text-stone mb-4">{product.number} · {product.category}</p>
        <h1 className="font-display text-5xl md:text-7xl text-charcoal mb-6">{product.title}</h1>
        <p className="font-sans text-charcoal/60 text-lg max-w-2xl leading-relaxed">{product.description}</p>

        {/* WhatsApp CTA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mt-8 bg-[#25D366] hover:bg-[#20bb5a] text-white rounded-xl px-6 py-3 transition-colors duration-300 font-sans font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enquire on WhatsApp
        </a>
      </section>

      {/* Product grid — grouped by sub-category if products have subCategory, else paginated */}
      {models.some(m => m.subCategory)
        ? <GroupedProductGrid
            models={models}
            allBrands={allBrands}
            productTitle={product.title}
            waUrl={waUrl}
            category={category}
            selectedSeries={selectedSeries}
          />
        : <PaginatedProductGrid
            models={models}
            allBrands={allBrands}
            pageSize={10}
            productTitle={product.title}
            waUrl={waUrl}
            category={category}
          />
      }

      {/* Explore the Full Range — catalogue QR codes + download links */}
      <CatalogueSection brands={brandsWithQr} />

      {/* Footer strip */}
      <div className="border-t border-stone/10 py-8 container-wide flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-sans text-stone/60 text-sm">
          Authorised dealer · Samyak Park Building, Indore
        </p>
        <Link href="/" className="opacity-50 hover:opacity-90 transition-opacity duration-300">
          <APLogo size="sm" variant="light" />
        </Link>
      </div>
    </main>
  )
}
