import { getAllSongs, getAllSongRequests } from "@/lib/db/services";
import Link from "next/link";
import SongList from "@/components/SongList";
import SongRequestList from "@/components/SongRequestList";

export default async function AdminDashboardPage() {
  const [songs, requests] = await Promise.all([
    getAllSongs(),
    getAllSongRequests(),
  ]);

  return (
    <div className="space-y-8">
      {/* Song Requests Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Song Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage incoming song requests and track their progress
            </p>
          </div>
        </div>
        <SongRequestList requests={requests} />
      </div>

      {/* Songs Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Song Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all generated songs in the system
            </p>
          </div>
          <div className="w-full sm:w-auto flex gap-3">
            <Link
              href="/song-admin-portal/create"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto text-center"
            >
              Create New Song
            </Link>
          </div>
        </div>
        <SongList songs={songs} />
      </div>
    </div>
  );
}
