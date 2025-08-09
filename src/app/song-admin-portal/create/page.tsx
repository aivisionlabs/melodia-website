"use client";

import { createSongAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CreateSongPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createSongAction(formData);

      if (result?.success && result.redirect) {
        toast({
          title: "Song created successfully!",
          description: "Redirecting to generation progress...",
          duration: 3000,
        });
        router.push(result.redirect);
      } else if (result?.error) {
        setError(result.error);
        toast({
          title: "Error creating song",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      const errorMessage = `An unexpected error occurred: ${err}`;
      setError(errorMessage);
      toast({
        title: "Unexpected error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Song</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new song to the Melodia library
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Song Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label
                htmlFor="music_style"
                className="block text-sm font-medium text-gray-700"
              >
                Music Style *
              </label>
              <textarea
                name="music_style"
                id="music_style"
                rows={3}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter the music style"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the music style for the song generation
              </p>
            </div>

            <div>
              <label
                htmlFor="lyrics"
                className="block text-sm font-medium text-gray-700"
              >
                Lyrics *
              </label>
              <textarea
                name="lyrics"
                id="lyrics"
                rows={8}
                required
                onKeyDown={handleKeyDown}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter the lyrics for the song..."
              />
              <p className="mt-1 text-sm text-gray-500">
                These lyrics will be used as the prompt for song generation.
                Press Enter to submit, Shift+Enter for new line.
              </p>
            </div>

            <div>
              <label
                htmlFor="categories"
                className="block text-sm font-medium text-gray-700"
              >
                Categories
              </label>
              <input
                type="text"
                name="categories"
                id="categories"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter categories separated by commas (e.g., Birthday, Party, Kids)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Add categories to help organize songs
              </p>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter tags separated by commas (e.g., happy, energetic, fun)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Add tags for better search and organization
              </p>
            </div>

            <div>
              <label
                htmlFor="negativeTags"
                className="block text-sm font-medium text-gray-700"
              >
                Negative Tags
              </label>
              <input
                type="text"
                name="negativeTags"
                id="negativeTags"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900 px-3 py-2"
                placeholder="Enter negative tags separated by commas (e.g., Heavy Metal, Upbeat Drums)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Specify what to avoid in the song generation
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <a
                href="/song-admin-portal"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={isLoading}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                  isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {isLoading ? "Creating Song..." : "Create Song"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
