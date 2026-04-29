'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ProductModel } from '../../../sanity/lib/queries'
import type { Brand } from '../../../data/brands'
import { buildWhatsAppUrl } from '../../../lib/whatsapp'
import { BRAND_LOGOS } from '../../../lib/brandLogos'
import { PRODUCT_IMAGES } from '../../../lib/productImages'
import { PRODUCT_IMAGE_CONTAIN } from '../../../lib/productImageFit'

interface Props {
  models: ProductModel[]
  allBrands: Brand[]
  productTitle: string
  waUrl: string
  category: string
  selectedSeries?: string
  basePath?: string
  backPath?: string
}

function ProductCard({ model, allBrands, router, backPath }: { model: ProductModel; allBrands: Brand[]; router: ReturnType<typeof useRouter>; backPath?: string }) {
  const brandCatalogueUrl = allBrands.find((b) => b.id === model.brandId)?.catalogueUrl
  const staticSrc = PRODUCT_IMAGES[model._id] ?? PRODUCT_IMAGES[model.name]
  const effectiveSrc = staticSrc ?? model.imageSrc
  const useContain = staticSrc != null || PRODUCT_IMAGE_CONTAIN.has(model._id)
  const detailHref = backPath
    ? `/products/${model.category}/${model._id}?back=${encodeURIComponent(backPath)}`
    : `/products/${model.category}/${model._id}`
  const brandLogo = allBrands.find((b) => b.id === model.brandId)?.imageSrc

  return (
    <div
      key={model._id}
      role="link"
      tabIndex={0}
      onClick={() => router.push(detailHref)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(detailHref)}
      className="group bg-warmWhite rounded-2xl overflow-hidden border border-stone/10 hover:border-gold/30 transition-colors duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-linen overflow-hidden">
        {effectiveSrc ? (
          <Image
            src={effectiveSrc}
            alt={model.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={useContain ? 'object-contain p-4' : 'object-cover group-hover:scale-105 transition-transform duration-500'}
          />
        ) : (BRAND_LOGOS[model.brandId] ?? brandLogo) ? (
          <Image
            src={BRAND_LOGOS[model.brandId] ?? brandLogo!}
            alt={model.brandName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-8 opacity-70"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EDE9E1 0%, #F7F5F0 100%)' }} />
        )}
        <span className="absolute top-3 left-3 bg-charcoal/70 backdrop-blur-sm text-cream text-xs font-sans px-2 py-1 rounded-md">
          {model.brandName}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg text-charcoal mb-2 leading-snug">{model.name}</h3>
        {model.description && (
          <p className="font-sans text-stone text-sm leading-relaxed mb-4 line-clamp-2">{model.description}</p>
        )}
        {model.features && model.features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {model.features.slice(0, 3).map((f, i) => (
              <li key={i} className="font-sans text-xs text-stone/70 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
          <a
            href={buildWhatsAppUrl(`Hi, I'm interested in the ${model.name} from AP Sanitations, Indore. Please share more details.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-[#25D366]/10 hover:bg-[#25D366]/20 text-charcoal text-xs font-sans font-medium py-2 rounded-lg transition-colors duration-300"
          >
            Enquire
          </a>
          {brandCatalogueUrl && (
            <a
              href={brandCatalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center border border-stone/20 hover:border-gold hover:text-gold text-stone text-xs font-sans font-medium py-2 rounded-lg transition-colors duration-300"
            >
              View Catalogue
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function GroupedProductGrid({ models, allBrands, productTitle, waUrl, category, selectedSeries, basePath, backPath }: Props) {
  const router = useRouter()

  if (models.length === 0) {
    return (
      <section className="container-wide pb-20">
        <div className="py-20 text-center border border-dashed border-stone/20 rounded-2xl">
          <p className="font-display italic text-3xl text-stone/40 mb-3">Coming soon</p>
          <p className="font-sans text-stone/50 text-sm mb-8">
            Our {productTitle} product catalogue is being updated.<br />
            Contact us for the full range.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bb5a] text-white rounded-xl px-5 py-3 transition-colors duration-300 font-sans font-medium text-sm"
          >
            Ask on WhatsApp
          </a>
        </div>
      </section>
    )
  }

  // Build series groups
  const groups: { subCategory: string; items: ProductModel[] }[] = []
  const seen = new Map<string, ProductModel[]>()
  for (const model of models) {
    const key = model.subCategory ?? ''
    if (!seen.has(key)) {
      const arr: ProductModel[] = []
      seen.set(key, arr)
      groups.push({ subCategory: key, items: arr })
    }
    seen.get(key)!.push(model)
  }

  const namedGroups = groups.filter((g) => g.subCategory !== '')
  const ungrouped = groups.find((g) => g.subCategory === '')

  // ── Series product view (a specific series was selected) ──────────────────
  if (selectedSeries) {
    const seriesItems = groups.find((g) => g.subCategory === selectedSeries)?.items ?? []

    return (
      <section className="container-wide pb-20">
        {/* Back navigation */}
        <div className="mb-8 flex items-center gap-4">
          <a
            href={basePath ?? `/products/${category}`}
            className="inline-flex items-center gap-2 font-sans text-sm text-stone hover:text-charcoal transition-colors duration-300"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            All Collections
          </a>
          <span className="text-stone/30 font-sans text-sm">/</span>
          <span className="font-sans text-sm text-charcoal">{selectedSeries}</span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-2">{selectedSeries}</h2>
        <p className="font-sans text-sm text-stone/60 mb-10">{seriesItems.length} product{seriesItems.length !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seriesItems.map((model) => (
            <ProductCard key={model._id} model={model} allBrands={allBrands} router={router} backPath={backPath} />
          ))}
        </div>
      </section>
    )
  }

  // ── Series cards view (default — no series selected) ──────────────────────
  return (
    <section className="container-wide pb-20">
      <p className="label text-stone mb-8">Collections</p>

      {/* Series card grid */}
      {namedGroups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {namedGroups.map(({ subCategory, items }) => {
            const repImage = items
              .map((m) => PRODUCT_IMAGES[m._id] ?? PRODUCT_IMAGES[m.name] ?? m.imageSrc)
              .find(Boolean)
            const brandLogo = allBrands.find((b) => b.id === items[0]?.brandId)?.imageSrc

            return (
              <a
                key={subCategory}
                href={`${basePath ?? `/products/${category}`}?series=${encodeURIComponent(subCategory)}`}
                className="group bg-warmWhite rounded-2xl overflow-hidden border border-stone/10 hover:border-gold/30 transition-colors duration-300 flex flex-col"
              >
                {/* Representative image */}
                <div className="relative aspect-[4/3] bg-linen overflow-hidden">
                  {repImage ? (
                    <Image
                      src={repImage}
                      alt={subCategory}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : brandLogo ? (
                    <Image
                      src={brandLogo}
                      alt={subCategory}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-10 opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EDE9E1 0%, #F7F5F0 100%)' }} />
                  )}
                  {/* Product count badge */}
                  <span className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur-sm text-cream text-xs font-sans px-2 py-1 rounded-md">
                    {items.length} {items.length === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {/* Series info */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-charcoal group-hover:text-gold transition-colors duration-300">{subCategory}</h3>
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone/40 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Products without a series — show below series cards */}
      {ungrouped && ungrouped.items.length > 0 && (
        <div>
          {namedGroups.length > 0 && (
            <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6 pb-3 border-b border-stone/10">
              Other Models
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ungrouped.items.map((model) => (
              <ProductCard key={model._id} model={model} allBrands={allBrands} router={router} backPath={backPath} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
