import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import LyricalWavesBackground from "@/components/LyricalWavesBackground";
import { Music, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Congratulations Songs | Personalized Music for Achievements",
  description: "Celebrate achievements and milestones with custom congratulatory songs that honor success and inspire continued greatness. Perfect for graduations, promotions, or any accomplishment.",
  keywords: "congratulations songs, personalized congratulations songs, achievement songs, success songs, graduation songs, promotion songs, milestone songs, celebration songs",
  openGraph: {
    title: "Congratulations Songs | Personalized Music for Achievements | Melodia",
    description: "Celebrate achievements and milestones with custom congratulatory songs that honor success and inspire continued greatness. Perfect for graduations, promotions, or any accomplishment.",
    url: "https://melodia-songs.com/occasions/congratulations",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Congratulations Songs | Personalized Music for Achievements by Melodia",
      },
    ],
  },
  twitter: {
    title: "Congratulations Songs | Personalized Music for Achievements | Melodia",
    description: "Celebrate achievements and milestones with custom congratulatory songs that honor success and inspire continued greatness. Perfect for graduations, promotions, or any accomplishment.",
    images: ["/images/melodia-logo-og.jpeg"],
  },
  alternates: {
    canonical: "/occasions/congratulations",
  },
};

export default function ucongratulationsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Personalized Congratulations Songs",
    description: "Celebrate achievements and milestones with custom congratulatory songs that honor success and inspire continued greatness. Perfect for graduations, promotions, or any accomplishment.",
    provider: {
      "@type": "Organization",
      name: "Melodia",
      url: "https://melodia-songs.com",
    },
    serviceType: "Music Creation",
    category: "Celebration Music",
    url: "https://melodia-songs.com/occasions/congratulations",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col overflow-x-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1 relative z-10">
        <section className="w-full bg-gradient-to-br from-primary-yellow/20 via-transparent to-accent-coral/10 text-center pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-32 px-4 relative overflow-hidden">
          <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl font-bold text-text-teal font-heading max-w-3xl mx-auto leading-tight">
            <span className="bg-gradient-to-r from-text-teal via-accent-coral to-text-teal bg-clip-text text-transparent animate-fade-in">
              Unforgettable Congratulations Songs,
            </span>
            <br />
            <span className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Personalized Just For You
            </span>
          </h1>
          <p className="text-text-teal/80 mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Celebrate achievements and milestones with a custom song that honors success and inspires continued greatness.
          </p>
          <div className="mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <ShareRequirementsCTA size="lg" text="Create Congratulations Song" />
          </div>
          <LyricalWavesBackground />
        </section>

        <section className="py-12 sm:py-16 md:py-20 px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-teal font-heading mb-4">
                Need Some Inspiration?
            </h2>
            <p className="text-text-teal/80 max-w-2xl mx-auto mb-8">
                Listen to some of the beautiful songs we&apos;ve created for other happy customers.
            </p>
            <Link href="/library">
                <Button variant="outline" size="lg" className="bg-gradient-to-r from-white to-primary-yellow/10 hover:from-primary-yellow/20 hover:to-white text-text-teal font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-primary-yellow hover:border-accent-coral hover:scale-105">
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
