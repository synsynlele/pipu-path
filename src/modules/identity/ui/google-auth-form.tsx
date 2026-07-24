"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function GoogleAuthForm({ next = "/app" }: { next?: string }) {
  const [error, setError] = useState("");
  async function continueWithGoogle() {
    setError("");
    const client = createBrowserSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (authError) setError("Google sign-in could not be started.");
  }
  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={continueWithGoogle}
      >
        Continue with Google
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
