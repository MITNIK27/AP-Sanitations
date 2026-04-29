'use client'

import { useState, useEffect } from 'react'
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
  pageSize: number
  productTitle: string
  waUrl: string
  category: string
  backPath?: string
}

export function PaginatedProductGrid({ models, allBrands, pageSize, productTitle, waUrl, category, backPath }: Props) {
  const router = useRouter()
  const totalPages = Math.ceil(models.length / pageSize)

  const [page, setPage] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = sessionStorage.getItem(`product-page-${category}`)
    if (!saved) return 0
    const n = parseInt(saved)
    return isNaN(n) ? 0 : Math.max(0, Math.min(n, totalPages - 1))
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  function changePage(n: number) {
    setPage(n)
    sessionStorage.setItem(`product-page-${category}`, String(n))
  }

  const visibleModels = models.slice(page * pageSize, (page + 1) * pageSize)

  if (models.length === 0) {
    return (
      <section className="container-wide pb-20">
        <div className="flex items-center justify-between mb-8">
          <p className="label text-stone">Products</p>
        </div>
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

  return (
    <section className="container-wide pb-20">
      <div className="flex items-center justify-between mb-8">
        <p className="label text-stone">Products</p>
        {totalPages > 1 && (
          <p className="font-sans text-xs text-stone/50"> 
            Page {page + 1} of {totalPages}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleModels.map((model) => {
          const brandCatalogueUrl = allBrands.find((b) => b.id === model.brandId)?.catalogueUrl
          const staticSrc = PRODUCT_IMAGES[model._id] ?? PRODUCT_IMAGES[model.name]
          const effectiveSrc = staticSrc ?? model.imageSrc
          const useContain = staticSrc != null || PRODUCT_IMAGE_CONTAIN.has(model._id)
          const detailHref = backPath
            ? `/products/${model.category}/${model._id}?back=${encodeURIComponent(backPath)}`
            : `/products/${model.category}/${model._id}`
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
                ) : (() => {
                  const logoSrc = BRAND_LOGOS[model.brandId] ?? allBrands.find((b) => b.id === model.brandId)?.imageSrc
                  return logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={model.brandName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-8 opacity-70"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EDE9E1 0%, #F7F5F0 100%)' }} />
                  )
                })()}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page === 0}
            className="border border-stone/20 hover:border-gold hover:text-gold text-stone text-sm font-sans font-medium px-5 py-2 rounded-xl transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="font-sans text-sm text-stone">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages - 1}
            className="border border-stone/20 hover:border-gold hover:text-gold text-stone text-sm font-sans font-medium px-5 py-2 rounded-xl transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}
