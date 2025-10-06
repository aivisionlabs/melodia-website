"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import { customCreations, testimonials } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { Play, Music, Star, Heart, Gift } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { CenterLogo } from "@/components/OptimizedLogo";
import { trackNavigationEvent, trackPlayerEvent } from "@/lib/analytics";

// Component for animated images (GIFs, animated PNGs) that preserves animation
const AnimatedImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
  // eslint-disable-next-line @next/next/no-img-element
}) => <img src={src} alt={alt} className={className} loading="lazy" />;

export default function HomePage() {
  const [selectedSong, setSelectedSong] = useState<
    (typeof customCreations)[0] | null
  >(null);

  return (
    <div className="min-h-screen bg-secondary-cream flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-primary-yellow to-yellow-300 text-center py-12 sm:py-16 md:py-20 px-4">
          <CenterLogo
            alt="Melodia"
            className="mx-auto mb-4 sm:mb-6 w-24 h-24 sm:w-32 sm:h-32"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-teal font-heading max-w-2xl mx-auto">
            Gift a Personalized Song, Create a Timeless Memory
          </h1>
          <p className="text-text-teal/80 mt-3 sm:mt-4 text-base sm:text-lg max-w-xl mx-auto">
            Turn your favorite stories and memories into a unique, heartfelt
            song for your loved ones. The most personal gift imaginable.
          </p>
          <div className="mt-6 sm:mt-8">
            <ShareRequirementsCTA size="lg" />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-teal text-center font-heading mb-8 sm:mb-12">
            Create the Perfect Musical Gift in 3 Steps
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-accent-coral text-white rounded-full p-4 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-text-teal font-heading">
                1. Share Your Story
              </h3>
              <p className="text-text-teal/80 mt-2 text-sm sm:text-base">
                Tell us about your favorite person and what makes your bond
                special.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent-coral text-white rounded-full p-4 mb-4">
                <Music className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-text-teal font-heading">
                2. We Compose Your Song
              </h3>
              <p className="text-text-teal/80 mt-2 text-sm sm:text-base">
                Our creative team crafts beautiful lyrics and melodies that
                bring your story to life.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent-coral text-white rounded-full p-4 mb-4">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-text-teal font-heading">
                3. Gift Your Song
              </h3>
              <p className="text-text-teal/80 mt-2 text-sm sm:text-base">
                Receive a beautiful, studio-quality song ready to be shared and
                cherished.
              </p>
            </div>
          </div>
        </section>

        {/* Image Separator */}
        <div className="py-8 sm:py-12 flex justify-center">
          <AnimatedImage
            src="/lovable-uploads/spinning-wheel-image.png"
            alt="Lullaby"
            className="mx-auto w-48 md:w-56 lg:w-auto max-w-full"
          />
        </div>

        {/* Joyful Creations Section */}
        <section
          id="creations"
          className="bg-primary-yellow/20 py-12 sm:py-16 md:py-20 px-4"
          aria-labelledby="creations-title"
        >
          <div className="text-center">
            <h2
              id="creations-title"
              className="text-2xl sm:text-3xl font-bold text-text-teal mb-4 font-heading"
            >
              Joyful Creations
            </h2>
            <p className="text-text-teal/80 max-w-2xl mx-auto mb-8">
              Listen to some of the heartfelt songs we&apos;ve helped create.
            </p>
            <Link href="/library">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 text-text-teal font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg border-2 border-primary-yellow hover:border-yellow-500"
                onClick={() => {
                  trackNavigationEvent.click(
                    "library_cta",
                    window.location.href,
                    "button"
                  );
                }}
              >
                <Music className="h-5 w-5 mr-2" />
                Explore All Joyful Songs
              </Button>
            </Link>
          </div>

          <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {customCreations.slice(0, 6).map((song) => (
              <div
                key={song.id}
                className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    trackPlayerEvent.play(song.title, song.slug, false);
                    setSelectedSong(song);
                  }}
                  className="h-14 w-14 p-0 flex-shrink-0 bg-primary-yellow shadow-md hover:bg-yellow-500 border-2 border-white transition-all duration-200 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 rounded-full"
                >
                  <Play className="h-6 w-6 text-text-teal" />
                </Button>
                <div className="ml-4 min-w-0 flex-1">
                  <Link href={`/library/${song.slug}`}>
                    <span className="text-sm sm:text-base font-semibold text-text-teal block cursor-pointer hover:underline truncate">
                      {song.title}
                    </span>
                  </Link>
                  <span className="text-xs sm:text-sm text-gray-600 block">
                    {song.categories?.join(", ") || song.music_style}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
                  {formatDuration(song.duration)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-12 sm:py-16 md:py-20 px-4"
          aria-labelledby="testimonials-title"
        >
          <div className="text-center">
            <h2
              id="testimonials-title"
              className="text-2xl sm:text-3xl font-bold text-text-teal mb-4 font-heading"
            >
              Spreading Joy, One Song at a Time!
            </h2>
            <p className="text-text-teal/80 max-w-2xl mx-auto mb-8 sm:mb-12">
              Here&apos;s what our happy customers have to say.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-primary-yellow fill-current"
                    />
                  ))}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-text-teal mb-2 font-heading">
                  {testimonial.title}
                </h3>
                <blockquote className="text-sm sm:text-base text-gray-700 italic border-l-4 border-primary-yellow pl-4">
                  {testimonial.content}
                </blockquote>
                <p className="text-right text-sm text-gray-600 font-medium mt-4">
                  - {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Media Player Modal */}
      {selectedSong && (
        <MediaPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.music_style ?? "",
            song_url: selectedSong.song_url ?? undefined,
            timestamp_lyrics: selectedSong.timestamp_lyrics ?? undefined,
            timestamped_lyrics_variants:
              selectedSong.timestamped_lyrics_variants ?? undefined,
            selected_variant: selectedSong.selected_variant ?? undefined,
            slug: selectedSong.slug,
          }}
          onClose={() => setSelectedSong(null)}
        />
      )}

      {/* Floating WhatsApp CTA */}
      <WhatsAppCTA />
      <Footer />
    </div>
  );
}
