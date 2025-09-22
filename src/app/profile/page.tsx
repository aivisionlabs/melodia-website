"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data?.success) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <Input value={email} disabled />
            </div>
            <div className="flex justify-end">
              <Button
                className="bg-melodia-yellow text-melodia-teal"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
            {message && <div className="text-sm opacity-80">{message}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





