import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";
import Script from "next/script";
import { PageTracking } from "@/components/PageTracking";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

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
  title: "Melodia - Personalized Songs for Every Occasion & Celebration",
  description:
    "Create personalized songs for weddings, birthdays, anniversaries, and every special moment. From Indian wedding ceremonies to romantic proposals, turn your stories into beautiful music.",
  keywords:
    "personalized songs, custom music, wedding songs, birthday songs, anniversary songs, romantic songs, friendship songs, party songs, kids songs, apology songs, corporate event songs, farewell songs, lullaby songs, sibling songs, congratulations songs, thank you songs, motivational songs, devotional songs, holiday songs, parent songs, Indian wedding songs, Indian shaadi songs, shaadi music, Mahila Sangeet songs, Haldi ceremony music, Mehendi ceremony songs, Sangeet songs, wedding music, shaadi songs, engagement songs, Roka ceremony songs, Tilak ceremony music, Baraat songs, Jaimala songs, Kanyadaan music, Phere ceremony songs, Sindoor ceremony music, Mangalsutra songs, Vidaai songs, reception songs, couple love songs, personalized wedding gifts, personalized shaadi gifts, custom song gifts, wedding entertainment, shaadi entertainment, Indian wedding DJ, wedding playlist, shaadi playlist, bridal songs, groom songs, family songs, Bollywood wedding songs, Punjabi shaadi songs, Indian wedding theme songs, Bollywood theme shaadi songs, royal wedding songs, Sufi wedding songs, Rajasthani shaadi songs, Melodia",
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
    title: "Melodia - Personalized Songs for Every Occasion & Celebration",
    description:
      "Create personalized songs for weddings, birthdays, anniversaries, and every special moment. From Indian wedding ceremonies to romantic proposals, turn your stories into beautiful music.",
    url: "https://melodia-songs.com",
    siteName: "Melodia",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Melodia - Personalized Songs for Every Occasion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melodia - Personalized Songs for Every Occasion & Celebration",
    description:
      "Create personalized songs for weddings, birthdays, anniversaries, and every special moment. From Indian wedding ceremonies to romantic proposals, turn your stories into beautiful music.",
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
        <Providers>
          <StructuredData type="website" />
          <StructuredData type="organization" />
          <PageTracking />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
