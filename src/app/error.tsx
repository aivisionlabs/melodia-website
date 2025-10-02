"use client";

import { CenterLogo } from "@/components/OptimizedLogo";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-melodia-cream">
      <section
        className="text-center max-w-md mx-auto px-4"
        aria-labelledby="error-title"
      >
        <CenterLogo
          alt="Melodia"
          className="w-auto h-auto md:h-20 mx-auto mb-6"
        />

        {/* Joyful musical note with brand colors */}
        <div className="text-8xl mb-6 animate-bounce bg-gradient-to-br from-melodia-yellow to-melodia-coral bg-clip-text text-transparent">
          🎵
        </div>

        <h1
          id="error-title"
          className="text-5xl font-heading mb-4 text-melodia-coral"
        >
          500
        </h1>

        <h2 className="text-3xl font-heading mb-4 text-melodia-teal">
          Oops! Something went wrong
        </h2>

        <p className="text-lg font-body text-melodia-teal mb-8 leading-relaxed">
          We are sorry, but something unexpected happened. Our team has been
          notified and is working to fix this issue.
        </p>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-melodia-yellow hover:bg-gradient-to-r hover:from-melodia-yellow hover:to-melodia-coral text-melodia-teal font-heading font-semibold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-melodia-yellow focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-white hover:bg-melodia-teal-light text-melodia-teal hover:text-melodia-teal font-heading font-semibold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-melodia-coral focus:ring-opacity-30 border-2 border-melodia-coral hover:border-melodia-coral shadow-lg hover:shadow-xl"
          >
            Return to Home
          </Link>
        </div>

        <p className="text-sm font-body text-melodia-teal mt-8 opacity-70">
          Error ID: {error.digest || "Unknown"}
        </p>
      </section>
    </main>
  );
}
