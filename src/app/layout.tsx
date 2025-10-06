import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import Script from "next/script";
import { PageTracking } from "@/components/PageTracking";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Melodia - Create Personalized Songs for Loved Ones",
  description:
    "Create joyful, personalized songs that celebrate your connections! Transform your stories into beautiful music that brings people together.",
  keywords:
    "personalized songs, custom music, friendship songs, joyful music, AI music, song writing, personalized gifts, music for loved ones, celebration songs",
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
    title: "Melodia - Melodia - Create Personalized Songs for Loved Ones",
    description:
      "Create joyful, personalized songs that celebrate your connections! Transform your stories into beautiful music that brings people together.",
    url: "https://melodia-songs.com",
    siteName: "Melodia",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Melodia Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melodia - Create Personalized Songs for Loved Ones",
    description:
      "Create joyful, personalized songs that celebrate your connections! Transform your stories into beautiful music that brings people together.",
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
      <body
        className={`${montserrat.variable} ${poppins.variable} font-body antialiased`}
      >
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <PageTracking />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
