import Header from "@/components/Header";
import { SongList } from "@/components/SongList";
import { SearchBar } from "@/components/search-bar";

export default function SongsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Song Library
          </h1>
          <p className="text-gray-600">
            Discover our collection of AI-generated songs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar initialQuery={searchParams.search} />
        </div>

        {/* Songs List */}
        <SongList />
      </div>
    </div>
  );
}
