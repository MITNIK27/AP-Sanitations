# AP Sanitations — Technical Documentation

> **Audience:** Engineers, stakeholders, and future maintainers with zero prior context on this project.
> **Last reviewed:** April 2026 | **Codebase state:** Next.js 15, Sanity v4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Context](#2-business-context)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Developer Commands](#5-developer-commands)
6. [Feature Breakdown](#6-feature-breakdown)
7. [Data & Product Flow](#7-data--product-flow)
8. [Design System](#8-design-system)
9. [Sanity.io Integration Details](#9-sanityio-integration-details)
10. [Build & Deployment](#10-build--deployment)
11. [Known Issues & Technical Debt](#11-known-issues--technical-debt)
12. [Improvement Roadmap](#12-improvement-roadmap)
13. [CMS Migration — Moving Off Sanity](#13-cms-migration--moving-off-sanity)

---

## 1. Project Overview

AP Sanitations is a **luxury sanitation dealership** website for a family-owned business in Indore, India. The site serves as a digital showroom and lead generation platform — it does not take e-commerce orders. Its primary goal is to showcase the product catalogue and brand partnerships, then convert visitors into showroom enquiries via phone or WhatsApp.

**What the site does:**
- Presents brand partners (Anupam, Woven Gold, Sofpour, PNB Kitchenmate, etc.) in an editorial format
- Displays product categories and individual product models with images, features, and documents
- Provides downloadable and in-browser-viewable PDF catalogues for each brand
- Captures visitor phone numbers (lead capture form) stored in Sanity CMS
- Surfaces direct WhatsApp enquiry links on every product and brand page
- Includes an embedded Sanity Studio at `/studio` for the owner to manage all content

---

## 2. Business Context

| Field | Detail |
|---|---|
| Business name | AP Sanitations |
| Owner | Prem Sahni |
| Location | Samyak Park Building, Indore, Madhya Pradesh 452001 |
| Founded | 2003 (Prem Sahni's industry career began 1998 via Jaquar) |
| Contact | +91 9302104628 · 0731-4038838 |
| Served | 10,000+ families across Indore and Madhya Pradesh |
| Nature | Authorized dealer / distributor; not a manufacturer |

**Brand partnerships** (as encoded in Sanity CMS):
- **Anupam** — kitchen sinks and bath fittings; AP Sanitations is sole authorized dealer in Madhya Pradesh since 2005
- **Woven Gold** — luxury Italian-style bath fittings (faucets, shower systems, bathtubs, SPA/wellness)
- **Sofpour** — water treatment (softeners, heat pumps, industrial RO, pressure pumps)
- **PNB Kitchenmate** — kitchen appliances and accessories
- **MagicFalls** — swimming pool systems
- **Fountain Nozzles** — decorative water features

**Business model:** Visitors browse the site, find products of interest, and call or WhatsApp the showroom. The website does not process payments or manage delivery — it is purely a discovery and lead funnel.

---

## 3. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | ^15.2.3 | App Router; no Pages Router |
| Language | TypeScript | ^5 | Strict-ish config |
| Styling | Tailwind CSS | ^3.4.1 | Custom design tokens |
| CMS | Sanity.io | ^4.22.0 | Embedded Studio + CDN assets |
| CMS client | next-sanity | ^11.6.12 | `createClient`, `defineLive` |
| Animations | Framer Motion | ^11.3.8 | Scroll-reveal, page transitions |
| Smooth scroll | Lenis | ^1.3.18 | Wraps entire app in `LenisProvider` |
| PDF rendering | pdfjs-dist | ^5.5.207 | Client-side; worker loaded from unpkg CDN |
| QR codes | qrcode | ^1.5.4 | Server-side; generates QR data URLs for catalogue links |
| Fonts | Google Fonts (next/font) | — | Cormorant Garamond + DM Sans |
| Image CDN | Sanity CDN (`cdn.sanity.io`) | — | All product/brand images and PDFs served from here |
| Runtime | Node.js | ≥18 | Required by Next.js 15 |

**No state management library** — data is fetched server-side per page and passed as props to client components. There is no global client state (no Redux, Zustand, Context API for data).

---

## 4. Folder Structure

```
ap-sanitations/
│
├── app/                          # Next.js App Router — all routes live here
│   ├── layout.tsx                # Root layout: fonts, metadata, LenisProvider
│   ├── globals.css               # Tailwind base + component/utility layers
│   ├── page.tsx                  # Homepage — fetches brands + products, renders ClientPage
│   │
│   ├── brands/
│   │   └── [brandId]/
│   │       ├── page.tsx          # Brand detail page (SSR)
│   │       └── BrandCatalogues.tsx  # "Named Catalogues" tab UI (client component)
│   │
│   ├── products/
│   │   └── [category]/
│   │       ├── page.tsx          # Product category page (SSR)
│   │       ├── PaginatedProductGrid.tsx  # Client: page-by-page product grid
│   │       ├── GroupedProductGrid.tsx    # Client: sub-category grouped view
│   │       ├── CatalogueSection.tsx      # QR code + catalogue download section
│   │       └── [productId]/      # ⚠ Directory exists, no page.tsx — routes 404
│   │
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx          # Embedded Sanity Studio (catch-all route)
│   │
│   └── api/
│       ├── leads/route.ts        # POST — validates phone, writes lead to Sanity
│       └── pdf-proxy/route.ts    # GET — CORS proxy for Sanity CDN PDFs
│
├── components/
│   ├── ClientPage.tsx            # Entire homepage composition (all sections)
│   ├── APLogo.tsx                # SVG logo component with size + variant props
│   ├── CatalogueViewer.tsx       # Full-screen PDF viewer (pdfjs-dist, canvas)
│   └── LenisProvider.tsx         # Smooth scroll context wrapper
│
├── data/
│   ├── brands.ts                 # Brand TypeScript interface (no runtime data)
│   └── products.ts               # Product TypeScript interface (no runtime data)
│
├── sanity/
│   ├── schemas/                  # Active schemas registered in sanity.config.ts
│   │   ├── brand.ts              # Brand document schema
│   │   ├── product.ts            # Product category schema
│   │   ├── productModel.ts       # Individual product model schema
│   │   └── lead.ts               # Lead capture schema
│   │
│   ├── schemaTypes/              # ⚠ DEAD CODE — boilerplate from `sanity init`
│   │   ├── authorType.ts         #   Not registered, not used
│   │   ├── postType.ts
│   │   ├── categoryType.ts
│   │   └── blockContentType.ts
│   │
│   ├── lib/
│   │   ├── client.ts             # Read client (CDN, public)
│   │   ├── writeClient.ts        # Write client (server-only, token-gated)
│   │   ├── queries.ts            # All GROQ queries + TypeScript interfaces
│   │   ├── image.ts              # Sanity image URL builder helper
│   │   └── live.ts               # ⚠ UNUSED — SanityLive / sanityFetch stub
│   │
│   └── structure.ts              # Sanity Studio structure config
│
├── scripts/                      # One-off data migration + seeding scripts (Node ESM)
│   ├── seed-products.mjs         # Seeds product category cards
│   ├── seed-sofpour.mjs          # Seeds Sofpour brand + product models
│   ├── seed-wg-categories.mjs    # Seeds Woven Gold categories
│   ├── migrate-wg-products.mjs   # Migrates WG products from scraped JSON
│   ├── scrape-wg-products.mjs    # Scraped WG product data from source
│   ├── fix-pnb-products.mjs      # One-off fix for PNB product data
│   ├── fix-wg-faucets.mjs        # One-off fix for WG faucet data
│   ├── patch-wg-descriptions.mjs # Patches WG product descriptions
│   ├── patch-wg-features.mjs     # Patches WG product features
│   ├── check-missing-images.mjs  # Audit: finds products with no image
│   ├── extract-pdf.mjs           # Extracts product data from PDFs
│   ├── clean-wg-scrape.mjs       # Cleans raw scraped WG JSON
│   └── output/                   # Raw JSON dumps from scraping sessions
│
├── pics/                         # Local asset store (NOT served by Next.js)
│   ├── WG/                       # Woven Gold product images organized by category
│   ├── Catalogues/               # PDF catalogue files (original + OCR versions)
│   └── *.jpg / *.pdf             # Brand logos and master catalogues
│
├── public/
│   ├── logo.jpeg                 # AP Sanitations logo (served at /logo.jpeg)
│   └── pics/                     # Static brand images served by Next.js
│
├── sanity.config.ts              # Sanity project config (schemas, Studio path)
├── sanity.cli.ts                 # Sanity CLI config (project ID, dataset)
├── next.config.js                # Next.js config (image domains, output tracing)
├── tailwind.config.js            # Tailwind config (custom tokens)
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json                 # TypeScript config
└── .env.local                    # Environment variables (not committed to git)
```

---

## 5. Developer Commands

### 5.1 Environment Variables (Required)

Create `.env.local` in the project root with these values before running anything:

```bash
# Sanity project credentials — find in sanity.io/manage
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Sanity write token — create in sanity.io/manage → API → Tokens
# Required by /api/leads to save lead captures
SANITY_API_WRITE_TOKEN=sk...your_token_here
```

> **Warning:** `SANITY_API_WRITE_TOKEN` must have **Editor** or **Write** permissions. Without it, the lead capture form will silently fail (HTTP 500).

### 5.2 Install Dependencies

```bash
npm install
```

### 5.3 Local Development

```bash
npm run dev
```

Starts the Next.js dev server at `http://localhost:3000`. The embedded Sanity Studio is available at `http://localhost:3000/studio`.

### 5.4 Build for Production

```bash
npm run build
```

This runs `next build`, which:
- Calls `generateStaticParams()` on brand and product category pages (fetches from Sanity at build time)
- Generates static HTML for all known `/brands/[brandId]` and `/products/[category]` routes
- Outputs to `.next/`

### 5.5 Start Production Server

```bash
npm run start
```

Starts the production server at `http://localhost:3000`. Run `npm run build` first.

### 5.6 Lint

```bash
npm run lint
```

Runs Next.js ESLint rules. No custom ESLint config present — defaults to `next/core-web-vitals`.

### 5.7 Sanity Studio (Standalone)

The Studio is embedded in the Next.js app at `/studio`. To use it:
1. Run `npm run dev`
2. Navigate to `http://localhost:3000/studio`
3. Log in with a Sanity account that has access to the project

To run the Sanity CLI directly (for schema deployment, dataset management):
```bash
npx sanity manage       # Opens Sanity project management dashboard
npx sanity dataset list # Lists datasets
npx sanity schema deploy # Deploys schema changes (if using schema registry)
```

### 5.8 Data Seeding Scripts

These are one-off migration scripts in `/scripts/`. They require `SANITY_API_WRITE_TOKEN` to be set.

```bash
# Example — seed Sofpour brand + products
node scripts/seed-sofpour.mjs

# Audit which products are missing images
node scripts/check-missing-images.mjs
```

> These scripts are not idempotent by default — re-running may create duplicate documents. Review each script before executing.

### 5.9 Verify the Running App

After `npm run dev`, confirm:
- `http://localhost:3000` — homepage loads, brand strips render
- `http://localhost:3000/brands/anupam` — brand detail page renders
- `http://localhost:3000/products/wellness-spa` — product grid renders
- `http://localhost:3000/studio` — Sanity Studio loads and connects
- `http://localhost:3000/api/pdf-proxy?url=https://cdn.sanity.io/files/...` — returns a PDF (test with any Sanity file URL)
- POST `http://localhost:3000/api/leads` with `{"phone":"9876543210","source":"test"}` — returns `{"success":true}`

---

## 6. Feature Breakdown

### 6.1 Homepage Sections (`components/ClientPage.tsx`)

The entire homepage is composed in a single file with clearly separated section components. All sections are client-side (`"use client"`) because they use Framer Motion and scroll-based animations. Data (brands, products) is fetched server-side in `app/page.tsx` and passed as props.

| Section | Component | Description |
|---|---|---|
| Navbar | `Navbar` | Fixed header; transparent until scroll > 60px, then cream/blur. Mobile: text "Menu/Close" toggle |
| Hero | `Hero` | Full-height split layout: gradient image left (placeholder — no real photo yet), editorial headline right. CTA scrolls to `#brands` |
| Philosophy Strip | `PhilosophyStrip` | Single dark bar with establishment metadata |
| Brand Showcase | `BrandShowcase` + `BrandStrip` | Maps Sanity `brand[]` to alternating left/right image+text strips. Supports image, video, or CSS gradient fallback per brand |
| Products Bento Grid | `Products` + `ProductCard` | Fixed 5-card layout (3 cols, 3 rows). Cards are hardcoded positionally, not dynamically arranged. Data from Sanity `product[]` |
| Heritage Timeline | `Heritage` | Two-column: animated timeline (left) + story quotes (right). Timeline data is hardcoded in the component |
| Showroom CTA | `ShowroomCTA` | Lead capture form (phone + WhatsApp opt-in checkbox). POSTs to `/api/leads`. Post-submit shows WhatsApp deep link |
| Footer | `Footer` | 3-column: address/phone, brand list, nav links |

### 6.2 Brand Detail Pages (`app/brands/[brandId]/page.tsx`)

Server-rendered. Fetches brand data + all product models for that brand from Sanity.

- **Hero**: Full-bleed image or video with gradient overlay and brand name
- **Description + Actions**: Brand description, WhatsApp enquiry link, catalogue download, phone call button
- **Product Models**: Grouped by category when multiple categories are present. Shows up to 6 per category with a "View all" link to the category page
- **Named Catalogues**: Rendered via `BrandCatalogues.tsx` — each catalogue is a clickable card that opens `CatalogueViewer` (in-browser PDF reader)
- **Gallery**: Image grid from `brand.gallery[]`

Static paths generated at build time via `generateStaticParams()`.

### 6.3 Product Category Pages (`app/products/[category]/page.tsx`)

Server-rendered. Fetches product category metadata, all product models for the category, all brands, and generates QR codes server-side.

**Two grid layouts (auto-selected):**
- `GroupedProductGrid` — used when any product model has a `subCategory` field. Groups products by sub-category with section headers
- `PaginatedProductGrid` — used when all models are flat (no sub-categories). 10 items per page, page state persisted in `sessionStorage`

**Catalogue QR section (`CatalogueSection`):** Shows QR codes (server-generated PNG via `qrcode` library) for brands relevant to the category, alongside download links. Brand-to-category mapping is **currently hardcoded** (see Priority Fix #1 in section 11).

### 6.4 Lead Capture & CRM (`app/api/leads/route.ts`)

`POST /api/leads` accepts:
```json
{ "phone": "9876543210", "source": "contact-form", "whatsappOptIn": true }
```

- Validates: 10-digit numeric phone number
- Writes a `lead` document to Sanity using `writeClient` (server-side, token-authenticated)
- **No deduplication** — the same phone number can be submitted multiple times and each creates a new document
- **No notification** — the TODO comment references AiSensy for WhatsApp alerts but this is not implemented
- Leads are viewable in Sanity Studio under the "Leads" document type, sorted by newest first

### 6.5 PDF Catalogue Viewer (`components/CatalogueViewer.tsx`)

A full-screen, two-page-spread PDF reader built with `pdfjs-dist` rendered to `<canvas>` elements.

- Triggered by brand catalogue cards on brand detail pages
- Fetches PDFs via `/api/pdf-proxy` to resolve CORS restrictions on `cdn.sanity.io`
- Supports keyboard navigation (arrow keys, Escape)
- Falls back gracefully to a direct download link on render failure
- PDF worker is loaded at runtime from `https://unpkg.com/pdfjs-dist@{version}/build/pdf.worker.min.mjs`

### 6.6 Embedded CMS (`app/studio/[[...tool]]/page.tsx`)

Sanity Studio v4 embedded at `/studio`. Registered schemas: `brand`, `product`, `productModel`, `lead`.

The Studio allows the owner to:
- Add/edit/delete brands (including uploading images, videos, PDFs)
- Edit product category cards (title, description, colours)
- Add/edit/delete individual product models (images, features, documents)
- View leads submitted through the contact form

---

## 7. Data & Product Flow

### 7.1 Sanity Schema Hierarchy

```
brand  ──────────────────────────────────────────────────────────────────┐
  ├─ id (slug)                                                            │
  ├─ name, tagline, description                                           │
  ├─ image / video / videoPoster (Sanity asset references)                │
  ├─ catalogue (PDF file)                                                 │
  ├─ catalogues[] { label, file | externalUrl }                           │
  ├─ gallery[] (image array)                                              │
  └─ hideFromBrands (boolean)                                             │
                                                                          │
productModel  ──────────────────────────────────────────────────────────── brand (reference)
  ├─ name
  ├─ brand → brand._id (reference)
  ├─ category (enum: wellness-spa | pure-life | kitchen-harmony |
  │            swimming-pool | invisible-infrastructure |
  │            shower-systems | bathroom-faucets | bathtubs)
  ├─ subCategory (free text)
  ├─ image (Sanity asset)
  ├─ gallery[] (Sanity asset array)
  ├─ documents[] { label, file (PDF) }
  ├─ description (text)
  ├─ features[] (string array)
  └─ order (number)

product  (product *category* card — not a product model)
  ├─ id (slug) — matches productModel.category values
  ├─ number ("01", "02", ...)
  ├─ category (short label, e.g. "Wellness & Spa")
  ├─ title, description
  ├─ bg / text / border (Tailwind class strings)
  └─ gridCols / gridRows (Tailwind grid span strings)

lead
  ├─ phone (10-digit string)
  ├─ source (string, e.g. "contact-form")
  ├─ whatsappOptIn (boolean)
  └─ submittedAt (datetime)
```

### 7.2 GROQ Queries Reference (`sanity/lib/queries.ts`)

| Function | Query | Usage |
|---|---|---|
| `getBrands()` | `*[_type == "brand" && hideFromBrands != true] \| order(order asc) {...}` | Homepage brand strips, footer brand list |
| `getBrandBySlug(slug)` | `*[_type == "brand" && id.current == $slug][0] {...}` | Brand detail page |
| `getProducts()` | `*[_type == "product"] \| order(order asc) {...}` | Homepage bento grid + category page metadata |
| `getProductModelById(id)` | `*[_type == "productModel" && _id == $id][0] {...}` | Product detail page (route not yet built) |
| `getAllProductModels()` | `*[_type == "productModel"] { _id, category }` | `generateStaticParams` for product detail pages |
| `getProductModelsByBrand(brandSlug)` | `*[_type == "productModel" && brand->id.current == $brandSlug] \| order(order asc) {...}` | Brand detail page |
| `getProductModelsByCategory(category)` | `*[_type == "productModel" && category == $category] \| order(order asc) {...}` | Product category page |

### 7.3 Server → Client Data Flow

```
Sanity CDN
    │
    │  client.fetch() (useCdn: true, API version 2024-01-01)
    ▼
Next.js Server Component (app/page.tsx, app/brands/[id]/page.tsx, etc.)
    │
    │  Promise.all([getBrands(), getProducts()]) — parallel fetches
    │  Data resolved at request time (or at build time for static pages)
    ▼
Props passed to Client Components (ClientPage, PaginatedProductGrid, etc.)
    │
    │  No further Sanity calls in client components
    │  No client-side data fetching (no SWR, no React Query)
    ▼
Rendered HTML → Browser
    │
    │  User interaction (lead form, PDF viewer, WhatsApp links)
    ▼
/api/leads  →  writeClient.create()  →  Sanity Dataset (server-only write)
/api/pdf-proxy  →  fetch(sanity CDN URL)  →  Buffer returned to browser
```

---

## 8. Design System

The visual language is **luxury editorial** — modelled after high-end interior and architecture publications.

### 8.1 Color Tokens (`tailwind.config.js`)

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F7F5F0` | Primary background, default body bg |
| `charcoal` | `#1A1914` | Primary text, hero bg, footer bg |
| `gold` | `#B8935A` | Accent — CTAs, active states, timeline dots, selection highlight |
| `teal` | `#3D6B65` | Hero gradient, CTA section bg, brand placeholder |
| `linen` | `#EDE9E1` | Alternate section bg (Heritage section) |
| `stone` | `#8A7A6A` | Secondary text, labels, muted UI |
| `warmWhite` | `#FDFCFA` | Product card backgrounds |
| `pool` | `#162635` | Swimming Pool category card bg |
| `gold-light` | `#D4B483` | Hover states |
| `gold-dark` | `#8A6A36` | Pressed states |
| `teal-light/dark` | `#5A9189 / #2A4D49` | Teal variants |

### 8.2 Typography

| Role | Font | Variable | Weights |
|---|---|---|---|
| Display / Headings | Cormorant Garamond | `--font-cormorant` | 300–700, italic |
| Body / UI | DM Sans | `--font-dm-sans` | 300–700 |

Key rules:
- All section headings: `font-display` (Cormorant Garamond)
- All body copy, labels, CTAs: `font-sans` (DM Sans)
- Large display numbers (bento ghost numbers, watermark text): `font-display`

### 8.3 Component Patterns (`app/globals.css`)

| Class | Description |
|---|---|
| `.font-display` | Applies Cormorant Garamond font family |
| `.label` | Small caps label: `text-xs font-medium uppercase tracking-ticker text-stone` |
| `.rule-gold` | 48px horizontal gold rule (`block h-px bg-gold w-12`) |
| `.container-wide` | Full-width section container: `max-w-7xl mx-auto px-5 sm:px-8 lg:px-12` |
| `.link-underline` | Nav link with animated gold underline on hover |
| `.cta-ghost` | Arrow CTA: inline-flex, stone text, hover gold |
| `.bento-card` | Product grid card: `relative overflow-hidden rounded-2xl p-8 md:p-12 h-full` |
| `.editorial-input` | Borderless input: bottom border only, cream text, gold on focus |
| `.grain` | Adds SVG film grain texture via `::after` pseudo-element |

### 8.4 Animation System (`components/ClientPage.tsx`)

All animations use Framer Motion with a shared cubic-bezier easing `[0.25, 0.46, 0.45, 0.94]` (mapped to `ease-luxury` in Tailwind).

| Variant | Effect | Used on |
|---|---|---|
| `fadeUp` | `y: 32 → 0, opacity: 0 → 1` (700ms) | Most content reveals |
| `fadeIn` | `opacity: 0 → 1` (600ms) | Navbar, brand strips |
| `stagger` | Parent container that staggers children by 120ms | Section headings, brand text |
| `slideFromLeft` | `x: -40 → 0, opacity: 0 → 1` (900ms) | Hero image panel |

The `Reveal` component (`ClientPage.tsx:36-61`) wraps any element in a `motion.div` that triggers its animation when scrolled into view (`useInView` with `once: true`, `-60px` margin).

---

## 9. Sanity.io Integration Details

### 9.1 Read Client (`sanity/lib/client.ts`)

```ts
createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,  // Serves from edge cache; up to ~60s stale after Studio saves
})
```

Used exclusively in server components via `client.fetch()`. Never imported in client components.

### 9.2 Write Client (`sanity/lib/writeClient.ts`)

```ts
createClient({
  ...same credentials...,
  useCdn: false,     // Must be false for mutations
  token: SANITY_API_WRITE_TOKEN,  // Server-only env var (no NEXT_PUBLIC_ prefix)
})
```

Used only in `/api/leads/route.ts`. The token must not be exposed to the browser.

### 9.3 Studio Configuration (`sanity.config.ts`)

- **Project name:** `ap-sanitations`
- **Studio path:** `/studio` (embedded in Next.js, not a standalone deployment)
- **Plugin:** `structureTool` (default sidebar structure)
- **Registered schemas:** `brand`, `product`, `productModel`, `lead`
- **Custom structure:** `sanity/structure.ts` (minor ordering customizations)

### 9.4 Asset Hosting

All images, videos, and PDFs are uploaded to **Sanity's CDN** (`cdn.sanity.io`). The `next.config.js` whitelists this domain for `next/image`:

```js
images: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
}
```

**Critical dependency:** If the Sanity free tier is exceeded or the project is downgraded, `cdn.sanity.io` assets become inaccessible and all product images, brand videos, and PDF catalogues break across the entire site.

---

## 10. Build & Deployment

**Framework:** Next.js 15 — output is a standard Node.js server (not static export).

**Build command:** `npm run build` → `next build`

**Start command:** `npm run start` → `next start`

**Static generation:** Brand and product category pages use `generateStaticParams()` — they are pre-rendered at build time using data fetched from Sanity. This means:
- Adding a new brand in the Studio requires a redeploy to create the static page for `/brands/[new-brand-id]`
- Unless Incremental Static Regeneration (ISR) or On-Demand Revalidation is configured (currently it is not)

**Environment variables needed at build time:**
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN` (needed at runtime for the leads API, but not at build time)

**Recommended deployment platform:** Vercel (zero-config with Next.js 15, edge network, ISR support). The `outputFileTracingRoot` in `next.config.js` is set to handle monorepo-style path resolution.

**No CI/CD pipeline** is currently configured (no `.github/workflows/`, no `vercel.json`).

---

## 11. Known Issues & Technical Debt

Issues are rated: **🔴 Critical** / **🟠 High** / **🟡 Medium** / **🟢 Low**

---

### 🔴 PRIORITY FIX #1 — CATEGORY_BRANDS is hardcoded in source code

**File:** `app/products/[category]/page.tsx:29-35`

```ts
const CATEGORY_BRANDS: Record<string, string[]> = {
  'wellness-spa': ['woven-gold', 'sofpour'],
  'pure-life': ['pnb-kitchenmate', 'sofpour'],
  'kitchen-harmony': ['anupam'],
  'swimming-pool': ['magicfalls', 'fountain-nozzles'],
  'invisible-infrastructure': [],
}
```

**Impact:** Every time a new brand is onboarded (a routine business event), a developer must edit source code and trigger a production redeploy. This is a critical gap for a non-technical owner.

**Fix (fully CMS-driven solution):**

1. Add `categories` field to `sanity/schemas/brand.ts`:
```ts
defineField({
  name: 'categories',
  type: 'array',
  title: 'Product Categories',
  description: 'Which product category pages should list this brand',
  of: [{ type: 'string' }],
  options: {
    list: [
      { title: 'Wellness & Spa', value: 'wellness-spa' },
      { title: 'Pure Life', value: 'pure-life' },
      { title: 'Kitchen Harmony', value: 'kitchen-harmony' },
      { title: 'Swimming Pool Systems', value: 'swimming-pool' },
      { title: 'Invisible Infrastructure', value: 'invisible-infrastructure' },
    ],
  },
}),
```

2. Update `getBrands()` and `getBrandBySlug()` GROQ queries in `sanity/lib/queries.ts` to include `categories` in the projection.

3. Update `Brand` interface in `data/brands.ts`:
```ts
categories?: string[]
```

4. Replace the hardcoded map in `app/products/[category]/page.tsx`:
```ts
// Before
const relevantBrandIds = CATEGORY_BRANDS[category] ?? []
const relevantBrands = allBrands.filter((b) => relevantBrandIds.includes(b.id))

// After
const relevantBrands = allBrands.filter((b) => b.categories?.includes(category))
```

5. In Sanity Studio, populate the `categories` field on each existing brand to match the current hardcoded values.

---

### 🔴 Issue #2 — Product detail page route is broken (404)

**File:** `app/products/[category]/[productId]/` — directory exists, `page.tsx` is missing.

Cards in `PaginatedProductGrid` and `GroupedProductGrid` link to `/products/${model.category}/${model._id}`. These routes currently 404. The `getProductModelById` query and `ProductModel` interface in `queries.ts` are already written — the page just needs to be built.

---

### 🟠 Issue #3 — Sanity CDN asset dependency is a single point of failure

All images, videos, and PDFs are hosted on `cdn.sanity.io`. If the Sanity free tier is exceeded or the plan is downgraded, all assets break simultaneously. See Section 13 for migration options.

---

### 🟠 Issue #4 — Static generation requires redeploy for new CMS content

New brands added in the Studio do not automatically get a `/brands/[brandId]` page until a redeploy. **Fix:** Configure ISR with `revalidate` export or on-demand revalidation via a Sanity webhook → Next.js revalidation API route.

---

### 🟡 Issue #5 — Lead deduplication is absent

The same phone number can be submitted multiple times. Sanity has no unique constraint mechanism. **Fix:** Query for an existing lead with the same phone before creating, or move leads to a proper database with a UNIQUE constraint (see Section 13).

---

### 🟡 Issue #6 — No lead notification system

Leads are written to Sanity but the business owner has no automated alert. The TODO comment in `app/api/leads/route.ts:22` references AiSensy but it is not implemented. **Fix:** Add a WhatsApp notification via AiSensy, Twilio, or a simple email via Resend/SendGrid on successful lead creation.

---

### 🟡 Issue #7 — PDF worker loaded from unpkg CDN

**File:** `components/CatalogueViewer.tsx:43`

```ts
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
```

This is a runtime dependency on a third-party CDN. If unpkg is unavailable, the PDF viewer fails. **Fix:** Copy the worker file from `node_modules/pdfjs-dist/build/` to `public/` and reference it as `/pdf.worker.min.mjs`.

---

### 🟡 Issue #8 — Hero section has no real image

**File:** `components/ClientPage.tsx:210-235`

The left half of the hero is a CSS gradient with a `// TODO: Replace this div with <Image>` comment. This is the most visually prominent section of the site. A real showroom or product photograph is needed.

---

### 🟡 Issue #9 — Founding date inconsistency

The hero label and site metadata say "Est. 2003" (founding of the business). The Heritage section opens "Since 1998" (start of Prem Sahni's career). Both facts are true but the presentation is inconsistent and can confuse first-time visitors. The metadata description also says "founded by Prem Sahni in 1999" which is a third date.

---

### 🟢 Issue #10 — `sanity/schemaTypes/` is dead code

Four boilerplate types (`authorType`, `postType`, `categoryType`, `blockContentType`) were generated by `sanity init` but are never registered in `sanity.config.ts` and are not used anywhere. They should be deleted to avoid confusion.

---

### 🟢 Issue #11 — `sanity/lib/live.ts` is unused

`SanityLive` and `sanityFetch` are configured but never used — all fetching uses `client.fetch()`. This file can be removed or the Live API can be adopted to replace `client.fetch()` for automatic cache invalidation.

---

### 🟢 Issue #12 — `SANITY_API_WRITE_TOKEN` not validated at startup

If this env var is missing, the API route throws at runtime (caught only by the generic `catch` block, returning HTTP 500 with no useful message). **Fix:** Add a startup assertion or return a clearer error: `if (!process.env.SANITY_API_WRITE_TOKEN) return NextResponse.json({ error: 'CMS write token not configured' }, { status: 503 })`.

---

### 🟢 Issue #13 — Bento grid card positions are hardcoded

**File:** `components/ClientPage.tsx:502-529`

The 5 bento cards are positioned with hardcoded `div` wrappers specifying `md:col-span-2 md:row-span-2` etc. Adding a 6th product category requires layout code changes, not just a CMS entry.

---

## 12. Improvement Roadmap

### 12.1 Priority Fixes (Before Next Deploy)

| # | Task | File(s) | Effort |
|---|---|---|---|
| 1 | Fix CATEGORY_BRANDS hardcoding (see Priority Fix #1 above) | `sanity/schemas/brand.ts`, `sanity/lib/queries.ts`, `data/brands.ts`, `app/products/[category]/page.tsx` | 2–3 hours |
| 2 | Build missing product detail page (`/products/[category]/[productId]`) | New `app/products/[category]/[productId]/page.tsx` | 3–4 hours |
| 3 | Fix PDF worker to self-host from `public/` | `components/CatalogueViewer.tsx`, `public/` | 30 min |
| 4 | Add lead notification (email or WhatsApp alert on new submission) | `app/api/leads/route.ts` | 2–4 hours |
| 5 | Delete dead code (`sanity/schemaTypes/`, `sanity/lib/live.ts`) | Multiple files | 15 min |

### 12.2 Short-term (1–4 Weeks)

| Task | Description | Benefit |
|---|---|---|
| Add hero photograph | Replace placeholder gradient with a real showroom/product image | Single biggest visual impact improvement |
| ISR / revalidation | Add `export const revalidate = 3600` to server pages or configure Sanity webhook → Next.js `revalidate` API | New CMS content goes live without deploys |
| Lead deduplication | Check for existing phone before inserting in `/api/leads` | Cleaner lead data for the owner |
| Consistent founding date | Align metadata, hero label, and Heritage copy to one narrative | Brand coherence |
| Add `SANITY_API_WRITE_TOKEN` guard | Return HTTP 503 with clear message if token is absent | Better production debugging |
| Address `useCdn` stale window | Document or mitigate the 60s CDN cache lag for time-sensitive updates | Operational awareness |

### 12.3 Long-term Architecture Upgrades

| Task | Description | Benefit |
|---|---|---|
| Migrate off Sanity CMS | Move to Supabase (recommended) — see Section 13 | Eliminates paid CDN dependency, free tier is sustainable |
| Product detail page | Complete the product model detail page with gallery, features, documents | Enables deeper product research |
| Lead CRM | Move lead storage to a real CRM or database with dedup, source tracking, and WhatsApp/email alerts | Turns lead capture into an actual sales funnel |
| ISR for brand/product pages | Currently these are static at build time; ISR would allow CMS changes to propagate without deploys | Owner independence |
| WhatsApp automation (AiSensy) | Implement the existing TODO — auto-send confirmation to customer + alert to owner | Immediate engagement on lead submission |
| Bento grid CMS-driven | Make card positions configurable in Sanity so adding a 6th category doesn't require a code change | Scalability |
| SEO enhancements | Add structured data (JSON-LD for LocalBusiness, Product) | Search visibility in Indore/MP market |
| Analytics | Add Vercel Analytics or Plausible | Track which brands/products drive the most leads |

---

## 13. CMS Migration — Moving Off Sanity

### 13.1 What Sanity Is Currently Doing

A full audit of Sanity dependencies:

| Capability | Current Sanity Usage | Migration Complexity |
|---|---|---|
| **Structured content** (brands, products, categories, leads) | GROQ queries, typed interfaces | Medium — rewrite queries as SQL/REST |
| **Asset storage** (images, videos, PDFs) | `cdn.sanity.io` — 100+ assets | **High** — re-upload all assets, update every URL in code |
| **Admin UI** (content editing for owner) | Embedded Studio at `/studio` | High — need an alternative editing interface |
| **Server-side writes** (leads API) | `writeClient.create()` | Low — swap for a DB insert call |
| **References** (productModel → brand) | GROQ dereference `brand->id.current` | Medium — use a foreign key join |
| **CDN delivery** | Automatic via `cdn.sanity.io` | Medium — need to configure a CDN for the new storage |

**Why migrate now:** The Sanity free tier after trial downgrade limits to 2 non-admin users, 5GB assets, and 500k API requests/month. The `cdn.sanity.io` domain for asset serving is part of the commercial tier — losing it breaks every product image, video, and PDF on the site simultaneously.

---

### 13.2 Migration Complexity Matrix

| Alternative | Admin UI | Asset storage | DB/queries | Lead writes | Free tier | Estimated effort |
|---|---|---|---|---|---|---|
| **Supabase** ✅ | Dashboard (table editor) | Supabase Storage + CDN | Postgres SQL / PostgREST | `supabase.from('leads').insert()` | 500MB DB, 1GB storage, generous API | 2–3 days |
| **Firebase / Firestore** | Firebase Console | Firebase Storage | NoSQL (similar to GROQ) | `collection.add()` | 1GB storage, 10GB/month bandwidth | 2–3 days |
| **Strapi (self-hosted)** | Full CMS UI (similar to Sanity) | Local / S3 | REST/GraphQL | REST API call | Free (self-hosted); hosting costs $5–10/mo | 3–5 days + server setup |
| **Contentful (free tier)** | Full CMS UI | Contentful CDN | REST/GraphQL | Contentful Management API | 5 users, 25k records, 1GB assets | 2–3 days |
| **Tina CMS (Git-based)** | Visual editor (OSS cloud free) | No native storage (use Cloudinary/R2) | Markdown/JSON files in git | Requires separate solution for writes | Free (cloud tier) | 3–4 days |

---

### 13.3 Option A: Supabase ✅ Recommended

**Why it fits this project:**
- **Postgres** is a natural replacement for GROQ — structured, typed, supports JOINs for `productModel → brand` references
- **Supabase Storage** handles images, videos, and PDFs with public URLs and optional CDN (Supabase CDN is included free)
- **Supabase Dashboard** is a clean table editor — sufficient for the owner to manage products/brands without writing code
- **`@supabase/ssr`** has first-class Next.js App Router support
- **Free tier** is genuinely generous: 500MB database, 1GB storage, 2GB bandwidth, unlimited API requests — sufficient for this project indefinitely

**Required code changes:**

1. Replace `sanity/lib/client.ts` and `writeClient.ts` with a Supabase client:
```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

2. Replace GROQ queries in `sanity/lib/queries.ts` with Supabase queries:
```ts
// getBrands()
const { data } = await supabase
  .from('brands')
  .select('*, catalogues(*), gallery(*)')
  .eq('hide_from_brands', false)
  .order('order')
```

3. Replace lead write in `app/api/leads/route.ts`:
```ts
await supabase.from('leads').insert({ phone, source, whatsapp_opt_in, submitted_at: new Date() })
```

4. Update all `cdn.sanity.io` image URLs to Supabase Storage public URLs.

5. Replace `/studio` with Supabase Dashboard for content management (or optionally add a lightweight admin page).

**Migration steps:**
1. Create a Supabase project (free)
2. Design the database schema (brands, products, product_models, leads, catalogues, gallery)
3. Export all documents from Sanity using `npx sanity dataset export`
4. Write a migration script to transform Sanity JSON → Supabase insert calls
5. Re-upload all images, videos, and PDFs from `pics/` to Supabase Storage
6. Update all image/PDF URLs in the migrated data
7. Replace Sanity client calls throughout the codebase
8. Test all pages and the leads API
9. Remove Sanity dependencies and the `/studio` route

**Estimated effort:** 2–3 days for a developer familiar with both platforms.

---

### 13.4 Option B: Firebase / Firestore

**Pros:** Google-backed, free Spark plan (1GB storage, 10GB/mo bandwidth), NoSQL document model is closer to Sanity's structure than SQL.

**Cons:** Firebase Console is not a content editor — the owner would need a custom admin UI or a third-party tool. Firebase Storage URLs are not clean CDN URLs. NoSQL queries are less ergonomic for joins (`productModel → brand` requires two fetches or denormalization). Long-term vendor lock-in.

**Recommended?** No. More setup work than Supabase for less editorial flexibility.

---

### 13.5 Option C: Strapi (Self-Hosted)

**Pros:** Full headless CMS with a rich admin UI (closest experience to Sanity Studio). REST + GraphQL out of the box. Completely free to use.

**Cons:** Requires a server to host Strapi (VPS or Railway/Render — ~$5–10/month). Adds operational complexity (Node.js process, database, file storage to manage). Overkill for a project of this size.

**Recommended?** Only if the owner needs a familiar Studio-like UI and is willing to pay ~$5–10/month for hosting.

---

### 13.6 Option D: Contentful (Free Tier)

**Pros:** Mature CMS with a polished editorial UI. Built-in CDN for images. 25,000 records and 1GB assets on free tier.

**Cons:** The free tier limits content types and environments. Contentful's API is REST/GraphQL — not as flexible as GROQ for nested queries. The asset CDN may have similar risk to Sanity if usage grows. Not significantly better than Sanity in the long run.

**Recommended?** No. Lateral move — same category of paid CDN dependency, similar migration complexity, similar long-term risk.

---

### 13.7 Option E: Tina CMS (Git-based)

**Pros:** Content is stored as JSON/MDX files in the git repository — zero backend cost. Visual editing interface is free on Tina Cloud. Content changes = git commits = natural version history.

**Cons:** Asset storage still needs a solution (Cloudinary, Cloudflare R2, or GitHub LFS — all have free tiers). Lead writes cannot go to a file — still need a separate lightweight database for that (e.g., a free Supabase table). Tina's query API is limited compared to SQL for complex filtering.

**Recommended?** Consider as a secondary option if you want zero hosting cost and are comfortable with a git-based workflow. Still pair with Supabase for leads.

---

### 13.8 Decision Matrix & Final Recommendation

| Criterion | Supabase | Firebase | Strapi | Contentful | Tina CMS |
|---|---|---|---|---|---|
| Free asset CDN | ✅ | ⚠ (limited) | ❌ (self-hosted) | ✅ | ❌ (needs addon) |
| Admin UI for owner | ⚠ (table editor) | ❌ | ✅ | ✅ | ✅ |
| Leads/write support | ✅ | ✅ | ✅ | ⚠ | ❌ (separate needed) |
| Migration effort | Medium | Medium | High | Medium | High |
| Long-term free tier | ✅ | ✅ | ✅ (hosting cost) | ⚠ | ✅ |
| Next.js App Router support | ✅ | ⚠ | ⚠ | ✅ | ✅ |

**Recommendation: Supabase.**

It is the only option that satisfies all three core requirements simultaneously: free asset CDN, server-side write support for leads, and a straightforward migration from the existing Postgres-friendly data model. The table editor is sufficient for the owner's use case (editing product descriptions, adding brands). The migration path is well-documented and the `@supabase/ssr` library is purpose-built for Next.js App Router.

If a richer CMS editing experience is required (comparable to Sanity Studio), pair Supabase with **Tina CMS** for editorial content and keep Supabase for leads and asset storage.

---

*Documentation generated from direct codebase analysis — April 2026.*
