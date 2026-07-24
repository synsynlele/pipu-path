"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import type { Database } from "./types";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = requireSupabasePublicEnvironment();
  return createBrowserClient<Database>(url, anonKey);
}
