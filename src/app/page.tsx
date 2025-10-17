"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import { customCreations, testimonials } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { Play, Music, Star, Heart, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { CenterLogo } from "@/components/OptimizedLogo";
import { trackNavigationEvent, trackPlayerEvent } from "@/lib/analytics";
import LyricalWavesBackground from "@/components/LyricalWavesBackground";
import BulkOrderCTA from "@/components/BulkOrderCTA";

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
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col overflow-x-hidden relative">
      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary-yellow/20 via-transparent to-accent-coral/10 text-center pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-32 px-4 relative overflow-hidden">
          <CenterLogo
            alt="Melodia"
            className="mx-auto sm:mb-6 lg:mb-8 w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg animate-fade-in"
          />
          <h1 className="text-3xl mt-4 sm:text-4xl md:text-5xl font-bold text-text-teal font-heading max-w-2xl mx-auto leading-tight">
            <span className="bg-gradient-to-r from-text-teal via-accent-coral to-text-teal bg-clip-text text-transparent animate-fade-in">
              Gift a Personalized Song,
            </span>
            <br />
            <span
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Create a Timeless Memory
            </span>
          </h1>
          <p
            className="text-text-teal/80 mt-3 sm:mt-4 text-base sm:text-lg max-w-xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Turn your favorite stories and memories into a unique, heartfelt
            song for your loved ones. The most personal gift imaginable.
          </p>
          <div
            className="mt-6 sm:mt-8 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <ShareRequirementsCTA size="lg" />
          </div>
          <LyricalWavesBackground />
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-yellow/5 via-transparent to-accent-coral/5"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-teal text-center font-heading mb-8 sm:mb-12">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-yellow" />
                Create the Perfect Musical Gift in 3 Steps
                <Sparkles className="w-6 h-6 text-primary-yellow" />
              </span>
            </h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-accent-coral to-accent-coral/80 text-white rounded-full p-4 mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
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
              <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-primary-yellow to-primary-yellow/80 text-text-teal rounded-full p-4 mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
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
              <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-text-teal to-text-teal/80 text-white rounded-full p-4 mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-text-teal font-heading">
                  3. Gift Your Song
                </h3>
                <p className="text-text-teal/80 mt-2 text-sm sm:text-base">
                  Receive a beautiful, studio-quality song ready to be shared
                  and cherished.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Separator */}
        <div className="py-8 sm:py-12 flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-yellow/10 to-transparent"></div>
          <AnimatedImage
            src="/lovable-uploads/spinning-wheel-image.png"
            alt="Lullaby"
            className="mx-auto w-48 md:w-56 lg:w-auto max-w-full drop-shadow-lg relative z-10"
          />
        </div>

        {/* Joyful Creations Section */}
        <section
          id="creations"
          className="bg-gradient-to-br from-primary-yellow/20 via-primary-yellow/10 to-accent-coral/10 py-12 sm:py-16 md:py-20 px-4 relative"
          aria-labelledby="creations-title"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="text-center">
              <h2
                id="creations-title"
                className="text-2xl sm:text-3xl font-bold text-text-teal mb-4 font-heading"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent-coral" />
                  Joyful Creations
                  <Sparkles className="w-6 h-6 text-accent-coral" />
                </span>
              </h2>
              <p className="text-text-teal/80 max-w-2xl mx-auto mb-8">
                Listen to some of the heartfelt songs we&apos;ve helped create.
              </p>
              <Link href="/library">
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-white to-primary-yellow/10 hover:from-primary-yellow/20 hover:to-white text-text-teal font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-primary-yellow hover:border-accent-coral hover:scale-105"
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
          </div>

          <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            {customCreations.slice(0, 6).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center bg-gradient-to-r from-white to-white/95 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary-yellow/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    trackPlayerEvent.play(song.title, song.slug, false);
                    setSelectedSong(song);
                  }}
                  className="h-14 w-14 p-0 flex-shrink-0 bg-gradient-to-br from-primary-yellow to-primary-yellow/80 shadow-lg hover:shadow-xl border-2 border-white transition-all duration-300 focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 rounded-full hover:scale-110"
                >
                  <Play className="h-6 w-6 text-text-teal" />
                </Button>
                <div className="ml-4 min-w-0 flex-1">
                  <Link href={`/library/${song.slug}`}>
                    <span className="text-sm sm:text-base font-semibold text-text-teal block cursor-pointer hover:underline truncate transition-colors duration-200">
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

        {/* Bulk Order CTA Section */}
        <BulkOrderCTA />

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-12 sm:py-16 md:py-20 px-4 relative"
          aria-labelledby="testimonials-title"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-coral/5 via-transparent to-primary-yellow/5"></div>
          <div className="relative z-10">
            <div className="text-center">
              <h2
                id="testimonials-title"
                className="text-2xl sm:text-3xl font-bold text-text-teal mb-4 font-heading"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary-yellow" />
                  Spreading Joy, One Song at a Time!
                  <Sparkles className="w-6 h-6 text-primary-yellow" />
                </span>
              </h2>
              <p className="text-text-teal/80 max-w-2xl mx-auto mb-8 sm:mb-12">
                Here&apos;s what our happy customers have to say.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-gradient-to-br from-white to-white/95 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-accent-coral/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
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
                  <blockquote className="text-sm sm:text-base text-gray-700 italic border-l-4 border-gradient-to-b from-primary-yellow to-accent-coral pl-4">
                    {testimonial.content}
                  </blockquote>
                  <p className="text-right text-sm text-gray-600 font-medium mt-4">
                    - {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
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
