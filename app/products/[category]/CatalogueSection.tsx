import Image from 'next/image'
import Link from 'next/link'

interface BrandWithQr {
  id: string
  name: string
  tagline: string
  catalogueUrl: string
  qrDataUrl: string
  imageSrc?: string
  objectFit?: string
}

interface Props {
  brands: BrandWithQr[]
}

export function CatalogueSection({ brands }: Props) {
  if (brands.length === 0) return null

  return (
    <section className="container-wide pb-20">
      <div className="mb-8">
        <p className="label text-stone mb-2">Explore the Full Range</p>
        <p className="font-sans text-stone/60 text-sm">
          Download the complete product catalogue for detailed specifications and the full product lineup.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-warmWhite border border-stone/10 rounded-2xl p-6 flex flex-col items-center gap-5"
          >
            {/* Brand identity */}
            <div className="flex items-center gap-3 w-full">
              {brand.imageSrc && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-linen flex-shrink-0">
                  <Image
                    src={brand.imageSrc}
                    alt={brand.name}
                    fill
                    className={brand.objectFit === 'contain' ? 'object-contain p-1' : 'object-cover'}
                  />
                </div>
              )}
              <div>
                <p className="font-sans font-medium text-sm text-charcoal">{brand.name}</p>
                <p className="font-sans text-xs text-stone/60">{brand.tagline}</p>
              </div>
            </div>

            {/* QR code */}
            <div className="bg-white rounded-xl p-3 border border-stone/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.qrDataUrl}
                alt={`Scan to download ${brand.name} catalogue`}
                width={160}
                height={160}
                className="rounded-lg"
              />
            </div>
            <p className="font-sans text-xs text-stone/50 text-center -mt-2">Scan to open on your phone</p>

            {/* Download button */}
            <a
              href={brand.catalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full flex items-center justify-center gap-2 border border-stone/20 hover:border-gold hover:text-gold text-stone text-sm font-sans font-medium py-3 rounded-xl transition-colors duration-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Full Catalogue
            </a>

            {/* Brand page link */}
            <Link
              href={`/brands/${brand.id}`}
              className="font-sans text-xs text-stone/50 hover:text-gold transition-colors duration-300"
            >
              View {brand.name} brand page →
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
