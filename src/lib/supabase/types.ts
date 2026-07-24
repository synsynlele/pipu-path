export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      identity_audit_events: {
        Row: {
          duration_ms: number | null;
          error_code: string | null;
          id: number;
          metadata: Json;
          occurred_at: string;
          operation: string;
          request_id: string | null;
          result: string;
          user_id: string | null;
        };
        Insert: {
          duration_ms?: number | null;
          error_code?: string | null;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          operation: string;
          request_id?: string | null;
          result: string;
          user_id?: string | null;
        };
        Update: {
          duration_ms?: number | null;
          error_code?: string | null;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          operation?: string;
          request_id?: string | null;
          result?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      onboarding_checkpoints: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_stage: string;
          current_step: string;
          resume_path: string;
          status: Database["public"]["Enums"]["identity_checkpoint_status"];
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_stage?: string;
          current_step?: string;
          resume_path?: string;
          status?: Database["public"]["Enums"]["identity_checkpoint_status"];
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_stage?: string;
          current_step?: string;
          resume_path?: string;
          status?: Database["public"]["Enums"]["identity_checkpoint_status"];
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_checkpoints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"];
          age_band: Database["public"]["Enums"]["age_band"];
          avatar_path: string | null;
          country_code: string | null;
          created_at: string;
          deleted_at: string | null;
          display_name: string | null;
          education_level: string | null;
          general_location: string | null;
          id: string;
          is_minor: boolean | null;
          last_active_at: string | null;
          life_stage: string | null;
          onboarding_status: Database["public"]["Enums"]["onboarding_status"];
          preferred_name: string | null;
          primary_language: string | null;
          profile_visibility: Database["public"]["Enums"]["profile_visibility"];
          safeguarding_review_required: boolean;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"];
          age_band?: Database["public"]["Enums"]["age_band"];
          avatar_path?: string | null;
          country_code?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          education_level?: string | null;
          general_location?: string | null;
          id: string;
          is_minor?: boolean | null;
          last_active_at?: string | null;
          life_stage?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          preferred_name?: string | null;
          primary_language?: string | null;
          profile_visibility?: Database["public"]["Enums"]["profile_visibility"];
          safeguarding_review_required?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"];
          age_band?: Database["public"]["Enums"]["age_band"];
          avatar_path?: string | null;
          country_code?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          display_name?: string | null;
          education_level?: string | null;
          general_location?: string | null;
          id?: string;
          is_minor?: boolean | null;
          last_active_at?: string | null;
          life_stage?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          preferred_name?: string | null;
          primary_language?: string | null;
          profile_visibility?: Database["public"]["Enums"]["profile_visibility"];
          safeguarding_review_required?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      user_consents: {
        Row: {
          consent_type: string;
          created_at: string;
          id: string;
          metadata: Json;
          occurred_at: string;
          policy_version: string;
          source: Database["public"]["Enums"]["consent_source"];
          status: Database["public"]["Enums"]["consent_status"];
          user_id: string;
          withdrawn_at: string | null;
        };
        Insert: {
          consent_type: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          occurred_at?: string;
          policy_version: string;
          source: Database["public"]["Enums"]["consent_source"];
          status: Database["public"]["Enums"]["consent_status"];
          user_id: string;
          withdrawn_at?: string | null;
        };
        Update: {
          consent_type?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          occurred_at?: string;
          policy_version?: string;
          source?: Database["public"]["Enums"]["consent_source"];
          status?: Database["public"]["Enums"]["consent_status"];
          user_id?: string;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_consents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          accessibility: Json;
          communication: Json;
          created_at: string;
          interface: Json;
          magicpen: Json;
          notifications: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accessibility?: Json;
          communication?: Json;
          created_at?: string;
          interface?: Json;
          magicpen?: Json;
          notifications?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accessibility?: Json;
          communication?: Json;
          created_at?: string;
          interface?: Json;
          magicpen?: Json;
          notifications?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      complete_identity_checkpoint: {
        Args: {
          accept_ai: boolean;
          accept_privacy: boolean;
          accept_terms: boolean;
          age_band_input: Database["public"]["Enums"]["age_band"];
          policy_version_input: string;
          preferred_name_input: string;
          username_input: string;
        };
        Returns: undefined;
      };
      provision_identity: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      withdraw_consent: {
        Args: { consent_type_input: string; policy_version_input: string };
        Returns: undefined;
      };
    };
    Enums: {
      account_status: "active" | "restricted" | "suspended" | "deleted";
      age_band:
        "under_13" | "13_15" | "16_17" | "18_24" | "25_plus" | "unknown";
      consent_source:
        | "identity_checkpoint"
        | "settings"
        | "guardian"
        | "institution"
        | "admin";
      consent_status: "granted" | "withdrawn" | "declined";
      identity_checkpoint_status: "not_started" | "in_progress" | "completed";
      onboarding_status: "identity_required" | "stage_3_ready";
      profile_visibility: "private";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "restricted", "suspended", "deleted"],
      age_band: ["under_13", "13_15", "16_17", "18_24", "25_plus", "unknown"],
      consent_source: [
        "identity_checkpoint",
        "settings",
        "guardian",
        "institution",
        "admin",
      ],
      consent_status: ["granted", "withdrawn", "declined"],
      identity_checkpoint_status: ["not_started", "in_progress", "completed"],
      onboarding_status: ["identity_required", "stage_3_ready"],
      profile_visibility: ["private"],
    },
  },
} as const;
