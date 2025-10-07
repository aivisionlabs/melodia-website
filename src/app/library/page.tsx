"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SongLibraryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the my-songs page using Next.js router
    router.replace("/my-songs");
  }, [router]);

  return null;
}
