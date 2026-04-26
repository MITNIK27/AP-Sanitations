'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  alt: string
}

export function ImageCarousel({ images, alt }: Props) {
  const [idx, setIdx] = useState(0)

  const prev = useCallback(() => setIdx((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length])
  const next = useCallback(() => setIdx((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [images.length, next])

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-linen">
        <Image src={images[0]} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-linen overflow-hidden group">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="100vw" className="object-cover" priority={i === 0} />
        </div>
      ))}

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal/50 hover:bg-charcoal/80 text-cream flex items-center justify-center transition-colors duration-300 opacity-0 group-hover:opacity-100"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-charcoal/50 hover:bg-charcoal/80 text-cream flex items-center justify-center transition-colors duration-300 opacity-0 group-hover:opacity-100"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === idx ? 'bg-cream' : 'bg-cream/40 hover:bg-cream/70'}`}
          />
        ))}
      </div>
    </div>
  )
}
