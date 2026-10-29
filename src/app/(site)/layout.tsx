import Analytics from "@/components/Common/Analytics";
import type { Metadata, Viewport } from "next";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import "@fontsource/noto-sans-bengali/bengali-400.css";
import "@fontsource/noto-sans-bengali/bengali-500.css";
import "@fontsource/noto-sans-bengali/bengali-600.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";
import MobileBottomNav from "@/components/Common/MobileBottomNav";
import WhatsAppFloat from "@/components/Common/WhatsAppFloat";
import JsonLd from "@/components/Common/JsonLd";
import Announcer from "@/components/Common/Announcer";
import Providers from "./providers";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLang } from "@/lib/i18n";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  API_URL,
  absoluteUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "gadgets Bangladesh",
    "mobile accessories",
    "earbuds",
    "headphones",
    "smartwatch",
    "charger",
    "power bank",
    "cables",
    "bluetooth speaker",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_BD",
    url: "/",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
  verification: {
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }),
    ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && {
      other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION },
    }),
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl(DEFAULT_OG_IMAGE),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <head>
        {/* Product images and API calls come from this origin. */}
        <link rel="preconnect" href={API_URL} crossOrigin="" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100000] focus:rounded-md focus:bg-brand-accent focus:px-4 focus:py-2 focus:font-medium focus:text-brand-dark"
        >
          {lang === "bn" ? "মূল বিষয়বস্তুতে যান" : "Skip to main content"}
        </a>
        <JsonLd data={siteSchema} />
        <Analytics />
        <Announcer />
        <LocaleProvider lang={lang}>
          <Providers>
            <Header />
            {children}
            <Footer />
            <MobileBottomNav />
            <WhatsAppFloat />
            <ScrollToTop />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
