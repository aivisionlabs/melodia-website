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
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <section
        className="text-center max-w-md mx-auto px-4"
        aria-labelledby="error-title"
      >
        <CenterLogo
          alt="Melodia"
          className="w-auto h-auto md:h-20 mx-auto mb-6"
        />

        {/* Cute apologetic face */}
        <div className="text-8xl mb-6 animate-bounce">😔</div>

        <h1 id="error-title" className="text-4xl font-bold mb-4 text-red-600">
          500
        </h1>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Oops! Something went wrong
        </h2>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          We're sorry, but something unexpected happened. Our team has been
          notified and is working to fix this issue.
        </p>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Return to Home
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Error ID: {error.digest || "Unknown"}
        </p>
      </section>
    </main>
  );
}
