import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AP Sanitations — Luxury Water Solutions, Indore",
  description:
    "AP Sanitations is a premium sanitation dealership in Indore, founded by Prem Sahni in 1999. Over 25 years of trusted expertise across brands like Anupam, Woven Gold, Sofpour, and Silver Springs.",
  keywords: [
    "AP Sanitations",
    "Prem Sahni Indore",
    "luxury bathroom fittings Indore",
    "sanitation dealership Indore",
    "Anupam fittings",
    "Woven Gold bathroom",
    "Sofpour",
    "Silver Springs water",
    "premium sanitation Madhya Pradesh",
    "Samyak Park Building Indore",
  ],
  authors: [{ name: "AP Sanitations, Indore" }],
  creator: "AP Sanitations",
  openGraph: {
    title: "AP Sanitations — Luxury Water Solutions, Indore",
    description:
      "25+ years of trusted expertise. Signature Brand Collection. One family-owned dealership in the heart of Indore.",
    type: "website",
    locale: "en_IN",
    siteName: "AP Sanitations",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1914",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="font-sans bg-cream text-charcoal antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
