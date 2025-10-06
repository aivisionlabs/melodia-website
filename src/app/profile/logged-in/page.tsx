"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function LoggedInProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setDateOfBirth(user.date_of_birth || "");
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.replace("/profile");
      }
    }
  }, [user, router, authLoading]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data?.success) setMessage("Saved");
      else setMessage(data?.error || "Failed");
    } catch {
      setMessage("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/profile");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-melodia-teal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="flex-1 px-6 py-8 mt-16">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* User Name */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text font-display">{name || "User"}</h1>
        </div>

        {/* View My Songs Button */}
        <div className="mb-8">
          <Button className="w-full h-14 bg-accent text-white font-display font-bold text-lg rounded-full shadow-md hover:bg-pink-600 transition-colors duration-300">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            View My Songs
          </Button>
        </div>

        {/* Personal Details */}
        <div className="space-y-4 mb-8">
          <div className="py-3 border-b border-gray-100">
            <span className="text-text/60 font-body block mb-1">Full Name</span>
            <span className="text-text font-bold font-body text-sm block">
              {name || "Not provided"}
            </span>
          </div>

          <div className="py-3 border-b border-gray-100">
            <span className="text-text/60 font-body block mb-1">Date of Birth</span>
            <span className="text-text font-bold font-body text-sm block">
              {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Not provided"}
            </span>
          </div>

          <div className="py-3 border-b border-gray-100">
            <span className="text-text/60 font-body block mb-1">Email Address</span>
            <span className="text-text font-bold font-body text-sm block">
              {email || "Not provided"}
            </span>
          </div>

          <div className="py-3 border-b border-gray-100">
            <span className="text-text/60 font-body block mb-1">Phone Number</span>
            <span className={`font-body text-sm block ${phoneNumber ? "text-text font-bold" : "text-text/60 italic"}`}>
              {phoneNumber || "Not provided"}
            </span>
          </div>
        </div>

        {/* Edit Details Button */}
        <div className="mb-8">
          <Link href="/profile/edit">
            <Button className="w-full h-14 bg-primary text-text font-display font-bold text-lg rounded-full shadow-md hover:bg-yellow-400 transition-colors duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Details
            </Button>
          </Link>
        </div>

        {/* Hidden form for editing (can be shown when Edit Details is clicked) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6 hidden">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-5 bg-white border border-text/20 rounded-lg placeholder-text/50 focus:ring-2 focus:ring-primary focus:border-transparent font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <Input
              value={email}
              disabled
              className="w-full h-14 px-5 bg-gray-50 border border-text/20 rounded-lg text-text/60 font-body"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={save}
              disabled={saving}
              className="flex-1 h-14 bg-primary text-text font-display font-bold text-lg rounded-full shadow-md hover:bg-yellow-400 transition-colors duration-300 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 h-14 border-2 border-accent text-accent hover:bg-accent hover:text-white font-display font-bold text-lg rounded-full transition-colors duration-300"
            >
              Logout
            </Button>
          </div>

          {message && (
            <div className={`text-sm text-center ${message === "Saved" ? "text-green-600" : "text-accent"}`}>
              {message}
            </div>
          )}
        </div>
      </main>

      {/* Floating Logout Button - Bottom Right */}
      <button
        onClick={logout}
        className="fixed bottom-24 right-4 w-12 h-12 bg-accent hover:bg-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 z-40"
        title="Logout"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center py-2">
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xs text-text font-body">Home</span>
          </Link>

          <Link href="/best-songs" className="flex flex-col items-center py-2">
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="text-xs text-text font-body">Best Songs</span>
          </Link>

          <Link href="/my-songs" className="flex flex-col items-center py-2">
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="text-xs text-text font-body">My Songs</span>
          </Link>

          <Link href="/profile/logged-in" className="flex flex-col items-center py-2">
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-xs text-accent font-body">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}
