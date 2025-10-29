/**
 * Logged In Profile Page
 * User dashboard showing profile info and songs
 */

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, User, Music, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoggedInProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [userSongs, setUserSongs] = useState<any[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/profile/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchUserSongs();
    }
  }, [user]);

  const fetchUserSongs = async () => {
    try {
      setIsLoadingSongs(true);
      // TODO: Implement user songs API
      // const response = await fetch('/api/user/songs');
      // const data = await response.json();
      // setUserSongs(data.songs || []);
      setUserSongs([]);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-cream">
        <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-text-teal hover:text-accent-coral transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-elegant p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-yellow to-accent-coral flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-text-teal font-heading">
                  {user.name}
                </h1>
                <p className="text-text-teal/70">{user.email}</p>
                {user.emailVerified && (
                  <p className="text-sm text-success mt-1">✓ Email Verified</p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-2 border-gray-300 hover:border-error hover:text-error"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Songs */}
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-teal font-heading flex items-center">
              <Music className="w-6 h-6 mr-2 text-accent-coral" />
              My Songs
            </h2>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-yellow text-text-teal hover:bg-primary-yellow/90"
            >
              Create New Song
            </Button>
          </div>

          {isLoadingSongs ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent-coral" />
              <p className="mt-4 text-text-teal/70">Loading your songs...</p>
            </div>
          ) : userSongs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-text-teal mb-2">
                No songs yet
              </h3>
              <p className="text-text-teal/70 mb-6">
                Create your first personalized song to get started
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-primary-yellow text-text-teal hover:bg-primary-yellow/90"
              >
                Create Your First Song
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userSongs.map((song) => (
                <div
                  key={song.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-yellow transition-colors"
                >
                  <h3 className="font-semibold text-text-teal">{song.title}</h3>
                  <p className="text-sm text-text-teal/70 mt-1">
                    {song.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

