import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import LyricalWavesBackground from "@/components/LyricalWavesBackground";
import { Music, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Custom Wedding Songs | Personalized Music for Your Special Day",
  description:
    "Create the perfect personalized wedding song for your ceremony, reception, or special moments. From romantic ballads to celebration anthems, make your wedding unforgettable.",
  keywords:
    "wedding songs, personalized wedding songs, custom wedding music, wedding ceremony songs, wedding reception songs, wedding first dance songs, wedding processional songs, wedding vows songs",
  openGraph: {
    title:
      "Custom Wedding Songs | Personalized Music for Your Special Day | Melodia",
    description:
      "Create the perfect personalized wedding song for your ceremony, reception, or special moments. From romantic ballads to celebration anthems, make your wedding unforgettable.",
    url: "https://melodia-songs.com/occasions/weddings",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Custom Wedding Songs | Personalized Music for Your Special Day by Melodia",
      },
    ],
  },
  twitter: {
    title:
      "Custom Wedding Songs | Personalized Music for Your Special Day | Melodia",
    description:
      "Create the perfect personalized wedding song for your ceremony, reception, or special moments. From romantic ballads to celebration anthems, make your wedding unforgettable.",
    images: ["/images/melodia-logo-og.jpeg"],
  },
  alternates: {
    canonical: "/occasions/weddings",
  },
};

export default function uweddingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col overflow-x-hidden relative">
      <Header />
      <main className="flex-1 relative z-10">
        <section className="w-full bg-gradient-to-br from-primary-yellow/20 via-transparent to-accent-coral/10 text-center pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-32 px-4 relative overflow-hidden">
          <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl font-bold text-text-teal font-heading max-w-3xl mx-auto leading-tight">
            <span className="bg-gradient-to-r from-text-teal via-accent-coral to-text-teal bg-clip-text text-transparent animate-fade-in">
              Unforgettable Wedding Songs,
            </span>
            <br />
            <span
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Personalized Just For You
            </span>
          </h1>
          <p
            className="text-text-teal/80 mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Make your wedding day truly magical with a custom song that tells
            your unique love story.
          </p>
          <div
            className="mt-6 sm:mt-8 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <ShareRequirementsCTA size="lg" text="Create Wedding Song" />
          </div>
          <LyricalWavesBackground />
        </section>

        <section className="py-12 sm:py-16 md:py-20 px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-teal font-heading mb-4">
            Need Some Inspiration?
          </h2>
          <p className="text-text-teal/80 max-w-2xl mx-auto mb-8">
            Listen to some of the beautiful songs we&apos;ve created for other
            happy customers.
          </p>
          <Link href="/library">
            <Button
              variant="outline"
              size="lg"
              className="bg-gradient-to-r from-white to-primary-yellow/10 hover:from-primary-yellow/20 hover:to-white text-text-teal font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-primary-yellow hover:border-accent-coral hover:scale-105"
            >
              <Music className="h-5 w-5 mr-2" />
              Explore Our Song Library
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
