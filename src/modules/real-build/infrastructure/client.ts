import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { BuildChallenge, BuildDraft } from "../domain/build";
type Row = {
  id: string;
  user_id: string;
  template_id: string;
  previous_attempt_id: string | null;
  topic: string;
  minutes: number;
  challenge: BuildChallenge;
  source: "openai";
  status: "active" | "recorded" | "archived";
  draft: BuildDraft;
  image_path: string | null;
  version: number;
  created_at: string;
  recorded_at: string | null;
};
type Template = {
  id: string;
  topic: string;
  minutes: number;
  challenge: BuildChallenge;
  source: "openai";
  created_at: string;
};
type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};
type BuildDatabase = {
  public: {
    Tables: {
      real_build_attempts: Table<Row>;
      real_build_templates: Table<Template>;
      real_build_generation_leases: Table<{
        cache_key: string;
        token: string;
        expires_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      find_unseen_real_build_template: {
        Args: {
          user_input: string;
          topic_input: string;
          minutes_input: number;
        };
        Returns: Template[];
      };
      begin_real_build_request: {
        Args: { user_input: string };
        Returns: string | null;
      };
      claim_real_build_generation: {
        Args: { key_input: string; token_input: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
// Existing clients retain auth/cookie setup; the additive module has an explicit migration contract.
type TypedClient =
  import("@supabase/supabase-js").SupabaseClient<BuildDatabase>;
export const buildServerClient = async () =>
  (await createServerSupabaseClient()) as unknown as TypedClient;
export const buildServiceClient = () =>
  createServiceRoleSupabaseClient() as unknown as TypedClient;
