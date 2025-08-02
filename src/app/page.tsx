"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShareRequirementsCTA from "@/components/ShareRequirementsCTA";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import { customCreations, testimonials } from "@/lib/constants";
import { Play } from "lucide-react";
import { useState } from "react";
import LazyImage from "@/components/LazyImage";
import { CenterLogo } from "@/components/OptimizedLogo";
import { track } from "@vercel/analytics";

export default function HomePage() {
  const [selectedSong, setSelectedSong] = useState<
    (typeof customCreations)[0] | null
  >(null);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      <main
        className="flex flex-1 overflow-hidden flex-col lg:flex-row bg-slate-50"
        aria-label="Main content"
      >
        {/* Left Panel - Custom Creations */}
        <section
          id="creations"
          className="w-full lg:w-1/3 bg-gradient-to-b from-yellow-200 to-yellow-300 p-3 md:p-4 overflow-y-auto flex flex-col order-2 lg:order-1 lg:rounded-2xl"
          aria-labelledby="creations-title"
        >
          <h2
            id="creations-title"
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center"
          >
            Our Creations
          </h2>
          <div className="space-y-3 md:space-y-4 flex-1">
            {customCreations.map((song) => (
              <div
                key={song.id}
                className="flex items-center md:justify-between group hover:bg-yellow-200/50 p-3 md:p-4 rounded transition-colors"
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      track("song_play", {
                        songId: song.id,
                        songTitle: song.title,
                      });
                      setSelectedSong(song);
                    }}
                    className="h-14 w-14 p-0 flex-shrink-0 bg-yellow-400 shadow-lg hover:bg-yellow-500 border-4 border-white transition-all duration-200 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                  >
                    <Play className="h-6 w-6 md:h-8 md:w-8 text-gray-900" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <span
                      className="text-sm md:text-base font-medium text-gray-800 block cursor-pointer hover:underline hover:text-yellow-700 transition-colors min-h-0"
                      onClick={() => setSelectedSong(song)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedSong(song);
                      }}
                    >
                      {song.title}
                    </span>
                    <span className="text-sm md:text-base italic text-gray-700 block md:inline">
                      {song.music_style}
                    </span>
                  </div>
                </div>
                <span className="text-sm md:text-base text-gray-600 flex-shrink-0 ml-3">
                  {song.duration}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Center Panel - Create Custom Song */}
        <section
          className="w-full lg:w-1/3 flex flex-col items-center pb-8 p-2 bg-slate-50 order-1 lg:order-2 min-h-[60vh] lg:min-h-0"
          aria-labelledby="create-title"
        >
          <div className="flex flex-col items-center mb-8 md:mb-10 rounded-lg pt-0 p-2 bg-slate-50">
            <CenterLogo
              alt="Melodia"
              className="lg:h-80 mx-auto mb-2 md:mb-10 transition-opacity duration-300"
            />
            <h1
              id="create-title"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center"
            >
              Create Personalized
            </h1>
          </div>
          <div className="mx-auto mb-6 md:mb-8">
            <LazyImage
              src="/lovable-uploads/spinning-wheel-image.png"
              alt="Lullaby"
              className="mx-auto mb-6 md:mb-8 w-48 md:w-56 lg:w-auto max-w-full"
            />
          </div>
          <div className="text-center w-full max-w-md px-4">
            <div className="space-y-4 md:space-y-5 mb-8 md:mb-10">
              <div className="w-full h-14 md:h-16 text-base md:text-lg text-center bg-gray-100 text-gray-700 border border-gray-200 px-4 font-medium flex items-center justify-center rounded-lg">
                1. Tell us, Whom to dedicate this song to?
              </div>
              <div className="w-full h-14 md:h-16 text-base md:text-lg text-center text-gray-700 bg-gray-100 border border-gray-200 px-4 font-medium flex items-center justify-center rounded-lg">
                2. Tell us, What is the song about?
              </div>
              <div className="w-full h-14 md:h-16 text-base md:text-lg text-center text-gray-700 bg-gray-100 border border-gray-200 px-4 font-medium flex items-center justify-center rounded-lg">
                3. Add personal touch
              </div>
            </div>

            <ShareRequirementsCTA size="lg" />
          </div>
        </section>

        {/* Right Panel - Testimonials */}
        <section
          id="testimonials"
          className="w-full lg:w-1/3 bg-gradient-to-b from-yellow-200 to-yellow-300 p-3 md:p-4 overflow-y-auto order-3 lg:order-3 md:rounded-2xl"
          aria-labelledby="testimonials-title"
        >
          <h2
            id="testimonials-title"
            className="mb-3 md:mb-4 text-gray-800 font-bold text-lg md:text-xl text-center"
          >
            We love Impressing people...
          </h2>
          <div className="space-y-3 md:space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-yellow-100/70 p-4 md:p-5 rounded-lg"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 underline">
                  {testimonial.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 leading-relaxed">
                  {testimonial.content}
                </p>
                <p className="text-right text-sm md:text-base text-gray-600 font-medium">
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
            audioUrl: selectedSong.song_url ?? undefined,
            lyrics: selectedSong.timestamp_lyrics ?? undefined,
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
