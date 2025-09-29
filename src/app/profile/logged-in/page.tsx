"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function LoggedInProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-melodia-teal mb-2">
            Profile
          </h1>
          <p className="text-melodia-teal/60 font-body">Manage your account</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card space-y-6">
          <div>
            <label className="block text-sm font-medium text-melodia-teal mb-2">
              Name
            </label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-melodia-teal/20 text-melodia-teal rounded-xl p-3 focus:ring-2 focus:ring-melodia-yellow focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-melodia-teal mb-2">
              Email
            </label>
            <Input 
              value={email} 
              disabled 
              className="w-full bg-gray-50 border border-melodia-teal/20 text-melodia-teal/60 rounded-xl p-3"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={save}
              disabled={saving}
              className="flex-1 bg-melodia-yellow text-melodia-teal font-bold py-3 px-4 rounded-xl hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-melodia-coral text-melodia-coral hover:bg-melodia-coral hover:text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Logout
            </Button>
          </div>

          {message && (
            <div className={`text-sm text-center ${message === "Saved" ? "text-green-600" : "text-melodia-coral"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
