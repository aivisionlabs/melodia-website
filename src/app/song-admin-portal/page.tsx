import { getAllSongs } from "@/lib/db/services";
import Link from "next/link";
import ClearMockDataButton from "@/components/ClearMockDataButton";
import SongList from "@/components/SongList";

export default async function AdminDashboardPage() {
  const songs = await getAllSongs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Song Management</h1>
        <div className="flex space-x-4">
          <ClearMockDataButton />
          <Link
            href="/song-admin-portal/create"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Song
          </Link>
        </div>
      </div>

      <SongList songs={songs} />
    </div>
  );
}
