"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import { customCreations, testimonials } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { Play, Music } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      <main
        className="flex flex-1 overflow-hidden flex-col lg:flex-row bg-secondary-cream"
        aria-label="Main content"
      >
        {/* Left Panel - Custom Creations */}
        <section
          id="creations"
          className="w-full lg:w-1/3 bg-gradient-to-b from-primary-yellow to-yellow-300 p-2 sm:p-3 md:p-4 overflow-y-auto flex flex-col order-2 lg:order-1 lg:rounded-2xl"
          aria-labelledby="creations-title"
        >
          <h2
            id="creations-title"
            className="text-xl sm:text-2xl md:text-3xl font-bold text-teal mb-3 sm:mb-4 md:mb-6 text-center font-heading"
          >
            Joyful Creations
          </h2>

          {/* Library CTA Button */}
          <div className="mb-4 sm:mb-6 text-center">
            <Link href="/library">
              <Button
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg border-2 border-yellow-400 hover:border-yellow-500"
                onClick={() => {
                  trackNavigationEvent.click(
                    "library_cta",
                    window.location.href,
                    "button"
                  );
                }}
              >
                <Music className="h-5 w-5 mr-2 text-teal" />
                Explore All Joyful Songs
              </Button>
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4 flex-1">
            {customCreations.map((song) => (
              <div
                key={song.id}
                className="flex items-center md:justify-between group hover:bg-yellow-200/50 p-2 sm:p-3 md:p-4 rounded transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      trackPlayerEvent.play(song.title, song.slug, false);
                      setSelectedSong(song);
                    }}
                    className="h-12 w-12 sm:h-14 sm:w-14 p-0 flex-shrink-0 bg-yellow-400 shadow-lg hover:bg-yellow-500 border-4 border-white transition-all duration-200 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                  >
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-gray-900" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <Link href={`/library/${song.slug}`}>
                      <span
                        className="text-xs sm:text-sm md:text-base font-medium text-gray-800 block cursor-pointer hover:underline hover:text-yellow-700 transition-colors min-h-0"
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            window.location.href = `/library/${song.slug}`;
                          }
                        }}
                      >
                        {song.title}
                      </span>
                    </Link>
                    <span className="text-xs sm:text-sm md:text-base italic text-gray-700 block md:inline">
                      {song.categories && song.categories.length > 0
                        ? song.categories.join(", ")
                        : song.music_style || "Custom Creation"}
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm md:text-base text-gray-600 flex-shrink-0 ml-2 sm:ml-3">
                  {formatDuration(song.duration)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Center Panel - Create Custom Song */}
        <section
          className="w-full lg:w-1/3 flex flex-col items-center pb-4 sm:pb-8 p-2 bg-secondary-cream order-1 lg:order-2 min-h-[50vh] sm:min-h-[60vh] lg:min-h-0"
          aria-labelledby="create-title"
        >
          <div className="flex flex-col items-center mb-6 sm:mb-6 md:mb-8 rounded-lg pt-0 p-2 bg-secondary-cream">
            <CenterLogo
              alt="Melodia"
              className="mx-auto mb-3 sm:mb-3 md:mb-4 transition-opacity duration-300"
            />
            <h1
              id="create-title"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-teal text-center px-2 font-heading"
            >
              Your Friendship&apos;s Greatest Hit
            </h1>
          </div>
          <div className="mx-auto mb-6 md:mb-8">
            <AnimatedImage
              src="/lovable-uploads/spinning-wheel-image.png"
              alt="Lullaby"
              className="mx-auto mb-6 md:mb-8 w-48 md:w-56 lg:w-auto max-w-full"
            />
          </div>
          <div className="text-center w-full max-w-md px-2 sm:px-4">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
              <div className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg text-center bg-primary-yellow text-teal border-2 border-primary-yellow px-2 sm:px-4 font-semibold flex items-center justify-center rounded-lg shadow-elegant">
                1. Who&apos;s your favorite person? 🎵
              </div>
              <div className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg text-center text-teal bg-secondary-cream border-2 border-accent-coral px-2 sm:px-4 font-semibold flex items-center justify-center rounded-lg shadow-elegant">
                2. What makes your bond special? ✨
              </div>
              <div className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg text-center text-teal bg-secondary-cream border-2 border-primary-yellow px-2 sm:px-4 font-semibold flex items-center justify-center rounded-lg shadow-elegant">
                3. Add your joyful memories! 🎉
              </div>
            </div>

            <ShareRequirementsCTA size="lg" />
          </div>
        </section>

        {/* Right Panel - Testimonials */}
        <section
          id="testimonials"
          className="w-full lg:w-1/3 bg-gradient-to-b from-primary-yellow to-yellow-300 p-2 sm:p-3 md:p-4 overflow-y-auto order-3 lg:order-3 md:rounded-2xl"
          aria-labelledby="testimonials-title"
        >
          <h2
            id="testimonials-title"
            className="mb-2 sm:mb-3 md:mb-4 text-teal font-bold text-base sm:text-lg md:text-xl text-center font-heading"
          >
            Spreading Joy, One Song at a Time! ✨
          </h2>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-yellow-100/70 p-3 sm:p-4 md:p-5 rounded-lg"
              >
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 underline">
                  {testimonial.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
                  {testimonial.content}
                </p>
                <p className="text-right text-xs sm:text-sm md:text-base text-gray-600 font-medium">
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
