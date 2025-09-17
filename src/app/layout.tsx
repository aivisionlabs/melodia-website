import type { Metadata } from "next";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import Script from "next/script";
import { PageTracking } from "@/components/PageTracking";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ToastProvider } from "@/components/ui/toast";


export const metadata: Metadata = {
  title: "Melodia - Create Personalized Songs for loved ones",
  description:
    "Transform your emotions, stories, and dreams into beautiful music with Melodia's song creation platform.",
  keywords:
    "personalized songs, custom music, music creation, AI music, song writing, personalized gifts, music for loved ones",
  authors: [{ name: "Melodia" }],
  creator: "Melodia",
  publisher: "Melodia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://melodia-songs.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Melodia - Create Personalized Songs for loved ones",
    description:
      "Transform your emotions, stories, and dreams into beautiful music with Melodia's song creation platform.",
    url: "https://melodia-songs.com",
    siteName: "Melodia",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 1200,
        height: 630,
        alt: "Melodia Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melodia - Create Personalized Songs for loved ones",
    description:
      "Transform your emotions, stories, and dreams into beautiful music with Melodia's song creation platform.",
    images: ["/images/melodia-logo-og.jpeg"],
    creator: "@melodia",
    site: "@melodia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Fonts - Melodia Design System */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FFD166" />
        <meta name="msapplication-TileColor" content="#FFD166" />
        <meta name="apple-mobile-web-app-title" content="Melodia" />

        {/* Google tag (gtag.js) - Production only */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-TJW2DN7ND5"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-TJW2DN7ND5');
              `}
            </Script>
          </>
        )}
      </head>
      <body suppressHydrationWarning={true}>
        <ErrorBoundary>
          <ToastProvider>
            <StructuredData type="website" />
            <StructuredData type="organization" />
            <PageTracking />
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
