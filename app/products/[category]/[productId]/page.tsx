import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getProductModelById, getAllProductModels } from '../../../../sanity/lib/queries'
import { buildWhatsAppUrl } from '../../../../lib/whatsapp'
import { CATEGORY_LABELS } from '../../../../lib/categoryLabels'
import { PRODUCT_IMAGES } from '../../../../lib/productImages'
import { PRODUCT_GALLERIES } from '../../../../lib/productGalleries'
import { PRODUCT_IMAGE_CONTAIN } from '../../../../lib/productImageFit'
import { ImageCarousel } from './ImageCarousel'
import { APLogo } from '../../../../components/APLogo'

export const revalidate = 3600

export async function generateStaticParams() {
  const models = await getAllProductModels()
  return models.map((m) => ({ category: m.category, productId: m._id }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; productId: string }> }) {
  const { productId } = await params
  const model = await getProductModelById(productId)
  if (!model) return {}
  return {
    title: `${model.name} — AP Sanitations`,
    description: model.description,
  }
}


export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; productId: string }>
  searchParams: Promise<{ back?: string }>
}) {
  const { category, productId } = await params
  const { back } = await searchParams
  const model = await getProductModelById(productId)
  if (!model) notFound()

  let qrDataUrl: string | null = null
  if (model.catalogueUrl) {
    try {
      qrDataUrl = await QRCode.toDataURL(model.catalogueUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1A1914', light: '#FDFCFA' },
      })
    } catch {
      // QR generation failed — skip silently
    }
  }

  const waUrl = buildWhatsAppUrl(
    `Hi, I'm interested in the ${model.name} from AP Sanitations, Indore. Please share more details.`
  )

  const categoryLabel = CATEGORY_LABELS[category] ?? category
  const backHref = back ?? `/products/${category}`
  const backLabel = back ? 'Back' : `Back to ${categoryLabel}`

  const staticGallery = PRODUCT_GALLERIES[model._id] ?? PRODUCT_GALLERIES[model.name]
  const effectiveGallery = (model.gallery && model.gallery.length > 0)
    ? model.gallery
    : (staticGallery ?? [])
  const staticImageSrc = PRODUCT_IMAGES[model._id] ?? PRODUCT_IMAGES[model.name]
  const effectiveImageSrc = staticImageSrc ?? model.imageSrc
  const heroObjectFit: 'cover' | 'contain' = (staticGallery || staticImageSrc || PRODUCT_IMAGE_CONTAIN.has(model._id)) ? 'contain' : 'cover'

  return (
    <main className="min-h-screen bg-cream text-charcoal">

      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-cream/95 backdrop-blur-sm border-b border-stone/10">
        <Link
          href={backHref}
          className="font-sans text-sm text-stone hover:text-charcoal transition-colors duration-300 flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {backLabel}
        </Link>
        <Link href="/" className="hover:opacity-75 transition-opacity duration-300">
          <APLogo size="sm" variant="light" />
        </Link>
      </div>

      {/* Hero — carousel if gallery exists, single image otherwise */}
      <div className="relative mt-20">
        {effectiveGallery.length > 0 ? (
          <div className="relative">
            <ImageCarousel images={effectiveGallery} alt={model.name} objectFit={heroObjectFit} />
            <span className="absolute top-5 left-5 z-10 bg-charcoal/70 backdrop-blur-sm text-cream text-sm font-sans px-3 py-1.5 rounded-lg">
              {model.brandName}
            </span>
          </div>
        ) : (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-linen">
            {effectiveImageSrc ? (
              <Image src={effectiveImageSrc} alt={model.name} fill priority sizes="100vw" className={heroObjectFit === 'contain' ? 'object-contain p-6' : 'object-cover'} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone/20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <span className="absolute top-5 left-5 bg-charcoal/70 backdrop-blur-sm text-cream text-sm font-sans px-3 py-1.5 rounded-lg">
              {model.brandName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <section className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Left — product info */}
          <div className="lg:col-span-2">
            <p className="label text-stone mb-4">{categoryLabel}</p>
            <h1 className="font-display text-4xl md:text-6xl text-charcoal mb-6 leading-tight">{model.name}</h1>

            {model.description && (
              <p className="font-sans text-charcoal/70 text-lg leading-relaxed mb-10">{model.description}</p>
            )}

            {model.features && model.features.length > 0 && (
              <div>
                <p className="label text-stone mb-4">Key Features</p>
                <ul className="space-y-3">
                  {model.features.map((f, i) => (
                    <li key={i} className="font-sans text-charcoal/80 text-sm flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — actions + catalogue */}
          <div className="space-y-4">

            {/* WhatsApp enquiry */}
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

            {/* Downloads — product-level docs take priority, fall back to brand catalogue */}
            {(model.documents && model.documents.length > 0) ? (
              <div className="space-y-2">
                <p className="font-sans text-xs text-stone/60 uppercase tracking-widest">Downloads</p>
                {model.documents.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 border border-charcoal/20 hover:border-gold hover:text-gold text-charcoal rounded-xl px-5 py-3.5 transition-colors duration-300 font-sans font-medium text-sm w-full"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {doc.label}
                  </a>
                ))}
              </div>
            ) : model.catalogueUrl ? (
              <a
                href={model.catalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-3 border border-charcoal/20 hover:border-gold hover:text-gold text-charcoal rounded-xl px-5 py-4 transition-colors duration-300 font-sans font-medium text-sm w-full justify-center"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download {model.brandName} Catalogue
              </a>
            ) : (
              <div className="flex items-center gap-3 border border-stone/20 text-stone/40 rounded-xl px-5 py-4 font-sans text-sm w-full justify-center cursor-not-allowed">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Catalogue coming soon
              </div>
            )}

            {/* QR code */}
            {qrDataUrl && (
              <div className="bg-warmWhite border border-stone/10 rounded-2xl p-5 flex flex-col items-center gap-3">
                <p className="font-sans text-xs text-stone/60 text-center">Scan to open catalogue on your phone</p>
                <div className="bg-white rounded-xl p-3 border border-stone/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="QR code for product catalogue"
                    width={160}
                    height={160}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Brand page link */}
            <Link
              href={`/brands/${model.brandId}`}
              className="flex items-center justify-center gap-2 border border-stone/20 hover:border-stone/40 text-stone hover:text-charcoal rounded-xl px-5 py-4 transition-colors duration-300 font-sans text-sm w-full"
            >
              View {model.brandName} brand page
            </Link>
          </div>
        </div>
      </section>

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
