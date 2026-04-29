# AP Sanitations — Project Status

**Last updated:** 2026-04-29  
**Environment:** Next.js 15 App Router · TypeScript · Tailwind CSS · Sanity v4 · Framer Motion · Vercel

---

## Project Overview

AP Sanitations is the official website for Prem Sahni's luxury sanitation dealership in Indore, MP. The site showcases premium bathroom/kitchen brands, captures leads via WhatsApp enquiry flows, and serves as a digital catalogue for the showroom.

---

## Completed Features

### Phase 1 — Foundation
- [x] Next.js 15 App Router project scaffold (TypeScript + Tailwind)
- [x] Design system: cream/charcoal/gold/teal palette, Cormorant Garamond + DM Sans fonts
- [x] Sanity v4 CMS integration with embedded Studio at `/studio`
- [x] Sanity schemas: `brand`, `product` (category cards), `productModel`, `lead`
- [x] Homepage with hero, brand showcase strips, product bento grid, heritage section
- [x] ISR (Incremental Static Regeneration) with 1-hour revalidation on all pages

### Phase 2 — Product Experience
- [x] Brand detail pages (`/brands/[brandId]`) — hero image/video, catalogues, product grid
- [x] Product category pages (`/products/[category]`) — grouped by subCategory or paginated
- [x] Product detail pages (`/products/[category]/[productId]`) — image carousel, features, documents
- [x] `GroupedProductGrid` — groups products by series (subCategory field)
- [x] `PaginatedProductGrid` — 10-per-page paginated grid with session-restored scroll position
- [x] Multiple named catalogues per brand (label + file/externalUrl)

### Phase 3 — Lead System + Trust Layer
- [x] Lead capture form with phone number collection
- [x] Lead enrichment flow (optional name + email after initial capture)
- [x] Sanity `lead` document creation via `/api/leads`
- [x] SMTP email notifications via Nodemailer on new lead
- [x] WhatsApp enquiry links on every product card and brand page
- [x] PDF proxy route `/api/pdf-proxy` for serving Sanity-hosted catalogue PDFs
- [x] QR code generation for catalogue links (server-side, `qrcode` library)
- [x] Footer: showroom address, Google Maps link, dual phone numbers, social links

### Phase 3 (Continued) — UX Refinements
- [x] Smooth scroll via Lenis
- [x] Framer Motion scroll-reveal animations throughout
- [x] Search overlay (client-side product search)
- [x] Mobile hamburger menu
- [x] Responsive across all breakpoints

### Phase 4 — Compliance + Refinements (current)
- [x] `PROJECT_STATUS.md` — this file
- [x] `/privacy-policy` page
- [x] `/terms-of-use` page
- [x] Footer links for legal pages
- [x] Brand logo fallback when product images are missing
- [x] Series card UX on category pages (`?series=` URL routing)
- [x] Brand page product preview reduced from 6 → 4

---

## In Progress

- [ ] Morzze brand integration (brand document + product models in Sanity)
  - Brand shell ready to populate via `/studio`
  - Waiting on official product image catalogue from Morzze (WhatsApp: 87503 13000)

---

## Blocked / Pending

| Item | Blocker | Owner |
|---|---|---|
| Morzze individual product images | Must request official dealer kit from Morzze | Prem Sahni |
| Hero section showroom photo | No real showroom photo provided yet | Prem Sahni |
| PDF worker self-hosting | Currently loads pdfjs worker from unpkg CDN — should copy to `public/` | Developer |
| AiSensy WhatsApp integration | Deferred — no API key obtained yet | Business decision |
| Sanity free tier expiry | If traffic increases, migrate to Supabase (see AP_SANITATIONS_DOCS.md §13) | Developer |

---

## Future Roadmap

### Near-term
- [ ] Product image upload for all existing products missing images (Sofpour Pure Life × 4, Swimming Pool × all)
- [ ] Morzze product images once catalogue received
- [ ] Google Analytics or Plausible integration

### Medium-term
- [ ] Lead deduplication (prevent duplicate phone numbers in Sanity)
- [ ] Lead management dashboard (filter/export leads from Studio)
- [ ] WhatsApp Business API (AiSensy) for automated follow-up
- [ ] Self-host PDF.js worker from `public/` instead of CDN

### Long-term
- [ ] Showroom visit booking / appointment flow
- [ ] Multi-language support (Hindi)
- [ ] Sanity → Supabase migration if storage exceeds free tier

---

## Technical Architecture Summary

```
/ (homepage)               SSR — fetches all brands + product categories from Sanity
/brands/[brandId]          SSG + ISR (1h) — brand detail + product grid
/products/[category]       SSG + ISR (1h) — category listing, series card UX
/products/[category]/[id]  SSG + ISR (1h) — product detail with image carousel
/privacy-policy            Static page (no CMS)
/terms-of-use              Static page (no CMS)
/studio                    Sanity embedded Studio (CMS admin)
/api/leads                 POST — create lead in Sanity + send SMTP email
/api/pdf-proxy             GET — proxy Sanity-hosted PDFs with correct headers
/api/search-index          GET — returns all products as JSON for client-side search
```

**Key data flow:**  
Sanity CMS → GROQ queries (`sanity/lib/queries.ts`) → Next.js server components → rendered HTML

**CMS document types:**
- `brand` — brand hero, image/video, catalogues, categories it covers
- `product` — bento grid category cards (homepage tiles)
- `productModel` — individual products; `subCategory` field drives series grouping
- `lead` — enquiry submissions with phone, source, optional name/email

**Design tokens (Tailwind):**  
`cream #F7F5F0` · `charcoal #1A1914` · `gold #B8935A` · `teal #3D6B65` · `stone #8A7A6A`
