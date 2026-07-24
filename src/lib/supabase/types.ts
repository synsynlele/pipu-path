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
      discovery_audit_events: {
        Row: {
          error_code: string | null;
          id: number;
          metadata: Json;
          occurred_at: string;
          operation: string;
          result: string;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          error_code?: string | null;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          operation: string;
          result?: string;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          error_code?: string | null;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          operation?: string;
          result?: string;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_audit_events_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "discovery_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_question_sets: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          intended_age_bands: Database["public"]["Enums"]["age_band"][];
          intended_life_stages: string[];
          published_at: string | null;
          retired_at: string | null;
          stable_key: string;
          status: Database["public"]["Enums"]["discovery_question_set_status"];
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          intended_age_bands: Database["public"]["Enums"]["age_band"][];
          intended_life_stages?: string[];
          published_at?: string | null;
          retired_at?: string | null;
          stable_key: string;
          status?: Database["public"]["Enums"]["discovery_question_set_status"];
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          intended_age_bands?: Database["public"]["Enums"]["age_band"][];
          intended_life_stages?: string[];
          published_at?: string | null;
          retired_at?: string | null;
          stable_key?: string;
          status?: Database["public"]["Enums"]["discovery_question_set_status"];
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      discovery_questions: {
        Row: {
          conditional_rule: Json | null;
          created_at: string;
          display_order: number;
          eligible_age_bands: Database["public"]["Enums"]["age_band"][];
          id: string;
          is_active: boolean;
          is_required: boolean;
          max_scale: number | null;
          max_selections: number | null;
          max_text_length: number | null;
          min_scale: number | null;
          min_selections: number | null;
          option_definitions: Json;
          prompt: string;
          question_set_id: string;
          response_type: Database["public"]["Enums"]["discovery_response_type"];
          section_key: string;
          section_title: string;
          sensitivity: Database["public"]["Enums"]["discovery_sensitivity"];
          stable_key: string;
          supporting_text: string | null;
          updated_at: string;
        };
        Insert: {
          conditional_rule?: Json | null;
          created_at?: string;
          display_order: number;
          eligible_age_bands: Database["public"]["Enums"]["age_band"][];
          id?: string;
          is_active?: boolean;
          is_required?: boolean;
          max_scale?: number | null;
          max_selections?: number | null;
          max_text_length?: number | null;
          min_scale?: number | null;
          min_selections?: number | null;
          option_definitions?: Json;
          prompt: string;
          question_set_id: string;
          response_type: Database["public"]["Enums"]["discovery_response_type"];
          section_key: string;
          section_title: string;
          sensitivity?: Database["public"]["Enums"]["discovery_sensitivity"];
          stable_key: string;
          supporting_text?: string | null;
          updated_at?: string;
        };
        Update: {
          conditional_rule?: Json | null;
          created_at?: string;
          display_order?: number;
          eligible_age_bands?: Database["public"]["Enums"]["age_band"][];
          id?: string;
          is_active?: boolean;
          is_required?: boolean;
          max_scale?: number | null;
          max_selections?: number | null;
          max_text_length?: number | null;
          min_scale?: number | null;
          min_selections?: number | null;
          option_definitions?: Json;
          prompt?: string;
          question_set_id?: string;
          response_type?: Database["public"]["Enums"]["discovery_response_type"];
          section_key?: string;
          section_title?: string;
          sensitivity?: Database["public"]["Enums"]["discovery_sensitivity"];
          stable_key?: string;
          supporting_text?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_questions_question_set_id_fkey";
            columns: ["question_set_id"];
            isOneToOne: false;
            referencedRelation: "discovery_question_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_responses: {
        Row: {
          created_at: string;
          id: string;
          numeric_response: number | null;
          question_id: string;
          question_key: string;
          response_type: Database["public"]["Enums"]["discovery_response_type"];
          selected_options: string[] | null;
          sensitivity: Database["public"]["Enums"]["discovery_sensitivity"];
          session_id: string;
          skipped: boolean;
          text_response: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          numeric_response?: number | null;
          question_id: string;
          question_key: string;
          response_type: Database["public"]["Enums"]["discovery_response_type"];
          selected_options?: string[] | null;
          sensitivity: Database["public"]["Enums"]["discovery_sensitivity"];
          session_id: string;
          skipped?: boolean;
          text_response?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          numeric_response?: number | null;
          question_id?: string;
          question_key?: string;
          response_type?: Database["public"]["Enums"]["discovery_response_type"];
          selected_options?: string[] | null;
          sensitivity?: Database["public"]["Enums"]["discovery_sensitivity"];
          session_id?: string;
          skipped?: boolean;
          text_response?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_responses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "discovery_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discovery_responses_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "discovery_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discovery_responses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_question_key: string | null;
          current_section_key: string | null;
          id: string;
          last_resumed_at: string;
          progress_percent: number;
          question_set_id: string;
          question_set_version: number;
          stage_4_processing_status: Database["public"]["Enums"]["discovery_processing_status"];
          started_at: string;
          status: Database["public"]["Enums"]["discovery_session_status"];
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_question_key?: string | null;
          current_section_key?: string | null;
          id?: string;
          last_resumed_at?: string;
          progress_percent?: number;
          question_set_id: string;
          question_set_version: number;
          stage_4_processing_status?: Database["public"]["Enums"]["discovery_processing_status"];
          started_at?: string;
          status?: Database["public"]["Enums"]["discovery_session_status"];
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_question_key?: string | null;
          current_section_key?: string | null;
          id?: string;
          last_resumed_at?: string;
          progress_percent?: number;
          question_set_id?: string;
          question_set_version?: number;
          stage_4_processing_status?: Database["public"]["Enums"]["discovery_processing_status"];
          started_at?: string;
          status?: Database["public"]["Enums"]["discovery_session_status"];
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_sessions_question_set_id_fkey";
            columns: ["question_set_id"];
            isOneToOne: false;
            referencedRelation: "discovery_question_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "discovery_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
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
          discovery_resume_path: string;
          discovery_status: Database["public"]["Enums"]["discovery_checkpoint_status"];
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
          discovery_resume_path?: string;
          discovery_status?: Database["public"]["Enums"]["discovery_checkpoint_status"];
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
          discovery_resume_path?: string;
          discovery_status?: Database["public"]["Enums"]["discovery_checkpoint_status"];
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
      complete_discovery: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: undefined;
      };
      complete_discovery_v1_internal: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: undefined;
      };
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
      discovery_progress: {
        Args: { session_id_input: string };
        Returns: number;
      };
      open_discovery_review: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: number;
      };
      open_discovery_review_v1_internal: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: number;
      };
      provision_identity: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      save_discovery_response: {
        Args: {
          expected_version_input: number;
          numeric_response_input: number;
          question_key_input: string;
          selected_options_input: string[];
          session_id_input: string;
          skip_input: boolean;
          text_response_input: string;
        };
        Returns: number;
      };
      save_discovery_response_v1_internal: {
        Args: {
          expected_version_input: number;
          numeric_response_input: number;
          question_key_input: string;
          selected_options_input: string[];
          session_id_input: string;
          skip_input: boolean;
          text_response_input: string;
        };
        Returns: number;
      };
      start_or_resume_discovery: { Args: never; Returns: string };
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
      discovery_checkpoint_status: "not_started" | "in_progress" | "completed";
      discovery_processing_status: "not_ready" | "ready_for_stage_4";
      discovery_question_set_status: "draft" | "published" | "retired";
      discovery_response_type:
        "reflection" | "single_select" | "multi_select" | "scale";
      discovery_sensitivity: "standard" | "sensitive";
      discovery_session_status: "in_progress" | "review" | "completed";
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
      discovery_checkpoint_status: ["not_started", "in_progress", "completed"],
      discovery_processing_status: ["not_ready", "ready_for_stage_4"],
      discovery_question_set_status: ["draft", "published", "retired"],
      discovery_response_type: [
        "reflection",
        "single_select",
        "multi_select",
        "scale",
      ],
      discovery_sensitivity: ["standard", "sensitive"],
      discovery_session_status: ["in_progress", "review", "completed"],
      identity_checkpoint_status: ["not_started", "in_progress", "completed"],
      onboarding_status: ["identity_required", "stage_3_ready"],
      profile_visibility: ["private"],
    },
  },
} as const;
