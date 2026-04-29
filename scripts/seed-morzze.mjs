/**
 * seed-morzze.mjs
 * Seeds the Morzze brand document and all product models into Sanity.
 *
 * Source: Product codes scraped from morzze.com/products (April 2026).
 * Note:  Individual product images are NOT available via the Morzze website.
 *        Product cards will display the Morzze brand logo as fallback.
 *        When the official Morzze dealer image catalogue is received, upload images
 *        to Sanity Studio manually or re-run this script with imageUrl fields added.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-morzze.mjs
 *
 * IMPORTANT: Run this ONCE. Re-running will attempt to create duplicate documents.
 * To re-seed cleanly, delete existing Morzze productModel documents from Sanity Studio first.
 */

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// ── Brand document ─────────────────────────────────────────────────────────────
const BRAND_DOC = {
  _id: 'brand-morzze',
  _type: 'brand',
  id: { _type: 'slug', current: 'morzze' },
  name: 'Morzze',
  tagline: 'Where Innovation Meets Timeless Elegance',
  description: "India's top premium kitchen and bathroom sinks manufacturer. Morzze brings 89+ years of heritage to every product — from stainless steel and granite kitchen sinks to bathroom faucets, towel warmers, and floor drainers. Engineered for performance, crafted for luxury.",
  layout: 'image-right',
  placeholderGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  objectFit: 'contain',
  hideFromBrands: false,
  categories: [
    'kitchen-harmony',
    'wellness-spa',
    'bathroom-faucets',
    'invisible-infrastructure',
  ],
  order: 6,
}

// ── Product definitions ────────────────────────────────────────────────────────
// Naming convention: "Morzze [Series/Category] [ModelCode] [Type]"
// Descriptions and features are provisional — update when official catalogue is received.

const PRODUCTS = [

  // ── Steel Sinks — Aura Series (kitchen-harmony) ────────────────────────────
  { id: 'productModel-morzze-aura-a01-201', name: 'Morzze Aura A01-201 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Single bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A01-201', 'Stainless steel construction', 'Aura series'], order: 100 },
  { id: 'productModel-morzze-aura-a01-202', name: 'Morzze Aura A01-202 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Single bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A01-202', 'Stainless steel construction', 'Aura series'], order: 101 },
  { id: 'productModel-morzze-aura-a01-203', name: 'Morzze Aura A01-203 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Single bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A01-203', 'Stainless steel construction', 'Aura series'], order: 102 },
  { id: 'productModel-morzze-aura-a01-204', name: 'Morzze Aura A01-204 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Single bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A01-204', 'Stainless steel construction', 'Aura series'], order: 103 },
  { id: 'productModel-morzze-aura-a02-205', name: 'Morzze Aura A02-205 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Double bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A02-205', 'Double bowl', 'Stainless steel construction', 'Aura series'], order: 104 },
  { id: 'productModel-morzze-aura-a02-206', name: 'Morzze Aura A02-206 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Double bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A02-206', 'Double bowl', 'Stainless steel construction', 'Aura series'], order: 105 },
  { id: 'productModel-morzze-aura-a03-207', name: 'Morzze Aura A03-207 Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Triple bowl stainless steel kitchen sink from the premium Aura series.', features: ['Model: A03-207', 'Triple bowl', 'Stainless steel construction', 'Aura series'], order: 106 },
  { id: 'productModel-morzze-aura-a01-208lx', name: 'Morzze Aura A01-208LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury single bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A01-208LX', 'Luxury LX finish', 'Stainless steel', 'Aura series'], order: 107 },
  { id: 'productModel-morzze-aura-a01-209lx', name: 'Morzze Aura A01-209LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury single bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A01-209LX', 'Luxury LX finish', 'Stainless steel', 'Aura series'], order: 108 },
  { id: 'productModel-morzze-aura-a02-210lx', name: 'Morzze Aura A02-210LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury double bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A02-210LX', 'Double bowl', 'Luxury LX finish', 'Aura series'], order: 109 },
  { id: 'productModel-morzze-aura-a02-211lx', name: 'Morzze Aura A02-211LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury double bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A02-211LX', 'Double bowl', 'Luxury LX finish', 'Aura series'], order: 110 },
  { id: 'productModel-morzze-aura-a02-212lx', name: 'Morzze Aura A02-212LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury double bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A02-212LX', 'Double bowl', 'Luxury LX finish', 'Aura series'], order: 111 },
  { id: 'productModel-morzze-aura-a02-213lx', name: 'Morzze Aura A02-213LX Steel Sink', category: 'kitchen-harmony', subCategory: 'Aura Series', description: 'Premium luxury double bowl stainless steel kitchen sink from the Aura LX series.', features: ['Model: A02-213LX', 'Double bowl', 'Luxury LX finish', 'Aura series'], order: 112 },

  // ── Granite Sinks — Vertex Series (kitchen-harmony) ────────────────────────
  { id: 'productModel-morzze-vertex-v01-101', name: 'Morzze Vertex V01-101 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-101', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 200 },
  { id: 'productModel-morzze-vertex-v01-102', name: 'Morzze Vertex V01-102 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-102', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 201 },
  { id: 'productModel-morzze-vertex-v01-103', name: 'Morzze Vertex V01-103 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-103', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 202 },
  { id: 'productModel-morzze-vertex-v01-104', name: 'Morzze Vertex V01-104 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-104', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 203 },
  { id: 'productModel-morzze-vertex-v01-105', name: 'Morzze Vertex V01-105 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-105', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 204 },
  { id: 'productModel-morzze-vertex-v01-106', name: 'Morzze Vertex V01-106 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Single bowl granite kitchen sink. Heat-resistant and scratch-resistant composite granite construction.', features: ['Model: V01-106', 'Granite composite', 'Heat resistant', 'Vertex series'], order: 205 },
  { id: 'productModel-morzze-vertex-v02-107', name: 'Morzze Vertex V02-107 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Double bowl granite kitchen sink from the Vertex series.', features: ['Model: V02-107', 'Double bowl', 'Granite composite', 'Vertex series'], order: 206 },
  { id: 'productModel-morzze-vertex-v03-109', name: 'Morzze Vertex V03-109 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Triple bowl granite kitchen sink from the Vertex series.', features: ['Model: V03-109', 'Triple bowl', 'Granite composite', 'Vertex series'], order: 207 },
  { id: 'productModel-morzze-vertex-v03-110', name: 'Morzze Vertex V03-110 Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Triple bowl granite kitchen sink from the Vertex series.', features: ['Model: V03-110', 'Triple bowl', 'Granite composite', 'Vertex series'], order: 208 },
  { id: 'productModel-morzze-vertex-v01-111lx', name: 'Morzze Vertex V01-111LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury single bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V01-111LX', 'Luxury LX finish', 'Granite composite', 'Vertex series'], order: 209 },
  { id: 'productModel-morzze-vertex-v01-112lx', name: 'Morzze Vertex V01-112LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury single bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V01-112LX', 'Luxury LX finish', 'Granite composite', 'Vertex series'], order: 210 },
  { id: 'productModel-morzze-vertex-v01-113lx', name: 'Morzze Vertex V01-113LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury single bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V01-113LX', 'Luxury LX finish', 'Granite composite', 'Vertex series'], order: 211 },
  { id: 'productModel-morzze-vertex-v01-114lx', name: 'Morzze Vertex V01-114LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury single bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V01-114LX', 'Luxury LX finish', 'Granite composite', 'Vertex series'], order: 212 },
  { id: 'productModel-morzze-vertex-v02-115lx', name: 'Morzze Vertex V02-115LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury double bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V02-115LX', 'Double bowl', 'Luxury LX finish', 'Vertex series'], order: 213 },
  { id: 'productModel-morzze-vertex-v02-116lx', name: 'Morzze Vertex V02-116LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury double bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V02-116LX', 'Double bowl', 'Luxury LX finish', 'Vertex series'], order: 214 },
  { id: 'productModel-morzze-vertex-v02-117lx', name: 'Morzze Vertex V02-117LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury double bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V02-117LX', 'Double bowl', 'Luxury LX finish', 'Vertex series'], order: 215 },
  { id: 'productModel-morzze-vertex-v02-118lx', name: 'Morzze Vertex V02-118LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury double bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V02-118LX', 'Double bowl', 'Luxury LX finish', 'Vertex series'], order: 216 },
  { id: 'productModel-morzze-vertex-v02-119lx', name: 'Morzze Vertex V02-119LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury double bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V02-119LX', 'Double bowl', 'Luxury LX finish', 'Vertex series'], order: 217 },
  { id: 'productModel-morzze-vertex-v03-120lx', name: 'Morzze Vertex V03-120LX Granite Sink', category: 'kitchen-harmony', subCategory: 'Vertex Series', description: 'Luxury triple bowl granite kitchen sink from the Vertex LX premium line.', features: ['Model: V03-120LX', 'Triple bowl', 'Luxury LX finish', 'Vertex series'], order: 218 },

  // ── Kitchen Faucets (kitchen-harmony) ──────────────────────────────────────
  { id: 'productModel-morzze-mkf-30421', name: 'Morzze Kitchen Faucet MKF-30421', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet. Smooth single-lever operation with aerator for controlled flow.', features: ['Model: MKF-30421', 'Single lever', 'Aerator included', 'Chrome finish'], order: 300 },
  { id: 'productModel-morzze-mkf-30422', name: 'Morzze Kitchen Faucet MKF-30422', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30422', 'Single lever', 'Chrome finish'], order: 301 },
  { id: 'productModel-morzze-mkf-30423', name: 'Morzze Kitchen Faucet MKF-30423', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30423', 'Single lever', 'Chrome finish'], order: 302 },
  { id: 'productModel-morzze-mkf-30424', name: 'Morzze Kitchen Faucet MKF-30424', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30424', 'Single lever', 'Chrome finish'], order: 303 },
  { id: 'productModel-morzze-mkf-30425', name: 'Morzze Kitchen Faucet MKF-30425', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30425', 'Single lever', 'Chrome finish'], order: 304 },
  { id: 'productModel-morzze-mkfg-30426', name: 'Morzze Kitchen Faucet MKFG-30426', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen faucet with gold finish for a luxurious kitchen aesthetic.', features: ['Model: MKFG-30426', 'Gold finish', 'Single lever'], order: 305 },
  { id: 'productModel-morzze-mkf-30427', name: 'Morzze Kitchen Faucet MKF-30427', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30427', 'Single lever', 'Chrome finish'], order: 306 },
  { id: 'productModel-morzze-mkf-30428', name: 'Morzze Kitchen Faucet MKF-30428', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30428', 'Single lever', 'Chrome finish'], order: 307 },
  { id: 'productModel-morzze-mkf-30429', name: 'Morzze Kitchen Faucet MKF-30429', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30429', 'Single lever', 'Chrome finish'], order: 308 },
  { id: 'productModel-morzze-mkf-30430', name: 'Morzze Kitchen Faucet MKF-30430', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30430', 'Single lever', 'Chrome finish'], order: 309 },
  { id: 'productModel-morzze-mkf-30431', name: 'Morzze Kitchen Faucet MKF-30431', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30431', 'Single lever', 'Chrome finish'], order: 310 },
  { id: 'productModel-morzze-mkf-30432', name: 'Morzze Kitchen Faucet MKF-30432', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30432', 'Single lever', 'Chrome finish'], order: 311 },
  { id: 'productModel-morzze-mkf-30433', name: 'Morzze Kitchen Faucet MKF-30433', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30433', 'Single lever', 'Chrome finish'], order: 312 },
  { id: 'productModel-morzze-mkf-30434', name: 'Morzze Kitchen Faucet MKF-30434', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30434', 'Single lever', 'Chrome finish'], order: 313 },
  { id: 'productModel-morzze-mkcf-30435', name: 'Morzze Kitchen Faucet MKCF-30435', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium concealed kitchen faucet with sleek integrated design.', features: ['Model: MKCF-30435', 'Concealed fitting', 'Chrome finish'], order: 314 },
  { id: 'productModel-morzze-mkff-30436', name: 'Morzze Kitchen Faucet MKFF-30436', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium flexible kitchen faucet with pull-out functionality.', features: ['Model: MKFF-30436', 'Flexible/pull-out', 'Chrome finish'], order: 315 },
  { id: 'productModel-morzze-mkff-30437', name: 'Morzze Kitchen Faucet MKFF-30437', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium flexible kitchen faucet with pull-out functionality.', features: ['Model: MKFF-30437', 'Flexible/pull-out', 'Chrome finish'], order: 316 },
  { id: 'productModel-morzze-mkff-30438', name: 'Morzze Kitchen Faucet MKFF-30438', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium flexible kitchen faucet with pull-out functionality.', features: ['Model: MKFF-30438', 'Flexible/pull-out', 'Chrome finish'], order: 317 },
  { id: 'productModel-morzze-mkf-30439', name: 'Morzze Kitchen Faucet MKF-30439', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30439', 'Single lever', 'Chrome finish'], order: 318 },
  { id: 'productModel-morzze-mkcf-30440', name: 'Morzze Kitchen Faucet MKCF-30440', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium concealed kitchen faucet with sleek integrated design.', features: ['Model: MKCF-30440', 'Concealed fitting', 'Chrome finish'], order: 319 },
  { id: 'productModel-morzze-mkcf-30441', name: 'Morzze Kitchen Faucet MKCF-30441', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium concealed kitchen faucet with sleek integrated design.', features: ['Model: MKCF-30441', 'Concealed fitting', 'Chrome finish'], order: 320 },
  { id: 'productModel-morzze-mkf-30442', name: 'Morzze Kitchen Faucet MKF-30442', category: 'kitchen-harmony', subCategory: 'Kitchen Faucets', description: 'Premium kitchen mixer faucet with smooth single-lever operation.', features: ['Model: MKF-30442', 'Single lever', 'Chrome finish'], order: 321 },

  // ── Food Waste Disposers (kitchen-harmony) ─────────────────────────────────
  { id: 'productModel-morzze-mfd-1101', name: 'Morzze Food Waste Disposer MFD-1101', category: 'kitchen-harmony', subCategory: 'Food Waste Disposers', description: 'Efficient food waste disposer that grinds kitchen waste and flushes it away. Reduces household waste significantly.', features: ['Model: MFD-1101', 'Electric motor driven', 'Easy installation', 'Compatible with standard kitchen sinks'], order: 400 },
  { id: 'productModel-morzze-mfd-1102', name: 'Morzze Food Waste Disposer MFD-1102', category: 'kitchen-harmony', subCategory: 'Food Waste Disposers', description: 'Heavy-duty food waste disposer for high-frequency kitchen use.', features: ['Model: MFD-1102', 'High-capacity motor', 'Stainless steel grind chamber', 'Quiet operation'], order: 401 },

  // ── Kitchen Accessories (kitchen-harmony) ──────────────────────────────────
  { id: 'productModel-morzze-msd-21', name: 'Morzze Soap Dispenser MSD-21', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'In-sink liquid soap dispenser for kitchen countertops. Elegant design, easy to refill.', features: ['Model: MSD-21', 'In-sink mounting', 'Refillable pump'], order: 500 },
  { id: 'productModel-morzze-msd-22', name: 'Morzze Soap Dispenser MSD-22', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'In-sink liquid soap dispenser. Brushed finish.', features: ['Model: MSD-22', 'In-sink mounting', 'Brushed finish'], order: 501 },
  { id: 'productModel-morzze-msd-23', name: 'Morzze Soap Dispenser MSD-23', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'In-sink liquid soap dispenser. Matte finish.', features: ['Model: MSD-23', 'In-sink mounting', 'Matte finish'], order: 502 },
  { id: 'productModel-morzze-mss-501', name: 'Morzze Sink Strainer MSS-501', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Stainless steel sink basket strainer. Prevents food particles from entering drain.', features: ['Model: MSS-501', 'Stainless steel', 'Standard drain fit'], order: 503 },
  { id: 'productModel-morzze-mgs-502', name: 'Morzze Granite Strainer MGS-502', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Granite-matched sink strainer for Vertex series sinks.', features: ['Model: MGS-502', 'Granite finish', 'Vertex sink compatible'], order: 504 },
  { id: 'productModel-morzze-mssc-5011', name: 'Morzze Colander Strainer MSSC-5011', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Colander-style sink strainer for easy drainage control.', features: ['Model: MSSC-5011', 'Colander design', 'Stainless steel'], order: 505 },
  { id: 'productModel-morzze-mhs-31', name: 'Morzze Hand Shower MHS-31', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Kitchen sink hand shower attachment for easy rinsing.', features: ['Model: MHS-31', 'Flexible hose', 'Easy attachment'], order: 506 },
  { id: 'productModel-morzze-mda-901', name: 'Morzze Drain Adapter MDA-901', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Sink drain pipe adapter for standard plumbing connections.', features: ['Model: MDA-901', 'Standard fit'], order: 507 },
  { id: 'productModel-morzze-mda-902', name: 'Morzze Drain Adapter MDA-902', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Sink drain pipe adapter.', features: ['Model: MDA-902'], order: 508 },
  { id: 'productModel-morzze-mda-903', name: 'Morzze Drain Adapter MDA-903', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Sink drain pipe adapter.', features: ['Model: MDA-903'], order: 509 },
  { id: 'productModel-morzze-mda-904', name: 'Morzze Drain Adapter MDA-904', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Sink drain pipe adapter.', features: ['Model: MDA-904'], order: 510 },
  { id: 'productModel-morzze-mda-905', name: 'Morzze Drain Adapter MDA-905', category: 'kitchen-harmony', subCategory: 'Kitchen Accessories', description: 'Sink drain pipe adapter.', features: ['Model: MDA-905'], order: 511 },

  // ── Granite Wash Basins (wellness-spa) ─────────────────────────────────────
  { id: 'productModel-morzze-mbb-401', name: 'Morzze Granite Wash Basin MBB-401', category: 'wellness-spa', subCategory: 'Granite Wash Basins', description: 'Premium granite composite bathroom wash basin. Durable, heat-resistant, and elegantly styled.', features: ['Model: MBB-401', 'Granite composite', 'Heat resistant', 'Premium finish'], order: 600 },
  { id: 'productModel-morzze-mbb-402', name: 'Morzze Granite Wash Basin MBB-402', category: 'wellness-spa', subCategory: 'Granite Wash Basins', description: 'Premium granite composite bathroom wash basin in alternate profile.', features: ['Model: MBB-402', 'Granite composite', 'Heat resistant'], order: 601 },
  { id: 'productModel-morzze-mbb-403', name: 'Morzze Granite Wash Basin MBB-403', category: 'wellness-spa', subCategory: 'Granite Wash Basins', description: 'Premium granite composite bathroom wash basin.', features: ['Model: MBB-403', 'Granite composite', 'Heat resistant'], order: 602 },
  { id: 'productModel-morzze-mbb-404', name: 'Morzze Granite Wash Basin MBB-404', category: 'wellness-spa', subCategory: 'Granite Wash Basins', description: 'Premium granite composite bathroom wash basin.', features: ['Model: MBB-404', 'Granite composite', 'Heat resistant'], order: 603 },

  // ── Bathroom Faucets (bathroom-faucets) ────────────────────────────────────
  { id: 'productModel-morzze-mbf-501', name: 'Morzze Bathroom Faucet MBF-501', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet. Smooth cartridge operation with chrome finish.', features: ['Model: MBF-501', 'Single lever mixer', 'Chrome finish', 'Ceramic cartridge'], order: 700 },
  { id: 'productModel-morzze-mbf-501t', name: 'Morzze Bathroom Faucet MBF-501T', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium thermostatic bathroom faucet with precise temperature control.', features: ['Model: MBF-501T', 'Thermostatic control', 'Chrome finish'], order: 701 },
  { id: 'productModel-morzze-mbf-502', name: 'Morzze Bathroom Faucet MBF-502', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-502', 'Single lever', 'Chrome finish'], order: 702 },
  { id: 'productModel-morzze-mbf-503', name: 'Morzze Bathroom Faucet MBF-503', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-503', 'Single lever', 'Chrome finish'], order: 703 },
  { id: 'productModel-morzze-mbf-504', name: 'Morzze Bathroom Faucet MBF-504', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-504', 'Single lever', 'Black finish'], order: 704 },
  { id: 'productModel-morzze-mbf-505', name: 'Morzze Bathroom Faucet MBF-505', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-505', 'Single lever', 'Black finish'], order: 705 },
  { id: 'productModel-morzze-mbf-506', name: 'Morzze Bathroom Faucet MBF-506', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-506', 'Single lever', 'Chrome finish'], order: 706 },
  { id: 'productModel-morzze-mbf-507', name: 'Morzze Bathroom Faucet MBF-507', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-507', 'Single lever', 'Chrome finish'], order: 707 },
  { id: 'productModel-morzze-mbf-508', name: 'Morzze Bathroom Faucet MBF-508', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-508', 'Single lever', 'Chrome finish'], order: 708 },
  { id: 'productModel-morzze-mbf-509', name: 'Morzze Bathroom Faucet MBF-509', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-509', 'Single lever', 'Chrome finish'], order: 709 },
  { id: 'productModel-morzze-mbf-510', name: 'Morzze Bathroom Faucet MBF-510', category: 'bathroom-faucets', subCategory: 'Bathroom Faucets', description: 'Premium single-lever bathroom basin mixer faucet.', features: ['Model: MBF-510', 'Single lever', 'Chrome finish'], order: 710 },

  // ── Air Tap (bathroom-faucets) ─────────────────────────────────────────────
  { id: 'productModel-morzze-mat-4010', name: 'Morzze Air Tap MAT-4010', category: 'bathroom-faucets', subCategory: 'Air Tap', description: 'Innovative touchless hand dryer faucet. Wash and dry hands in one single fixture. Hygienic and space-saving design.', features: ['Model: MAT-4010', 'Touchless sensor', 'Integrated wash + dry', 'Hygienic no-touch operation', 'Energy efficient'], order: 800 },

  // ── Towel Warmers (bathroom-faucets) ───────────────────────────────────────
  { id: 'productModel-morzze-mtw-6040', name: 'Morzze Towel Warmer MTW-6040', category: 'bathroom-faucets', subCategory: 'Towel Warmers', description: 'Electric towel warmer rail. Keeps towels warm and dry, adds a premium touch to any bathroom.', features: ['Model: MTW-6040', 'Electric heating', '60cm width', 'Chrome finish'], order: 900 },
  { id: 'productModel-morzze-mtw-8050', name: 'Morzze Towel Warmer MTW-8050', category: 'bathroom-faucets', subCategory: 'Towel Warmers', description: 'Electric towel warmer rail for larger bathrooms.', features: ['Model: MTW-8050', 'Electric heating', '80cm width', 'Chrome finish'], order: 901 },
  { id: 'productModel-morzze-mtw-11050', name: 'Morzze Towel Warmer MTW-11050', category: 'bathroom-faucets', subCategory: 'Towel Warmers', description: 'Wide electric towel warmer rail with extended reach for larger towels.', features: ['Model: MTW-11050', 'Electric heating', '110cm width', 'Chrome finish'], order: 902 },
  { id: 'productModel-morzze-mtw-12050', name: 'Morzze Towel Warmer MTW-12050', category: 'bathroom-faucets', subCategory: 'Towel Warmers', description: 'Premium wide-format electric towel warmer for luxury bathrooms.', features: ['Model: MTW-12050', 'Electric heating', '120cm width', 'Chrome finish'], order: 903 },

  // ── Floor Drainers (invisible-infrastructure) ──────────────────────────────
  { id: 'productModel-morzze-msd-601', name: 'Morzze Floor Drainer MSD-601', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Stainless steel floor drain with anti-odour trap. Ideal for bathrooms, kitchens, and utility areas.', features: ['Model: MSD-601', 'Stainless steel', 'Anti-odour trap', 'Easy to clean'], order: 1000 },
  { id: 'productModel-morzze-msd-602', name: 'Morzze Floor Drainer MSD-602', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Stainless steel floor drain with anti-odour trap.', features: ['Model: MSD-602', 'Stainless steel', 'Anti-odour trap'], order: 1001 },
  { id: 'productModel-morzze-msd-603', name: 'Morzze Floor Drainer MSD-603', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Stainless steel floor drain with anti-odour trap.', features: ['Model: MSD-603', 'Stainless steel', 'Anti-odour trap'], order: 1002 },
  { id: 'productModel-morzze-mbd-604', name: 'Morzze Floor Drainer MBD-604', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain with anti-odour trap.', features: ['Model: MBD-604', 'Black matte finish', 'Anti-odour trap'], order: 1003 },
  { id: 'productModel-morzze-mbd-605', name: 'Morzze Floor Drainer MBD-605', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-605', 'Black matte finish'], order: 1004 },
  { id: 'productModel-morzze-mbd-606', name: 'Morzze Floor Drainer MBD-606', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-606', 'Black matte finish'], order: 1005 },
  { id: 'productModel-morzze-mbd-607', name: 'Morzze Floor Drainer MBD-607', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-607', 'Black matte finish'], order: 1006 },
  { id: 'productModel-morzze-mbd-608', name: 'Morzze Floor Drainer MBD-608', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-608', 'Black matte finish'], order: 1007 },
  { id: 'productModel-morzze-mbd-609', name: 'Morzze Floor Drainer MBD-609', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-609', 'Black matte finish'], order: 1008 },
  { id: 'productModel-morzze-mbd-610', name: 'Morzze Floor Drainer MBD-610', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-610', 'Black matte finish'], order: 1009 },
  { id: 'productModel-morzze-mbd-611', name: 'Morzze Floor Drainer MBD-611', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-611', 'Black matte finish'], order: 1010 },
  { id: 'productModel-morzze-mbd-612', name: 'Morzze Floor Drainer MBD-612', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-612', 'Black matte finish'], order: 1011 },
  { id: 'productModel-morzze-mbd-613', name: 'Morzze Floor Drainer MBD-613', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-613', 'Black matte finish'], order: 1012 },
  { id: 'productModel-morzze-mbd-614', name: 'Morzze Floor Drainer MBD-614', category: 'invisible-infrastructure', subCategory: 'Floor Drainers', description: 'Black matte finish floor drain.', features: ['Model: MBD-614', 'Black matte finish'], order: 1013 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildProductDoc(product, brandId) {
  return {
    _type: 'productModel',
    _id: product.id,
    name: product.name,
    brand: { _type: 'reference', _ref: brandId },
    category: product.category,
    subCategory: product.subCategory,
    description: product.description,
    features: product.features,
    order: product.order,
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏭 Seeding Morzze brand + products into Sanity...\n')

  // 1. Create or fetch the brand document
  let brandId
  const existingBrand = await client.getDocument('brand-morzze')

  if (existingBrand) {
    console.log(`✅ Brand already exists: brand-morzze (${existingBrand.name})`)
    brandId = 'brand-morzze'
  } else {
    console.log('📦 Creating Morzze brand document...')
    const created = await client.createOrReplace(BRAND_DOC)
    brandId = created._id
    console.log(`✅ Brand created: ${brandId}`)
  }

  // 2. Create product model documents
  console.log(`\n📦 Creating ${PRODUCTS.length} Morzze product models...\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const product of PRODUCTS) {
    try {
      const existing = await client.getDocument(product.id)
      if (existing) {
        console.log(`  ⏭  Skip (exists): ${product.name}`)
        skipCount++
        continue
      }

      const doc = buildProductDoc(product, brandId)
      await client.createOrReplace(doc)
      console.log(`  ✅ Created: ${product.name}`)
      successCount++
    } catch (err) {
      console.error(`  ❌ Error: ${product.name} — ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n── Summary ──────────────────────────────────────`)
  console.log(`  ✅ Created:  ${successCount}`)
  console.log(`  ⏭  Skipped:  ${skipCount}`)
  console.log(`  ❌ Errors:   ${errorCount}`)
  console.log(`  Total:       ${PRODUCTS.length}`)
  console.log(`\n🎉 Done! Visit /brands/morzze to verify the brand page.`)
  console.log(`\n📸 Next step: Upload product images via Sanity Studio once`)
  console.log(`   the official Morzze dealer catalogue is received.`)
  console.log(`   Contact Morzze: WhatsApp 87503 13000 | info@morzze.com`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
