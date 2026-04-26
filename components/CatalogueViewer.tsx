'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  pdfUrl: string
  title: string
  onClose: () => void
}

type PdfDoc = {
  numPages: number
  getPage: (n: number) => Promise<PdfPage>
}

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number }
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: ReturnType<PdfPage['getViewport']> }) => { promise: Promise<void> }
}

export function CatalogueViewer({ pdfUrl, title, onClose }: Props) {
  const [pdf, setPdf] = useState<PdfDoc | null>(null)
  const [spread, setSpread] = useState(1)           // left page of the current two-page spread
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  const leftRef  = useRef<HTMLCanvasElement>(null)
  const rightRef = useRef<HTMLCanvasElement>(null)

  // Load PDF
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`
        const doc = await pdfjsLib.getDocument(proxyUrl).promise

        if (!cancelled) {
          setPdf(doc as unknown as PdfDoc)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load catalogue. Please try downloading instead.')
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [pdfUrl])

  // Render two pages whenever spread or pdf changes
  const renderSpread = useCallback(async () => {
    if (!pdf || !leftRef.current) return
    setRendering(true)

    const scale = window.innerWidth < 768 ? 0.9 : 1.4

    async function renderPage(pageNum: number, canvas: HTMLCanvasElement) {
      if (pageNum < 1 || pageNum > pdf!.numPages) {
        const ctx = canvas.getContext('2d')
        if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height) }
        canvas.width = 0
        return
      }
      const page = await pdf!.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport }).promise
    }

    await renderPage(spread, leftRef.current)
    if (rightRef.current) {
      await renderPage(spread + 1, rightRef.current)
    }

    setRendering(false)
  }, [pdf, spread])

  useEffect(() => { renderSpread() }, [renderSpread])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') nextSpread()
      if (e.key === 'ArrowLeft')  prevSpread()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pdf, spread, onClose])

  function nextSpread() {
    if (!pdf) return
    setSpread(s => Math.min(s + 2, pdf.numPages % 2 === 0 ? pdf.numPages - 1 : pdf.numPages))
  }

  function prevSpread() {
    setSpread(s => Math.max(s - 2, 1))
  }

  const totalSpreads = pdf ? Math.ceil(pdf.numPages / 2) : 0
  const currentSpread = Math.ceil(spread / 2)
  const isSinglePage  = !pdf || (spread === pdf.numPages)

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-sm flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <p className="font-display italic text-cream text-lg md:text-xl leading-none">{title}</p>
          {pdf && (
            <p className="font-sans text-stone/60 text-xs mt-1">
              Spread {currentSpread} of {totalSpreads} · {pdf.numPages} pages
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="font-sans text-xs text-stone/70 hover:text-gold border border-white/20 hover:border-gold px-4 py-2 rounded-xl transition-colors duration-300 flex items-center gap-2"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </a>
          <button
            onClick={onClose}
            aria-label="Close catalogue"
            className="w-9 h-9 rounded-full border border-white/20 hover:border-white/50 text-stone/70 hover:text-cream flex items-center justify-center transition-colors duration-300"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-4 py-6 gap-1 min-h-0">

        {loading && (
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="font-sans text-stone/60 text-sm">Loading catalogue…</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="font-sans text-stone/60 text-sm mb-4">{error}</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gold text-gold px-5 py-3 rounded-xl font-sans text-sm hover:bg-gold hover:text-charcoal transition-colors duration-300"
            >
              Open PDF directly ↗
            </a>
          </div>
        )}

        {!loading && !error && pdf && (
          <>
            {/* Left page */}
            <div className={`shadow-2xl overflow-hidden rounded-sm ${isSinglePage ? 'mx-auto' : ''}`} style={{ maxHeight: 'calc(100vh - 160px)' }}>
              <canvas
                ref={leftRef}
                className="block max-h-full w-auto"
                style={{ opacity: rendering ? 0.5 : 1, transition: 'opacity 0.2s' }}
              />
            </div>

            {/* Right page — hidden if last page is odd */}
            {!isSinglePage && (
              <div className="shadow-2xl overflow-hidden rounded-sm" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                <canvas
                  ref={rightRef}
                  className="block max-h-full w-auto"
                  style={{ opacity: rendering ? 0.5 : 1, transition: 'opacity 0.2s' }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom navigation */}
      {pdf && !loading && !error && (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={prevSpread}
            disabled={spread <= 1}
            aria-label="Previous spread"
            className="flex items-center gap-2 font-sans text-sm text-stone/70 hover:text-cream border border-white/20 hover:border-white/50 px-5 py-2.5 rounded-xl transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Prev
          </button>

          <span className="font-sans text-xs text-stone/50 tabular-nums min-w-[80px] text-center">
            {spread}–{Math.min(spread + 1, pdf.numPages)} / {pdf.numPages}
          </span>

          <button
            onClick={nextSpread}
            disabled={spread + 1 >= pdf.numPages}
            aria-label="Next spread"
            className="flex items-center gap-2 font-sans text-sm text-stone/70 hover:text-cream border border-white/20 hover:border-white/50 px-5 py-2.5 rounded-xl transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
