'use client'

import { useState } from 'react'
import { CatalogueViewer } from '../../../components/CatalogueViewer'

interface Props {
  catalogues: { label: string; url: string }[]
}

export function BrandCatalogues({ catalogues }: Props) {
  const [open, setOpen] = useState<{ label: string; url: string } | null>(null)

  if (catalogues.length === 0) return null

  return (
    <>
      <section className="container-wide pb-20">
        <p className="label text-stone mb-8">Catalogues</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {catalogues.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setOpen(cat)}
              className="group text-left border border-stone/15 hover:border-gold/40 rounded-2xl p-6 transition-colors duration-300 bg-warmWhite flex items-center gap-4"
            >
              {/* Book icon */}
              <span className="w-12 h-12 rounded-xl bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-charcoal text-sm group-hover:text-gold transition-colors duration-300 leading-snug">{cat.label}</p>
                <p className="font-sans text-stone/50 text-xs mt-1">Click to view</p>
              </div>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone/30 group-hover:text-gold transition-colors duration-300 flex-shrink-0">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      </section>

      {open && (
        <CatalogueViewer
          pdfUrl={open.url}
          title={open.label}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  )
}
