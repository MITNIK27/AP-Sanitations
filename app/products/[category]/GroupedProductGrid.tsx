'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ProductModel } from '../../../sanity/lib/queries'
import type { Brand } from '../../../data/brands'
import { buildWhatsAppUrl } from '../../../lib/whatsapp'

interface Props {
  models: ProductModel[]
  allBrands: Brand[]
  productTitle: string
  waUrl: string
}

export function GroupedProductGrid({ models, allBrands, productTitle, waUrl }: Props) {
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

  // Group products by subCategory, preserving insertion order
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

  return (
    <section className="container-wide pb-20">
      <p className="label text-stone mb-8">Products</p>

      <div className="space-y-16">
        {groups.map(({ subCategory, items }) => (
          <div key={subCategory || 'other'}>
            {subCategory && (
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6 pb-3 border-b border-stone/10">
                {subCategory}
              </h2>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((model) => {
                const brandCatalogueUrl = allBrands.find((b) => b.id === model.brandId)?.catalogueUrl
                const detailHref = `/products/${model.category}/${model._id}`
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
                      {model.imageSrc ? (
                        <Image
                          src={model.imageSrc}
                          alt={model.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone/30">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
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
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
