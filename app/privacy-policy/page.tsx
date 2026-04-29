import type { Metadata } from 'next'
import Link from 'next/link'
import { APLogo } from '../../components/APLogo'

export const metadata: Metadata = {
  title: 'Privacy Policy — AP Sanitations',
  description: 'Privacy Policy for AP Sanitations, Indore. How we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
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
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">Privacy Policy</h1>
          <p className="font-sans text-sm text-stone/60 mb-12">
            Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: April 2026
          </p>

          <div className="rule-gold mb-12" />

          <div className="space-y-12 font-sans text-charcoal/80 leading-relaxed">

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">1. Who We Are</h2>
              <p>
                AP Sanitations (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an authorized dealership for premium bathroom and kitchen brands, located at LG-4, 31, Samyak Park Building, Nehru Park Road, Builders Colony, Indore, Madhya Pradesh 452003. This website is operated for the purpose of showcasing our product range and enabling customers to make product enquiries.
              </p>
              <p className="mt-3">
                This Privacy Policy explains how we collect, use, and protect information you provide when you use our website or contact us.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">2. Information We Collect</h2>
              <p className="mb-3">We only collect information you voluntarily provide:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span><strong>Phone number</strong> — when you submit an enquiry via our contact form.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span><strong>Name and email address</strong> — optionally, when you provide additional details after your initial enquiry.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span><strong>WhatsApp opt-in preference</strong> — whether you agree to be contacted via WhatsApp for product updates and follow-ups.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span><strong>Product interest</strong> — the product category you expressed interest in, so we can give relevant information.</span>
                </li>
              </ul>
              <p className="mt-4">
                We do <strong>not</strong> collect payment information, create user accounts, or process any financial transactions through this website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information you provide solely to:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Respond to your product enquiry by phone or WhatsApp</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Send you product catalogues or relevant information you requested</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Follow up on your showroom visit or product demonstration request</span>
                </li>
              </ul>
              <p className="mt-4">
                We do <strong>not</strong> use your information for unsolicited marketing, and we do <strong>not</strong> sell, rent, or share your personal data with third parties for their own purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">4. Data Storage</h2>
              <p>
                Enquiry data (phone number, optional name, email, and product interest) is stored securely in our content management system (Sanity.io), which uses industry-standard encryption and access controls. Only authorised staff at AP Sanitations can access this data.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">5. WhatsApp Communications</h2>
              <p>
                If you initiate a WhatsApp conversation with us via the links on this website, your WhatsApp number and conversation history are subject to WhatsApp&apos;s own Privacy Policy (Meta Platforms). We use WhatsApp only to respond to your product enquiries and do not send unsolicited messages.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">6. Cookies and Analytics</h2>
              <p>
                This website may use basic browser cookies for functionality (e.g., remembering your browsing position on product pages). We do not currently use advertising cookies or cross-site tracking. If analytics tools are added in future, this policy will be updated accordingly.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">7. Your Rights</h2>
              <p className="mb-3">
                Under applicable Indian data protection laws, you have the right to:
              </p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Request access to the personal data we hold about you</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                  <span>Request deletion of your data</span>
                </li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, contact us at{' '}
                <a href="tel:9302104628" className="text-gold hover:underline">+91 9302104628</a>{' '}
                or visit our showroom.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">8. Third-Party Links</h2>
              <p>
                This website contains links to brand manufacturer websites, Google Maps, WhatsApp, Instagram, and Facebook. We are not responsible for the privacy practices of these external services. We encourage you to review their respective privacy policies.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">9. Governing Law</h2>
              <p>
                This Privacy Policy is governed by the laws of India, including the Information Technology Act 2000 and the Information Technology (Amendment) Act 2008. Any disputes shall be subject to the exclusive jurisdiction of courts in Indore, Madhya Pradesh.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be reflected in the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the website after any update constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-charcoal mb-4">11. Contact Us</h2>
              <address className="not-italic space-y-1">
                <p className="font-medium text-charcoal">AP Sanitations</p>
                <p>LG-4, 31, Samyak Park Building, Nehru Park Road,</p>
                <p>Builders Colony, Indore, Madhya Pradesh 452003</p>
                <p className="mt-2">
                  <a href="tel:9302104628" className="text-gold hover:underline">+91 9302104628</a>
                </p>
                <p>
                  <a href="tel:07314038838" className="text-gold hover:underline">0731-4038838</a>
                </p>
              </address>
            </section>

          </div>

          <div className="rule-gold mt-12 mb-8" />

          <p className="font-sans text-xs text-stone/50 text-center">
            © {new Date().getFullYear()} AP Sanitations, Indore. All rights reserved. &nbsp;·&nbsp;{' '}
            <Link href="/terms-of-use" className="hover:text-gold transition-colors duration-300">Terms of Use</Link>
          </p>

        </div>
      </div>
    </main>
  )
}
