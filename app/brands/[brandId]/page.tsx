import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBrandBySlug, getBrands, getProductModelsByBrand } from '../../../sanity/lib/queries'
import { buildWhatsAppUrl } from '../../../lib/whatsapp'
import { CATEGORY_LABELS } from '../../../lib/categoryLabels'
import { BrandCatalogues } from './BrandCatalogues'
import { APLogo } from '../../../components/APLogo'

export const revalidate = 3600

export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.map((b) => ({ brandId: b.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const brand = await getBrandBySlug(brandId)
  if (!brand) return {}
  return {
    title: `${brand.name} — AP Sanitations`,
    description: brand.tagline,
  }
}

export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const [brand, models] = await Promise.all([
    getBrandBySlug(brandId),
    getProductModelsByBrand(brandId),
  ])
  if (!brand) notFound()

  const waUrl = buildWhatsAppUrl(
    `Hi, I'm interested in ${brand.name} products from AP Sanitations, Indore. Please get in touch.`
  )

  return (
    <main className="min-h-screen bg-cream text-charcoal">

      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-cream/95 backdrop-blur-sm border-b border-stone/10">
        <Link href="/#brands" className="font-sans text-sm text-stone hover:text-charcoal transition-colors duration-300 flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to site
        </Link>
        <Link href="/" className="hover:opacity-75 transition-opacity duration-300">
          <APLogo size="sm" variant="light" />
        </Link>
      </div>

      {/* Hero */}
      <section className="relative pt-20 min-h-[60vh] flex items-end overflow-hidden">
        {/* Background */}
        {brand.videoSrc ? (
          <video
            src={brand.videoSrc}
            poster={brand.videoPoster}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : brand.imageSrc ? (
          <Image
            src={brand.imageSrc}
            alt={brand.imageAlt}
            fill
            priority
            className={brand.objectFit === 'contain' ? 'object-contain bg-linen' : 'object-cover'}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: brand.placeholderGradient }}
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

        {/* Text */}
        <div className="relative z-10 container-wide pb-14 md:pb-20">
          <p className="label text-cream/50 mb-3">{brand.tagline}</p>
          <h1 className="font-display text-5xl md:text-7xl text-cream">{brand.name}</h1>
        </div>
      </section>

      {/* Description + actions */}
      <section className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Description */}
          <div className="lg:col-span-2">
            <p className="label text-stone mb-4">About the Brand</p>
            <p className="font-sans text-charcoal/80 text-lg leading-relaxed">{brand.description}</p>
          </div>

          {/* Action panel */}
          <div className="space-y-4">
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20bb5a] text-white rounded-xl px-5 py-4 transition-colors duration-300 font-sans font-medium text-sm w-full justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </a>

            {/* Catalogue download — only shown when a catalogue is available */}
            {brand.catalogueUrl && (
              <a
                href={brand.catalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-charcoal/20 hover:border-gold hover:text-gold text-charcoal rounded-xl px-5 py-4 transition-colors duration-300 font-sans font-medium text-sm w-full justify-center"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download {brand.name} Catalogue
              </a>
            )}

            {/* Contact */}
            <a
              href="tel:9302104628"
              className="flex items-center gap-3 border border-stone/20 hover:border-teal hover:text-teal text-charcoal rounded-xl px-5 py-4 transition-colors duration-300 font-sans font-medium text-sm w-full justify-center"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Call +91 9302104628
            </a>
          </div>
        </div>
      </section>

      {/* Product Models — grouped by category if multiple categories present */}
      {models.length > 0 && (() => {
        // Group models by category, preserving order
        const categoryOrder: string[] = []
        const grouped: Record<string, typeof models> = {}
        for (const m of models) {
          if (!grouped[m.category]) {
            grouped[m.category] = []
            categoryOrder.push(m.category)
          }
          grouped[m.category].push(m)
        }

        const isMultiCategory = categoryOrder.length > 1

        return (
          <section className="container-wide pb-20">
            <p className="label text-stone mb-8">Products in Range</p>
            <div className="space-y-16">
              {categoryOrder.map((cat) => {
                const group = grouped[cat]
                const preview = group.slice(0, 6)
                const remaining = group.length - preview.length
                return (
                  <div key={cat}>
                    {isMultiCategory && (
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl md:text-3xl text-charcoal">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </h2>
                        <Link
                          href={`/products/${cat}`}
                          className="font-sans text-sm text-stone hover:text-gold transition-colors duration-300 flex items-center gap-1.5"
                        >
                          View all {group.length}
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {preview.map((model) => (
                        <Link
                          key={model._id}
                          href={`/products/${model.category}/${model._id}`}
                          className="group border border-stone/15 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors duration-300 bg-warmWhite"
                        >
                          {model.imageSrc ? (
                            <div className="relative aspect-[4/3] bg-linen">
                              <Image
                                src={model.imageSrc}
                                alt={model.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-linen flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-stone/20">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="p-5">
                            <p className="font-sans font-medium text-charcoal text-sm leading-snug group-hover:text-gold transition-colors duration-300">{model.name}</p>
                            {model.description && (
                              <p className="font-sans text-stone/70 text-xs mt-1.5 leading-relaxed line-clamp-2">{model.description}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    {remaining > 0 && (
                      <div className="mt-6 text-center">
                        <Link
                          href={`/products/${cat}`}
                          className="inline-flex items-center gap-2 border border-stone/20 hover:border-gold hover:text-gold text-stone text-sm font-sans font-medium py-3 px-6 rounded-xl transition-colors duration-300"
                        >
                          +{remaining} more in {CATEGORY_LABELS[cat] ?? cat}
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Catalogues (shower, bathtub, etc.) */}
      {brand.catalogues && brand.catalogues.length > 0 && (
        <BrandCatalogues catalogues={brand.catalogues.filter(c => c.url)} />
      )}

      {/* Gallery */}
      {brand.gallery && brand.gallery.length > 0 && (
        <section className="container-wide pb-20">
          <p className="label text-stone mb-8">Product Gallery</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {brand.gallery.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-linen">
                <Image
                  src={url}
                  alt={`${brand.name} product ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

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
