import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Toaster } from "@/components/ui/sonner";

const GA_ID = "G-44LQP9Q2R1";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://fusecv.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FuseCV — AI-Powered CV Builder for the UK",
    template: "%s | FuseCV",
  },
  description:
    "Improve your CV with AI in 60 seconds. ATS-optimised, professionally formatted, ready to download. Used by thousands of UK job seekers.",
  keywords: [
    "CV builder UK", "AI CV builder", "ATS CV checker", "improve my CV",
    "CV template UK", "professional CV", "graduate CV", "executive CV",
  ],
  authors: [{ name: "FuseCV", url: SITE_URL }],
  creator: "FuseCV",
  publisher: "FuseCV",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "FuseCV",
    title: "FuseCV — AI-Powered CV Builder for the UK",
    description:
      "Improve your CV with AI in 60 seconds. ATS-optimised, professionally formatted, ready to download.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FuseCV — AI CV Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FuseCV — AI-Powered CV Builder for the UK",
    description: "Improve your CV with AI in 60 seconds. ATS-optimised and professionally formatted.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/fusecv-icon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: { canonical: SITE_URL },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "FuseCV",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/fusecv-logo.png`,
        width: 135,
        height: 42,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "FuseCV",
      description: "AI-powered CV builder for UK job seekers",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/guides?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
