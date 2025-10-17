import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with Melodia",
  description:
    "Have questions about creating personalized songs? Contact Melodia via phone (+91-8880522285), WhatsApp, or email (info@melodia-songs.com). We're here to help create your perfect musical gift!",
  keywords:
    "contact melodia, customer support, personalized songs help, melodia phone number, melodia email, melodia whatsapp, reach melodia team",
  openGraph: {
    title: "Contact Melodia - We're Here to Help",
    description:
      "Get in touch with our team for personalized song inquiries. Call, email, or message us on WhatsApp.",
    url: "https://melodia-songs.com/contact",
    siteName: "Melodia",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Contact Melodia",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Melodia",
    description: "Get in touch with our team for personalized song inquiries.",
    images: ["/images/melodia-logo-og.jpeg"],
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
