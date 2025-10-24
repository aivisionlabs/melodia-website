import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import LyricalWavesBackground from "@/components/LyricalWavesBackground";
import { Music, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Personalized Mahila Sangeet Songs | Personalized songs for Your Sangeet Ceremony",
  description:
    "Create a unique, personalized song for your Sangeet. Celebrate your story with custom-made music that will make your sangeet ceremony unforgettable. Get a heartfelt song that captures the joy of your wedding.",
  keywords:
    "mahila sangeet songs, sangeet songs, wedding dance songs, shaadi dance songs, shadi songs, shadi dance songs, indian sangeet songs, personalized sangeet songs, songs for sangeet, wedding sangeet songs, Indian wedding music, custom wedding songs",
  openGraph: {
    title: "Personalized Mahila Sangeet Songs | Melodia",
    description:
      "Make your Mahila Sangeet unforgettable with a custom song that tells your story. Perfect for brides, grooms, and families.",
    url: "https://melodia-songs.com/mahila-sangeet",
    images: [
      {
        url: "/images/melodia-logo-og.jpeg",
        width: 792,
        height: 446,
        alt: "Personalized Mahila Sangeet Songs by Melodia",
      },
    ],
  },
  twitter: {
    title: "Personalized Mahila Sangeet Songs | Melodia",
    description:
      "Make your Mahila Sangeet unforgettable with a custom song that tells your story. Perfect for brides, grooms, and families.",
    images: ["/images/melodia-logo-og.jpeg"],
  },
  alternates: {
    canonical: "/mahila-sangeet",
  },
};

export default function SangeetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col overflow-x-hidden relative">
      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary-yellow/20 via-transparent to-accent-coral/10 text-center pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-32 px-4 relative overflow-hidden">
          <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl font-bold text-text-teal font-heading max-w-3xl mx-auto leading-tight">
            <span className="bg-gradient-to-r from-text-teal via-accent-coral to-text-teal bg-clip-text text-transparent animate-fade-in">
              Personalized Indian Wedding Dance Songs,
            </span>
            <br />
            <span
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              For Your Special Dance Performance
            </span>
          </h1>
          <p
            className="text-text-teal/80 mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Make your Mahila Sangeet truly special with a custom song that tells
            your unique story. A beautiful, heartfelt musical memory for your
            wedding celebration.
          </p>
          <div
            className="mt-6 sm:mt-8 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <ShareRequirementsCTA size="lg" />
          </div>
          <LyricalWavesBackground />
        </section>

        {/* Why a Custom Song Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-teal text-center font-heading mb-8 sm:mb-12">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-yellow" />
                Why a Personalized Song for Your Sangeet?
                <Sparkles className="w-6 h-6 text-primary-yellow" />
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-bold text-text-teal font-heading mb-2">
                  A Unique Story
                </h3>
                <p className="text-text-teal/80">
                  Your song will be crafted from your memories, inside jokes,
                  and special moments.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-teal font-heading mb-2">
                  An Emotional Highlight
                </h3>
                <p className="text-text-teal/80">
                  Create a touching moment that everyone at the sangeet will
                  remember forever.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-teal font-heading mb-2">
                  The Perfect Gift
                </h3>
                <p className="text-text-teal/80">
                  A wonderful surprise for the bride, groom, or a tribute to the
                  family.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-teal font-heading mb-12">
              From Your Story to a Sangeet Hit in 3 Simple Steps
            </h2>
            {/* Simplified How It Works Steps */}
            <p className="text-text-teal/80 text-lg">
              1. Share the details of your story and what you want to express.
              <br />
              2. Our talented artists will compose and produce your custom
              sangeet song.
              <br />
              3. Receive your professionally produced song, ready for the big
              night!
            </p>
            <div className="mt-8">
              <ShareRequirementsCTA />
            </div>
          </div>
        </section>

        {/* CTA to Library */}
        <section className="py-12 sm:py-16 md:py-20 px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-teal font-heading mb-4">
            Need Some Inspiration?
          </h2>
          <p className="text-text-teal/80 max-w-2xl mx-auto mb-8">
            Listen to some of the beautiful wedding songs we&apos;ve created for
            other happy couples.
          </p>
          <Link href="/library">
            <Button
              variant="outline"
              size="lg"
              className="bg-gradient-to-r from-white to-primary-yellow/10 hover:from-primary-yellow/20 hover:to-white text-text-teal font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-primary-yellow hover:border-accent-coral hover:scale-105"
            >
              <Music className="h-5 w-5 mr-2" />
              Explore Our Wedding Song Library
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
