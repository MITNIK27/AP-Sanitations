import type { Metadata } from 'next'
import Link from 'next/link'
import { APLogo } from '../../components/APLogo'

export const metadata: Metadata = {
  title: 'Terms of Use — AP Sanitations',
  description: 'Terms of Use for AP Sanitations, Indore. Please read these terms before using our website.',
}

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-cream text-charcoal">

      {/* Nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-cream/95 backdrop-blur-sm border-b border-stone/10">
        <Link
          href="/"
          className="font-sans text-sm text-stone hover:text-charcoal transition-colors duration-300 flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to site
        </Link>
        <Link href="/" className="hover:opacity-75 transition-opacity duration-300">
          <APLogo size="sm" variant="light" />
        </Link>
      </div>

      {/* Content */}
      <div className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <p className="label text-stone mb-4">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">Terms of Use</h1>
          <p className="font-sans text-sm text-stone/60 mb-12">
            Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: April 2026
          </p>

          <div className="rule-gold mb-12" />

          <div className="space-y-12 font-sans text-charcoal/80 leading-relaxed">

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the AP Sanitations website (&ldquo;Site&rdquo;), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this Site. AP Sanitations reserves the right to modify these terms at any time; continued use of the Site after any changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">2. Nature of the Website</h2>
              <p>
                This Site is a <strong>product showcase and enquiry platform</strong>. It is not an e-commerce store, and no purchases, payments, or binding contracts are formed through this website. All product information, specifications, and images are provided for informational purposes only and do not constitute an offer for sale.
              </p>
              <p className="mt-3">
                Actual product availability, pricing, and specifications are confirmed at our showroom or through direct communication with our team.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">3. Intellectual Property</h2>
              <p className="mb-3">
                The AP Sanitations name, logo, website design, layout, graphics, and original written content are the property of AP Sanitations and are protected under applicable intellectual property laws. You may not reproduce, distribute, modify, or commercially exploit any of our original content without prior written consent.
              </p>
              <p>
                Product images, brand logos, catalogues, and specifications displayed on this Site remain the intellectual property of their respective manufacturers (Anupam, Woven Gold, Sofpour, Morzze, and others). AP Sanitations displays this content as an authorised dealer. Any use of manufacturer content beyond personal browsing requires the manufacturer&apos;s consent.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">4. Product Information Disclaimer</h2>
              <p>
                We make every effort to ensure that product information on this Site is accurate and up to date. However, product specifications, features, finishes, and availability may change without notice. AP Sanitations does not warrant that any product information on this Site is complete, accurate, or current.
              </p>
              <p className="mt-3">
                Product images are representative only. Actual appearance, dimensions, and finishes may vary. Please visit our showroom or contact us for confirmed specifications before making a purchase decision.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">5. User Conduct</h2>
              <p className="mb-3">When using this Site, you agree not to:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Submit false, misleading, or fraudulent enquiry information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Use the Site for any unlawful purpose or in violation of any applicable laws</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Attempt to gain unauthorised access to any part of the Site or its infrastructure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Scrape, harvest, or systematically collect data from the Site without permission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Use the Site in a way that could damage, disable, or impair its operation</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">6. Enquiry Submissions</h2>
              <p>
                By submitting an enquiry through this Site, you confirm that the contact information you provide is accurate and that you consent to being contacted by AP Sanitations regarding your enquiry. Submitting an enquiry does not create a purchase obligation, a reservation, or any binding agreement between you and AP Sanitations.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">7. Third-Party Links</h2>
              <p>
                This Site may contain links to external websites including brand manufacturer websites, Google Maps, WhatsApp, and social media platforms. These links are provided for your convenience. AP Sanitations is not responsible for the content, accuracy, privacy practices, or availability of any third-party websites. Access to third-party sites is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, AP Sanitations shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of this Site, reliance on product information displayed here, or any enquiry submitted through this Site.
              </p>
              <p className="mt-3">
                The Site and all information on it are provided &ldquo;as is&rdquo; without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">9. Privacy</h2>
              <p>
                Your use of this Site is also governed by our{' '}
                <Link href="/privacy-policy" className="text-gold hover:underline transition-colors duration-300">
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms of Use by reference.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">10. Governing Law and Jurisdiction</h2>
              <p>
                These Terms of Use are governed by the laws of India. Any disputes arising from or relating to these terms or your use of this Site shall be subject to the exclusive jurisdiction of the competent courts in Indore, Madhya Pradesh, India.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">11. Contact</h2>
              <p>If you have any questions about these Terms of Use, please contact us:</p>
              <address className="not-italic mt-3 space-y-1">
                <p className="font-medium text-charcoal">AP Sanitations</p>
                <p>LG-4, 31, Samyak Park Building, Nehru Park Road,</p>
                <p>Builders Colony, Indore, Madhya Pradesh 452003</p>
                <p className="mt-2">
                  <a href="tel:9302104628" className="text-gold hover:underline">+91 9302104628</a>
                </p>
              </address>
            </section>

          </div>

          <div className="rule-gold mt-12 mb-8" />

          <p className="font-sans text-xs text-stone/50 text-center">
            © {new Date().getFullYear()} AP Sanitations, Indore. All rights reserved. &nbsp;·&nbsp;{' '}
            <Link href="/privacy-policy" className="hover:text-gold transition-colors duration-300">Privacy Policy</Link>
          </p>

        </div>
      </div>
    </main>
  )
}
