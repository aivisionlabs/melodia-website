import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSong } from "@/lib/actions";
import { SongDetails } from "@/components/song-details";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Server Component for song data loading
async function SongPageContent({ id }: { id: string }) {
  const result = await getSong(id);

  if (result.error || !result.song) {
    notFound();
  }

  return <SongDetails song={result.song} />;
}

// Loading component
function SongLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2">Loading song...</span>
    </div>
  );
}

// Main page component
export default function SongPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/songs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Songs
          </Button>
        </Link>
      </div>

      {/* Song Content */}
      <Suspense fallback={<SongLoading />}>
        <SongPageContent id={params.id} />
      </Suspense>
    </div>
  );
}
