'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORY_LABELS } from '@/lib/categoryLabels'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface SearchItem {
  _id: string
  name: string
  brandName: string
  category: string
  subCategory?: string
  description?: string
}

type GroupedResults = Record<string, SearchItem[]>

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedResults>({})
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchIndex = useRef<SearchItem[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const openSearch = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setResults({})
    setSelectedIndex(0)
  }, [])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults({})
    setSelectedIndex(0)
  }, [])

  const loadIndex = useCallback(async () => {
    if (searchIndex.current !== null) return
    setLoading(true)
    try {
      const res = await fetch('/api/search-index')
      const data: SearchItem[] = await res.json()
      searchIndex.current = data
    } catch {
      searchIndex.current = []
    } finally {
      setLoading(false)
    }
  }, [])

  // Custom event listener + Cmd/Ctrl+K shortcut + Escape
  useEffect(() => {
    const handleOpen = () => openSearch()
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
      if (e.key === 'Escape') closeSearch()
    }

    document.addEventListener('ap:open-search', handleOpen)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('ap:open-search', handleOpen)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openSearch, closeSearch])

  // Auto-focus input + lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      loadIndex()
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isOpen, loadIndex])

  // Client-side filter
  useEffect(() => {
    if (!searchIndex.current || query.length < 2) {
      setResults({})
      setSelectedIndex(0)
      return
    }

    const q = query.toLowerCase()
    const matched = searchIndex.current
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.brandName ?? '').toLowerCase().includes(q) ||
        (CATEGORY_LABELS[item.category] ?? item.category).toLowerCase().includes(q) ||
        (item.subCategory ?? '').toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8)

    const grouped: GroupedResults = {}
    for (const item of matched) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }

    setResults(grouped)
    setSelectedIndex(0)
  }, [query])

  const flatResults = Object.values(results).flat()

  const handleSelect = useCallback((item: SearchItem) => {
    router.push(`/products/${item.category}/${item._id}`)
    closeSearch()
  }, [router, closeSearch])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      handleSelect(flatResults[selectedIndex])
    }
  }

  const hasResults = Object.keys(results).length > 0
  const showEmpty = !loading && query.length >= 2 && !hasResults

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-charcoal/60 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Panel — full-screen on mobile, centered card on desktop */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[91] flex flex-col bg-cream md:inset-x-0 md:bottom-auto md:top-[15vh] md:mx-auto md:w-full md:max-w-2xl md:rounded-2xl md:shadow-2xl md:overflow-hidden"
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone/10 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-stone shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, brands, categories…"
                className="flex-1 bg-transparent font-sans text-base text-charcoal placeholder-stone/40 outline-none"
              />

              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="text-stone/50 hover:text-charcoal transition-colors shrink-0"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              {/* Esc hint — desktop only */}
              <button
                onClick={closeSearch}
                className="hidden md:flex items-center font-sans text-xs text-stone/40 border border-stone/20 rounded px-1.5 py-0.5 shrink-0 hover:text-stone transition-colors"
              >
                Esc
              </button>

              {/* Close button — mobile only */}
              <button
                onClick={closeSearch}
                className="md:hidden font-sans text-sm font-medium text-stone shrink-0"
              >
                Cancel
              </button>
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto md:max-h-[55vh]">

              {/* Loading state */}
              {loading && (
                <div className="px-5 py-12 text-center font-sans text-sm text-stone/50">
                  Loading…
                </div>
              )}

              {/* Empty state */}
              {showEmpty && (
                <div className="px-5 py-12 text-center space-y-4">
                  <p className="font-sans text-sm text-stone/60">
                    No products found for &ldquo;{query}&rdquo;
                  </p>
                  <a
                    href={buildWhatsAppUrl(`Hi, I'm looking for "${query}" at AP Sanitations. Can you help?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeSearch}
                    className="inline-flex items-center gap-2 font-sans text-sm font-medium text-[#25D366] hover:underline"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ask us on WhatsApp
                  </a>
                </div>
              )}

              {/* Results grouped by category */}
              {!loading && hasResults && (
                <div className="py-2">
                  {Object.entries(results).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-5 pt-4 pb-1.5 font-sans text-xs font-medium text-stone/40 uppercase tracking-widest">
                        {CATEGORY_LABELS[category] ?? category}
                      </p>
                      {items.map((item) => {
                        const globalIndex = flatResults.indexOf(item)
                        const isSelected = selectedIndex === globalIndex
                        return (
                          <button
                            key={item._id}
                            onClick={() => handleSelect(item)}
                            className={`w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 transition-colors duration-150 ${
                              isSelected ? 'bg-linen' : 'hover:bg-linen/60'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-sans text-sm font-medium text-charcoal truncate">
                                {item.name}
                              </p>
                              <p className="font-sans text-xs text-stone/60 truncate mt-0.5">
                                {item.brandName}
                              </p>
                            </div>
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4 text-stone/25 shrink-0"
                            >
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Idle hint */}
              {!loading && query.length < 2 && (
                <div className="px-5 py-10 text-center space-y-1.5">
                  <p className="font-sans text-sm text-stone/40">
                    Search across all products and brands
                  </p>
                  <p className="font-sans text-xs text-stone/25">
                    ↑ ↓ to navigate · Enter to open · Esc to close
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
