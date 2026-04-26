"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import { APLogo } from "@/components/APLogo";
import { SearchTriggerButton } from "@/components/SearchTriggerButton";
import type { Brand } from "@/data/brands";
import type { Product } from "@/data/products";
import { WA_NUMBER } from '@/lib/whatsapp'

// ─── Shared Animation Variants ────────────────────────────────────────────────

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const slideFromLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease } },
};

// ─── Scroll Reveal Helper ─────────────────────────────────────────────────────

function Reveal({
  children,
  variants = fadeUp,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── SVG Icons (thin line, no emoji) ─────────────────────────────────────────

function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  );
}

function IconMapPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconArrow({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── 1. Navbar ────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "Brands",   href: "#brands"   },
  { label: "About",    href: "#about"    },
];

function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Cream background — fades in on scroll via opacity so backdrop-blur doesn't snap */}
      <div
        className={`absolute inset-0 bg-cream/95 backdrop-blur-sm border-b border-gold/20 transition-opacity duration-700 ease-luxury ${
          scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div className="container-wide relative z-10">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a href="#home" className="group">
            <APLogo
              size="md"
              variant={scrolled ? 'light' : 'dark'}
              className="transition-all duration-400"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`link-underline transition-colors duration-400 ${
                  scrolled ? "text-charcoal" : "text-cream/70 hover:text-cream"
                }`}
              >
                {link.label}
              </a>
            ))}
            <SearchTriggerButton variant={scrolled ? "dark" : "light"} />
            <a
              href="#contact"
              className="text-sm font-sans font-medium transition-colors duration-400 text-gold hover:text-gold-dark"
            >
              Visit Showroom&nbsp;→
            </a>
          </nav>

          {/* Mobile: search + menu toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <SearchTriggerButton variant={scrolled ? "dark" : "light"} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`font-sans text-sm font-medium tracking-wide transition-colors duration-400 px-1 ${
                scrolled ? "text-charcoal" : "text-cream"
              }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            className="md:hidden bg-cream border-t border-stone/20 overflow-hidden"
          >
            <div className="container-wide py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-sans font-medium text-charcoal hover:text-gold transition-colors duration-400"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="block font-sans font-medium text-gold"
              >
                Visit Showroom →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─── 2. Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col md:flex-row overflow-hidden bg-charcoal"
    >
      {/* Top scrim — covers only the image panel, ensures logo/nav always readable */}
      <div className="absolute top-0 left-0 md:right-[45%] right-0 h-36 bg-gradient-to-b from-charcoal/70 to-transparent pointer-events-none z-10" />

      {/* Left — Framed showroom gallery */}
      <motion.div
        variants={slideFromLeft}
        initial="hidden"
        animate="visible"
        className="w-full md:w-[55%] min-h-[40vh] md:min-h-screen flex-shrink-0 flex flex-col gap-3 p-4 md:p-8 grain"
      >
        {/* Top frame — Showroom 1 */}
        <div className="relative flex-1 overflow-hidden rounded-sm ring-1 ring-gold/25">
          <Image
            src="/pics/Showroom1.jpeg"
            alt="AP Sanitations showroom"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
          {/* Top-to-bottom gradient so logo area is dark, fades to reveal image mid-way */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-transparent to-charcoal/35 pointer-events-none" />
        </div>

        {/* Bottom frame — Showroom 2 */}
        <div className="relative flex-1 overflow-hidden rounded-sm ring-1 ring-gold/25">
          <Image
            src="/pics/Sofpour.jpg"
            alt="AP Sanitations showroom products"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover brightness-[0.88] saturate-[1.2]"
          />
          {/* Stronger vignette to contain the industrial colours */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/35 via-transparent to-charcoal/60 pointer-events-none" />
        </div>
      </motion.div>

      {/* Right — Editorial text */}
      <div className="relative flex flex-1 md:flex-none w-full md:w-[45%] items-center px-5 sm:px-8 md:px-10 lg:px-14 py-8 md:py-0 md:border-l md:border-white/[0.06]">
        {/* Subtle teal atmospheric glow — ties back to the brand's green heritage */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(61,107,101,0.11) 0%, transparent 65%)' }}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-md relative"
        >
          {/* Label */}
          <motion.p variants={fadeUp} className="label mb-3 md:mb-6">
            Est.&nbsp;2003&nbsp;&nbsp;·&nbsp;&nbsp;Indore
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] leading-snug md:leading-[1.08] text-cream mb-4 md:mb-6"
          >
            To elevate every space with smart, sustainable, and luxurious water solutions.
          </motion.h1>

          {/* Rule + attribution */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-5 md:mb-8">
            <span className="rule-gold flex-shrink-0" />
            <span className="font-display italic text-stone text-sm md:text-base">
              — Prem Sahni, AP Sanitations
            </span>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp}>
            <a
              href="#brands"
              className="cta-ghost text-cream/70 hover:text-gold"
            >
              <span>Explore</span>
              <IconArrow />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 3. Philosophy Strip ──────────────────────────────────────────────────────

function PhilosophyStrip() {
  return (
    <Reveal variants={fadeIn}>
      <div className="bg-charcoal py-5 overflow-hidden">
        <p className="text-center label text-cream/40">
          Est.&nbsp;2003&nbsp;&nbsp;·&nbsp;&nbsp;Samyak Park Building,
          Indore&nbsp;&nbsp;·&nbsp;&nbsp;Authorized
          Dealer&nbsp;&nbsp;·&nbsp;&nbsp;Signature Brand Collection
        </p>
      </div>
    </Reveal>
  );
}

// ─── 4. Brand Showcase ────────────────────────────────────────────────────────

function BrandStrip({
  brand,
  index,
}: {
  brand: Brand;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isImageLeft = brand.layout === "image-left";

  return (
    <motion.div
      ref={ref}
      variants={fadeIn}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={`flex flex-col ${
        isImageLeft ? "md:flex-row" : "md:flex-row-reverse"
      } min-h-[60vh] border-b border-stone/10`}
    >
      {/* Image / Video side */}
      <div
        className={`relative w-full md:w-[40%] min-h-[56vw] md:min-h-0 overflow-hidden group ${
          brand.objectFit === 'contain' ? 'bg-white flex items-center justify-center p-6 md:p-10' : ''
        }`}
      >
        {brand.videoSrc ? (
          /* Video (e.g. Woven Gold) — autoplay, muted, looped */
          <video
            src={brand.videoSrc}
            poster={brand.videoPoster}
            autoPlay
            muted
            loop
            playsInline
            aria-label={brand.imageAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-800 ease-luxury group-hover:scale-[1.02]"
          />
        ) : brand.imageSrc ? (
          brand.objectFit === 'contain' ? (
            /* Contained image (e.g. PNB) — centred with padding, not stretched */
            <Image
              src={brand.imageSrc}
              alt={brand.imageAlt}
              width={480}
              height={600}
              className="relative w-full h-auto max-h-[60vh] object-contain transition-transform duration-800 ease-luxury group-hover:scale-[1.02]"
            />
          ) : (
            /* Cover image (e.g. Anupam, Sofpour) */
            <Image
              src={brand.imageSrc}
              alt={brand.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-800 ease-luxury group-hover:scale-[1.02]"
            />
          )
        ) : (
          /* Gradient fallback */
          <div
            className="absolute inset-0 transition-transform duration-800 ease-luxury group-hover:scale-[1.02]"
            style={{ background: brand.placeholderGradient }}
            aria-label={brand.imageAlt}
            role="img"
          />
        )}
      </div>

      {/* Text side */}
      <div
        className={`flex w-full md:w-[60%] flex-col justify-center py-10 md:py-0 ${
          isImageLeft ? 'px-5 sm:px-8 md:px-14 lg:px-20' : 'px-5 sm:px-8 lg:px-12'
        } ${
          index % 2 === 0 ? "bg-cream" : "bg-linen"
        }`}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-md"
        >
          <motion.p variants={fadeUp} className="label mb-5">
            Brand Partner
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-6xl lg:text-7xl leading-none text-charcoal mb-4 transition-colors duration-400 hover:text-gold cursor-default"
          >
            {brand.name}
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-stone text-sm mb-6 leading-relaxed">
            {brand.tagline}
          </motion.p>
          <motion.p variants={fadeUp} className="font-sans text-charcoal/70 text-sm leading-relaxed mb-8">
            {brand.description}
          </motion.p>
          <motion.a variants={fadeUp} href={`/brands/${brand.id}`} className="cta-ghost">
            <span>Enquire about {brand.name}</span>
            <IconArrow />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

function BrandShowcase({ brands }: { brands: Brand[] }) {
  return (
    <section id="brands">
      {/* Section header */}
      <div className="container-wide py-10 md:py-24">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="label mb-3 md:mb-4">Our Brands</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
              Curated for Excellence
            </h2>
          </div>
          <p className="font-sans text-stone text-sm max-w-xs leading-relaxed">
            We partner only with manufacturers who share our commitment to quality,
            craft, and the long-term wellbeing of your home.
          </p>
        </Reveal>
      </div>

      {/* Brand strips */}
      <div className="border-t border-stone/10">
        {brands.map((brand, i) => (
          <BrandStrip key={brand.id} brand={brand} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── 5. Products — Bento Grid ─────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={`bento-card group ${product.bg} ${product.text} ${product.gridCols} ${product.gridRows} border border-transparent hover:border-gold/40 transition-all duration-400`}
    >
      {/* Ghost number */}
      <div
        className="font-display text-[7rem] md:text-[10rem] leading-none font-bold select-none
                   absolute top-4 right-6 opacity-[0.08] group-hover:opacity-[0.2]
                   transition-opacity duration-400 pointer-events-none"
      >
        {product.number}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-end gap-4">
        <p className={`label ${product.text === "text-cream" ? "text-cream/50" : "text-stone"}`}>
          {product.category}
        </p>
        <h3 className="font-display text-3xl md:text-4xl leading-tight">
          {product.title}
        </h3>
        <p className={`font-sans text-sm leading-relaxed max-w-sm ${
          product.text === "text-cream" ? "text-cream/70" : "text-charcoal/60"
        }`}>
          {product.description}
        </p>
        <a href={`/products/${product.id}`} className="cta-ghost mt-2 self-start">
          <span>Learn more</span>
          <IconArrow />
        </a>
      </div>
    </motion.div>
  );
}

function Products({ products }: { products: Product[] }) {
  return (
    <section id="products" className="py-12 md:py-28 bg-cream">
      <div className="container-wide">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <p className="label mb-3 md:mb-4">What We Offer</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
              Solutions for Every Corner
            </h2>
          </div>
          <p className="font-sans text-stone text-sm max-w-xs leading-relaxed">
            From concealed systems behind the walls to the rainfall shower above —
            every water touchpoint in your home, considered.
          </p>
        </Reveal>

        {/* Bento grid — 3 cols, 3 rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-[28rem] md:auto-rows-[22rem]">
          {/* 01 Wellness & Spa — col 1-2, row 1-2 */}
          <div className="md:col-span-2 md:row-span-2 h-full">
            <ProductCard product={products[0]} />
          </div>

          {/* 02 Pure Life — col 3, row 1 */}
          <div className="md:col-span-1 md:row-span-1 h-full">
            <ProductCard product={products[1]} />
          </div>

          {/* 03 Kitchen Harmony — col 3, row 2 */}
          <div className="md:col-span-1 md:row-span-1 h-full">
            <ProductCard product={products[2]} />
          </div>

          {/* 04 Swimming Pool — col 1-2, row 3 */}
          <div className="md:col-span-2 md:row-span-1 h-full">
            <ProductCard product={products[3]} />
          </div>

          {/* 05 Invisible Infrastructure — col 3, row 3 */}
          <div className="md:col-span-1 md:row-span-1 h-full">
            <ProductCard product={products[4]} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. Heritage Timeline ─────────────────────────────────────────────────────

const timelineEvents = [
  {
    year: "1998",
    event:
      "Prem Sahni begins his journey in the sanitation industry — learning the craft through Jaquar, India's most respected bath fitting brand.",
  },
  {
    year: "2003",
    event:
      "AP Sanitations is established at Samyak Park Building, Indore — the same address it calls home today. The first chapter begins with Springs and bath fittings.",
  },
  {
    year: "2005",
    event:
      "Sole authorized dealer for Anupam in Madhya Pradesh — the first exclusive partnership, and a defining milestone for the business.",
  },
  {
    year: "2021",
    event:
      "Sofpour joins the catalogue — precision flow technology that changed the way our customers experience everyday water.",
  },
  {
    year: "2022",
    event:
      "Woven Gold partnership begins — a name that defines luxury sanitation in India, now available exclusively through AP Sanitations.",
  },
  {
    year: "Today",
    event:
      "Over 10,000 families across Indore and Madhya Pradesh served — and still counting.",
  },
];

function Heritage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-12 md:py-28 bg-linen overflow-hidden">
      {/* Watermark: घर (ghar = home) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span className="font-display  text-[20vw] leading-none text-charcoal/[0.05]">
          घर
        </span>
      </div>

      <div ref={ref} className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">

          {/* Left — Timeline */}
          <div>
            <Reveal className="mb-6 md:mb-10">
              <p className="label mb-3 md:mb-4">Our Heritage</p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
                Since 1998. One Craft. One Promise.
              </h2>
            </Reveal>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="relative pl-6"
            >
              {/* Vertical gold line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gold/40" />

              {timelineEvents.map((item) => (
                <motion.div
                  key={item.year}
                  variants={fadeUp}
                  className="relative mb-10 last:mb-0"
                >
                  {/* Dot */}
                  <div className="absolute -left-[1.4rem] top-1.5 w-2.5 h-2.5 rounded-full bg-gold" />

                  <p className="font-display text-gold text-2xl mb-1">{item.year}</p>
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — Story */}
          <div className="flex flex-col justify-center gap-8">
            <Reveal>
              <blockquote className="font-display italic text-3xl md:text-4xl lg:text-[2.6rem] text-charcoal leading-snug">
                "Built on trust, one home at a time."
              </blockquote>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-sans text-charcoal/70 text-sm leading-relaxed">
                Prem Sahni began his journey in the sanitation industry in 1998, building
                expertise through Jaquar — one of India's most trusted names in bath
                fittings. By 2003, he was ready to build something of his own. AP
                Sanitations opened at Samyak Park Building, Indore, and has stood at the
                same address ever since.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-sans text-charcoal/70 text-sm leading-relaxed">
                What he built was not just a dealership — it was a reputation, earned
                product by product and customer by customer. Every brand in the AP
                Sanitations portfolio has been personally vetted by Prem Sahni. Every
                product earns its place through merit, never convenience.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="border-l-2 border-gold pl-5 py-1">
                <p className="font-display italic text-xl text-charcoal/80">
                  "Every tap we fit, every tub and sink we install — it carries 25+
                  years of learning."
                </p>
                <p className="font-sans text-stone text-xs mt-2 tracking-wide">
                  — Prem Sahni
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex flex-wrap gap-3 pt-2">
                {["Est. 2003", "Expert Guidance", "Trusted Since 1998", "After-Sales Care"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="font-sans text-xs text-stone border border-stone/30 rounded-full px-4 py-1.5"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 7. Showroom CTA ─────────────────────────────────────────────────────────

function ShowroomCTA() {
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Enrichment form state
  const [leadId, setLeadId] = useState<string | null>(null);
  const [enriched, setEnriched] = useState(false);
  const [enrichSubmitted, setEnrichSubmitted] = useState(false);
  const [enrichSubmitting, setEnrichSubmitting] = useState(false);
  const [enrichName, setEnrichName] = useState("");
  const [enrichEmail, setEnrichEmail] = useState("");
  const [enrichEmailError, setEnrichEmailError] = useState("");
  const [enrichProduct, setEnrichProduct] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, source: "contact-form", whatsappOptIn }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setLeadId(data.leadId ?? null);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnrich() {
    if (!leadId) { setEnriched(true); return; }

    const payload: Record<string, string> = {};
    if (enrichName.trim())    payload.name = enrichName.trim();
    if (enrichEmail.trim())   payload.email = enrichEmail.trim();
    if (enrichProduct)        payload.productInterest = enrichProduct;

    if (Object.keys(payload).length === 0) { setEnriched(true); return; }

    if (enrichEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrichEmail.trim())) {
      setEnrichEmailError("Please enter a valid email address.");
      return;
    }
    setEnrichEmailError("");
    setEnrichSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, ...payload }),
      });
      setEnrichSubmitted(true);
    } catch {
      // silently ignore — phone is already saved
    } finally {
      setEnriched(true);
      setEnrichSubmitting(false);
    }
  }

  const enrichHasData = enrichName.trim() !== "" || enrichEmail.trim() !== "" || enrichProduct !== "";

  const waMessage = encodeURIComponent(
    `Hi, I submitted my number +91 ${phone.replace(/\D/g, "")} on the AP Sanitations website. Please get in touch.`
  );

  return (
    <section
      id="contact"
      className="relative py-12 md:py-28 bg-teal overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(90,145,137,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">

          {/* Left — Heading + contact */}
          <Reveal variants={fadeUp}>
            <p className="label text-cream/50 mb-6">Come Visit Us</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-cream leading-tight mb-6 md:mb-10">
              Come, see it<br />in person.
            </h2>

            <div className="space-y-6">
              {/* Mobile */}
              <a
                href="tel:9302104628"
                className="group flex items-start gap-4 text-cream/80 hover:text-cream transition-colors duration-400"
              >
                <IconPhone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gold" />
                <div>
                  <p className="label text-cream/40 mb-1">Mobile</p>
                  <p className="font-sans font-medium text-lg group-hover:text-gold transition-colors duration-400">
                    +91 9302104628
                  </p>
                </div>
              </a>

              {/* Landline */}
              <a
                href="tel:07314038838"
                className="group flex items-start gap-4 text-cream/80 hover:text-cream transition-colors duration-400"
              >
                <IconPhone className="w-5 h-5 mt-0.5 flex-shrink-0 text-gold" />
                <div>
                  <p className="label text-cream/40 mb-1">Landline</p>
                  <p className="font-sans font-medium text-lg group-hover:text-gold transition-colors duration-400">
                    0731-4038838
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-4 text-cream/80">
                <IconMapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gold" />
                <div>
                  <p className="label text-cream/40 mb-1">Our Showroom</p>
                  <p className="font-sans text-sm leading-relaxed">
                    Samyak Park Building,<br />
                    Indore, Madhya Pradesh 452001
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — Lead capture */}
          <Reveal variants={fadeUp} delay={0.15}>
            <div className="bg-cream/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-cream/10">
              {submitted ? (
                /* Success state */
                <div className="space-y-6">
                  <div>
                    <p className="font-display italic text-cream text-2xl md:text-3xl mb-3">
                      Thank you!
                    </p>
                    <p className="font-sans text-cream/80 text-sm leading-relaxed">
                      Our team at AP Sanitations will reach you at{" "}
                      <span className="text-gold font-medium">+91 {phone.replace(/\D/g, "")}</span>{" "}
                      within 24 hours.
                    </p>
                  </div>

                  {/* Primary CTA — always visible, always above enrichment form */}
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-cream rounded-xl px-5 py-3 transition-colors duration-300 text-sm font-sans font-medium w-fit"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Or chat with us on WhatsApp
                  </a>

                  {/* Enrichment confirmation — shown only after successful submit (not skip) */}
                  {enriched && enrichSubmitted && (
                    <p className="font-sans text-cream/60 text-xs">
                      Details received — we&apos;ll personalise your call.
                    </p>
                  )}

                  {/* Enrichment form — optional, disappears once submitted or skipped */}
                  {leadId && !enriched && (
                    <div>
                      <div className="border-t border-cream/10 pt-5">
                        <p className="font-sans text-cream/50 text-xs uppercase tracking-widest mb-4">
                          Help us serve you better <span className="normal-case">(optional)</span>
                        </p>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={enrichName}
                            onChange={(e) => setEnrichName(e.target.value)}
                            placeholder="Your name"
                            className="editorial-input"
                            aria-label="Your name"
                          />
                          <input
                            type="email"
                            value={enrichEmail}
                            onChange={(e) => { setEnrichEmail(e.target.value); setEnrichEmailError(""); }}
                            placeholder="Email address"
                            className="editorial-input"
                            aria-label="Email address"
                          />
                          {enrichEmailError && (
                            <p className="font-sans text-red-300 text-xs -mt-1">{enrichEmailError}</p>
                          )}
                          {/* Custom-styled select — wrapped for chevron overlay */}
                          <div className="relative">
                            <select
                              value={enrichProduct}
                              onChange={(e) => setEnrichProduct(e.target.value)}
                              className="editorial-input appearance-none cursor-pointer"
                              style={{
                                backgroundColor: '#446f6a',
                                color: enrichProduct ? '#F7F5F0' : 'rgba(253,252,250,0.4)',
                              }}
                              aria-label="What are you looking for?"
                            >
                              <option value=""        style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>What are you looking for?</option>
                              <option value="wellness-spa"              style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Wellness &amp; Spa</option>
                              <option value="pure-life"                 style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Pure Life (Water Purifiers)</option>
                              <option value="kitchen-harmony"           style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Kitchen Harmony</option>
                              <option value="swimming-pool"             style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Swimming Pool Systems</option>
                              <option value="invisible-infrastructure"  style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Invisible Infrastructure</option>
                              <option value="shower-systems"            style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Shower Systems</option>
                              <option value="bathroom-faucets"          style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Bathroom Faucets</option>
                              <option value="bathtubs"                  style={{ backgroundColor: '#2A4D49', color: '#F7F5F0' }}>Bathtubs</option>
                            </select>
                            {/* Custom chevron — replaces browser arrow removed by appearance-none */}
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="pointer-events-none absolute right-0 bottom-3.5 w-4 h-4 text-cream/40"
                              aria-hidden="true"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <button
                            onClick={handleEnrich}
                            disabled={!enrichHasData || enrichSubmitting}
                            className="font-sans text-sm text-cream/90 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300 border border-cream/20 hover:border-cream/40 rounded-lg px-4 py-2"
                          >
                            {enrichSubmitting ? "Submitting…" : "Submit details"}
                          </button>
                          <button
                            onClick={() => setEnriched(true)}
                            className="font-sans text-sm text-cream/40 hover:text-cream/70 transition-colors duration-300"
                          >
                            Skip →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Form state */
                <>
                  <p className="font-display italic text-cream text-2xl md:text-3xl mb-2">
                    Start your wellness journey
                  </p>
                  <p className="font-sans text-cream/60 text-sm mb-8">
                    Leave your number and our team will call you back.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="editorial-input"
                        aria-label="Your phone number"
                        maxLength={10}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        aria-label="Send"
                        className="absolute right-0 bottom-3 text-gold hover:text-gold-light transition-colors duration-400 disabled:opacity-50"
                      >
                        <IconArrow className="w-5 h-5" />
                      </button>
                    </div>

                    {/* WhatsApp opt-in */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={whatsappOptIn}
                        onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        className="w-4 h-4 rounded border-cream/30 bg-cream/10 accent-gold"
                      />
                      <span className="font-sans text-cream/60 text-xs group-hover:text-cream/80 transition-colors duration-300">
                        Send me updates on WhatsApp
                      </span>
                    </label>

                    {error && (
                      <p className="font-sans text-red-300 text-xs">{error}</p>
                    )}
                    <p className="font-sans text-cream/30 text-xs">
                      No spam. We&apos;ll reach out once to understand your needs.
                    </p>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── 8. Footer ────────────────────────────────────────────────────────────────

function Footer({ brands }: { brands: Brand[] }) {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Logo */}
      <div className="container-wide pt-16 md:pt-20 pb-10 border-b border-stone/20">
        <APLogo size="xl" variant="dark" tagline />
      </div>

      {/* 3-col info */}
      <div className="container-wide py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Address */}
          <div>
            <p className="label text-stone mb-4">Showroom</p>
            <address className="font-sans text-sm text-stone not-italic leading-relaxed">
              Samyak Park Building,<br />
              Indore, Madhya Pradesh 452001<br />
              <a
                href="tel:9302104628"
                className="text-cream/70 hover:text-gold transition-colors duration-400 mt-2 inline-block"
              >
                +91 9302104628
              </a>
              <br />
              <a
                href="tel:07314038838"
                className="text-cream/70 hover:text-gold transition-colors duration-400 mt-1 inline-block"
              >
                0731-4038838
              </a>
            </address>
          </div>

          {/* Brands */}
          <div className="md:text-center">
            <p className="label text-stone mb-4">Authorized Dealer</p>
            <div className="space-y-1.5">
              {brands.map((b) => (
                <p key={b.id} className="font-sans text-sm text-stone/70">
                  {b.name}
                </p>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="md:text-right">
            <p className="label text-stone mb-4">Navigate</p>
            <div className="space-y-1.5">
              {[...navLinks, { label: "Contact", href: "#contact" }].map((link) => (
                <p key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-stone/70 hover:text-gold transition-colors duration-400"
                  >
                    {link.label}
                  </a>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container-wide pb-8">
        <div className="border-t border-stone/20 pt-6 flex flex-col md:flex-row md:justify-between gap-2">
          <p className="font-sans text-xs text-stone/50">
            © {new Date().getFullYear()} AP Sanitations, Indore. All rights reserved.
          </p>
          <p className="font-sans text-xs text-stone/30">
            Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientPage({
  brands,
  products,
}: {
  brands: Brand[];
  products: Product[];
}) {
  return (
    <main>
      <Navbar />
      <Hero />
      <PhilosophyStrip />
      <BrandShowcase brands={brands} />
      <Products products={products} />
      <Heritage />
      <ShowroomCTA />
      <Footer brands={brands} />
    </main>
  );
}
