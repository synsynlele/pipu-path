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
      evidence_records: {
        Row: {
          age_restriction: Database["public"]["Enums"]["age_band"] | null;
          captured_at: string;
          category: Database["public"]["Enums"]["hpi_evidence_category"];
          content_hash: string;
          content_summary: string | null;
          created_at: string;
          evidence_status: Database["public"]["Enums"]["hpi_evidence_status"];
          id: string;
          metadata: Json;
          occurred_at: string | null;
          sensitivity_level: Database["public"]["Enums"]["hpi_sensitivity_level"];
          source_id: string;
          source_key: string;
          source_type: Database["public"]["Enums"]["hpi_evidence_source_type"];
          source_version: number;
          structured_value: Json;
          subcategory: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_restriction?: Database["public"]["Enums"]["age_band"] | null;
          captured_at?: string;
          category: Database["public"]["Enums"]["hpi_evidence_category"];
          content_hash: string;
          content_summary?: string | null;
          created_at?: string;
          evidence_status?: Database["public"]["Enums"]["hpi_evidence_status"];
          id?: string;
          metadata?: Json;
          occurred_at?: string | null;
          sensitivity_level: Database["public"]["Enums"]["hpi_sensitivity_level"];
          source_id: string;
          source_key: string;
          source_type: Database["public"]["Enums"]["hpi_evidence_source_type"];
          source_version: number;
          structured_value: Json;
          subcategory?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_restriction?: Database["public"]["Enums"]["age_band"] | null;
          captured_at?: string;
          category?: Database["public"]["Enums"]["hpi_evidence_category"];
          content_hash?: string;
          content_summary?: string | null;
          created_at?: string;
          evidence_status?: Database["public"]["Enums"]["hpi_evidence_status"];
          id?: string;
          metadata?: Json;
          occurred_at?: string | null;
          sensitivity_level?: Database["public"]["Enums"]["hpi_sensitivity_level"];
          source_id?: string;
          source_key?: string;
          source_type?: Database["public"]["Enums"]["hpi_evidence_source_type"];
          source_version?: number;
          structured_value?: Json;
          subcategory?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      human_potential_profile_items: {
        Row: {
          created_at: string;
          display_order: number;
          insight_id: string;
          profile_version_id: string;
          visibility: Database["public"]["Enums"]["hpi_profile_item_visibility"];
        };
        Insert: {
          created_at?: string;
          display_order: number;
          insight_id: string;
          profile_version_id: string;
          visibility?: Database["public"]["Enums"]["hpi_profile_item_visibility"];
        };
        Update: {
          created_at?: string;
          display_order?: number;
          insight_id?: string;
          profile_version_id?: string;
          visibility?: Database["public"]["Enums"]["hpi_profile_item_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "human_potential_profile_items_insight_id_fkey";
            columns: ["insight_id"];
            isOneToOne: false;
            referencedRelation: "potential_insights";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "human_potential_profile_items_profile_version_id_fkey";
            columns: ["profile_version_id"];
            isOneToOne: false;
            referencedRelation: "human_potential_profile_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      human_potential_profile_versions: {
        Row: {
          activated_at: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          schema_version: string;
          source_interpretation_request_id: string;
          status: Database["public"]["Enums"]["hpi_profile_version_status"];
          superseded_at: string | null;
          user_id: string;
          version: number;
        };
        Insert: {
          activated_at?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          schema_version: string;
          source_interpretation_request_id: string;
          status?: Database["public"]["Enums"]["hpi_profile_version_status"];
          superseded_at?: string | null;
          user_id: string;
          version: number;
        };
        Update: {
          activated_at?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          schema_version?: string;
          source_interpretation_request_id?: string;
          status?: Database["public"]["Enums"]["hpi_profile_version_status"];
          superseded_at?: string | null;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "human_potential_profile_versi_source_interpretation_reques_fkey";
            columns: ["source_interpretation_request_id"];
            isOneToOne: false;
            referencedRelation: "interpretation_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "human_potential_profile_versions_user_id_fkey";
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
      insight_evidence_links: {
        Row: {
          created_at: string;
          evidence_record_id: string;
          explanation: string;
          insight_id: string;
          support_type: Database["public"]["Enums"]["hpi_support_type"];
          support_weight: number;
        };
        Insert: {
          created_at?: string;
          evidence_record_id: string;
          explanation: string;
          insight_id: string;
          support_type: Database["public"]["Enums"]["hpi_support_type"];
          support_weight: number;
        };
        Update: {
          created_at?: string;
          evidence_record_id?: string;
          explanation?: string;
          insight_id?: string;
          support_type?: Database["public"]["Enums"]["hpi_support_type"];
          support_weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "insight_evidence_links_evidence_record_id_fkey";
            columns: ["evidence_record_id"];
            isOneToOne: false;
            referencedRelation: "evidence_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "insight_evidence_links_insight_id_fkey";
            columns: ["insight_id"];
            isOneToOne: false;
            referencedRelation: "potential_insights";
            referencedColumns: ["id"];
          },
        ];
      };
      insight_uncertainties: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          insight_id: string;
          uncertainty_type: Database["public"]["Enums"]["hpi_uncertainty_type"];
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          insight_id: string;
          uncertainty_type: Database["public"]["Enums"]["hpi_uncertainty_type"];
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          insight_id?: string;
          uncertainty_type?: Database["public"]["Enums"]["hpi_uncertainty_type"];
        };
        Relationships: [
          {
            foreignKeyName: "insight_uncertainties_insight_id_fkey";
            columns: ["insight_id"];
            isOneToOne: false;
            referencedRelation: "potential_insights";
            referencedColumns: ["id"];
          },
        ];
      };
      insight_user_feedback: {
        Row: {
          created_at: string;
          feedback_type: Database["public"]["Enums"]["hpi_feedback_type"];
          id: string;
          insight_id: string;
          reason: string | null;
          replacement_text: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          feedback_type: Database["public"]["Enums"]["hpi_feedback_type"];
          id?: string;
          insight_id: string;
          reason?: string | null;
          replacement_text?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          feedback_type?: Database["public"]["Enums"]["hpi_feedback_type"];
          id?: string;
          insight_id?: string;
          reason?: string | null;
          replacement_text?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insight_user_feedback_insight_id_fkey";
            columns: ["insight_id"];
            isOneToOne: false;
            referencedRelation: "potential_insights";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "insight_user_feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interpretation_request_evidence: {
        Row: {
          created_at: string;
          evidence_record_id: string;
          included_reason: string;
          interpretation_request_id: string;
          source_version: number;
        };
        Insert: {
          created_at?: string;
          evidence_record_id: string;
          included_reason: string;
          interpretation_request_id: string;
          source_version: number;
        };
        Update: {
          created_at?: string;
          evidence_record_id?: string;
          included_reason?: string;
          interpretation_request_id?: string;
          source_version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "interpretation_request_evidence_evidence_record_id_fkey";
            columns: ["evidence_record_id"];
            isOneToOne: false;
            referencedRelation: "evidence_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interpretation_request_evidence_interpretation_request_id_fkey";
            columns: ["interpretation_request_id"];
            isOneToOne: false;
            referencedRelation: "interpretation_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      interpretation_requests: {
        Row: {
          age_band: Database["public"]["Enums"]["age_band"];
          attempt_count: number;
          completed_at: string | null;
          consent_policy_version: string;
          created_at: string;
          evidence_snapshot_version: number;
          failed_at: string | null;
          failure_code: string | null;
          failure_detail_safe: string | null;
          id: string;
          idempotency_key: string;
          interpretation_schema_version: string;
          is_minor: boolean;
          model: string | null;
          prompt_version: string;
          provider: string | null;
          question_set_version: number;
          request_type: string;
          requested_at: string;
          safeguarding_review_required: boolean;
          started_at: string | null;
          status: Database["public"]["Enums"]["hpi_request_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_band: Database["public"]["Enums"]["age_band"];
          attempt_count?: number;
          completed_at?: string | null;
          consent_policy_version: string;
          created_at?: string;
          evidence_snapshot_version?: number;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          id?: string;
          idempotency_key: string;
          interpretation_schema_version: string;
          is_minor: boolean;
          model?: string | null;
          prompt_version: string;
          provider?: string | null;
          question_set_version: number;
          request_type?: string;
          requested_at?: string;
          safeguarding_review_required?: boolean;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["hpi_request_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_band?: Database["public"]["Enums"]["age_band"];
          attempt_count?: number;
          completed_at?: string | null;
          consent_policy_version?: string;
          created_at?: string;
          evidence_snapshot_version?: number;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          id?: string;
          idempotency_key?: string;
          interpretation_schema_version?: string;
          is_minor?: boolean;
          model?: string | null;
          prompt_version?: string;
          provider?: string | null;
          question_set_version?: number;
          request_type?: string;
          requested_at?: string;
          safeguarding_review_required?: boolean;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["hpi_request_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interpretation_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mission_generation_requests: {
        Row: {
          completed_at: string | null;
          created_at: string;
          failed_at: string | null;
          failure_code: string | null;
          failure_detail_safe: string | null;
          generation_kind: Database["public"]["Enums"]["mission_generation_kind"];
          human_potential_profile_id: string;
          id: string;
          model: string | null;
          prompt_version: string;
          provider: string | null;
          refinement_instruction: string | null;
          requested_at: string;
          source_mission_id: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["mission_request_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          generation_kind: Database["public"]["Enums"]["mission_generation_kind"];
          human_potential_profile_id: string;
          id?: string;
          model?: string | null;
          prompt_version: string;
          provider?: string | null;
          refinement_instruction?: string | null;
          requested_at?: string;
          source_mission_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["mission_request_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          generation_kind?: Database["public"]["Enums"]["mission_generation_kind"];
          human_potential_profile_id?: string;
          id?: string;
          model?: string | null;
          prompt_version?: string;
          provider?: string | null;
          refinement_instruction?: string | null;
          requested_at?: string;
          source_mission_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["mission_request_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_generation_requests_human_potential_profile_id_fkey";
            columns: ["human_potential_profile_id"];
            isOneToOne: false;
            referencedRelation: "human_potential_profile_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mission_generation_requests_source_fkey";
            columns: ["source_mission_id"];
            isOneToOne: false;
            referencedRelation: "user_missions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mission_generation_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      journey_generation_requests: {
        Row: {
          completed_at: string | null;
          created_at: string;
          failed_at: string | null;
          failure_code: string | null;
          failure_detail_safe: string | null;
          generation_kind: Database["public"]["Enums"]["journey_generation_kind"];
          id: string;
          mission_id: string;
          model: string | null;
          prompt_version: string;
          provider: string | null;
          refinement_instruction: string | null;
          requested_at: string;
          source_journey_id: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["journey_request_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          generation_kind: Database["public"]["Enums"]["journey_generation_kind"];
          id?: string;
          mission_id: string;
          model?: string | null;
          prompt_version: string;
          provider?: string | null;
          refinement_instruction?: string | null;
          requested_at?: string;
          source_journey_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["journey_request_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          failed_at?: string | null;
          failure_code?: string | null;
          failure_detail_safe?: string | null;
          generation_kind?: Database["public"]["Enums"]["journey_generation_kind"];
          id?: string;
          mission_id?: string;
          model?: string | null;
          prompt_version?: string;
          provider?: string | null;
          refinement_instruction?: string | null;
          requested_at?: string;
          source_journey_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["journey_request_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      journey_milestones: {
        Row: {
          capabilities_to_develop: string[];
          completed_at: string | null;
          completion_signal: string;
          created_at: string;
          expected_outcome: string;
          id: string;
          journey_id: string;
          purpose: string;
          resource_note: string;
          sequence_order: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["journey_milestone_status"];
          suggested_duration: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          capabilities_to_develop: string[];
          completed_at?: string | null;
          completion_signal: string;
          created_at?: string;
          expected_outcome: string;
          id?: string;
          journey_id: string;
          purpose: string;
          resource_note: string;
          sequence_order: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["journey_milestone_status"];
          suggested_duration: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          capabilities_to_develop?: string[];
          completed_at?: string | null;
          completion_signal?: string;
          created_at?: string;
          expected_outcome?: string;
          id?: string;
          journey_id?: string;
          purpose?: string;
          resource_note?: string;
          sequence_order?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["journey_milestone_status"];
          suggested_duration?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_journeys: {
        Row: {
          activated_at: string | null;
          completed_at: string | null;
          created_at: string;
          generation_request_id: string;
          id: string;
          mission_id: string;
          model: string;
          prompt_version: string;
          replaced_at: string | null;
          replaces_journey_id: string | null;
          status: Database["public"]["Enums"]["journey_status"];
          suggested_duration: string;
          summary: string;
          target_outcome: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          generation_request_id: string;
          id?: string;
          mission_id: string;
          model: string;
          prompt_version: string;
          replaced_at?: string | null;
          replaces_journey_id?: string | null;
          status?: Database["public"]["Enums"]["journey_status"];
          suggested_duration: string;
          summary: string;
          target_outcome: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          generation_request_id?: string;
          id?: string;
          mission_id?: string;
          model?: string;
          prompt_version?: string;
          replaced_at?: string | null;
          replaces_journey_id?: string | null;
          status?: Database["public"]["Enums"]["journey_status"];
          suggested_duration?: string;
          summary?: string;
          target_outcome?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
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
      potential_insights: {
        Row: {
          age_appropriate: boolean;
          confidence_factors: Json;
          confidence_level: Database["public"]["Enums"]["hpi_confidence_level"];
          confidence_score: number;
          created_at: string;
          description: string;
          id: string;
          insight_key: string;
          insight_type: Database["public"]["Enums"]["hpi_insight_type"];
          interpretation_request_id: string;
          metadata: Json;
          schema_version: string;
          sensitivity_level: Database["public"]["Enums"]["hpi_sensitivity_level"];
          status: Database["public"]["Enums"]["hpi_insight_status"];
          suggested_confirmation_question: string | null;
          summary: string;
          superseded_at: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_appropriate: boolean;
          confidence_factors: Json;
          confidence_level: Database["public"]["Enums"]["hpi_confidence_level"];
          confidence_score: number;
          created_at?: string;
          description: string;
          id?: string;
          insight_key: string;
          insight_type: Database["public"]["Enums"]["hpi_insight_type"];
          interpretation_request_id: string;
          metadata?: Json;
          schema_version: string;
          sensitivity_level: Database["public"]["Enums"]["hpi_sensitivity_level"];
          status?: Database["public"]["Enums"]["hpi_insight_status"];
          suggested_confirmation_question?: string | null;
          summary: string;
          superseded_at?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_appropriate?: boolean;
          confidence_factors?: Json;
          confidence_level?: Database["public"]["Enums"]["hpi_confidence_level"];
          confidence_score?: number;
          created_at?: string;
          description?: string;
          id?: string;
          insight_key?: string;
          insight_type?: Database["public"]["Enums"]["hpi_insight_type"];
          interpretation_request_id?: string;
          metadata?: Json;
          schema_version?: string;
          sensitivity_level?: Database["public"]["Enums"]["hpi_sensitivity_level"];
          status?: Database["public"]["Enums"]["hpi_insight_status"];
          suggested_confirmation_question?: string | null;
          summary?: string;
          superseded_at?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "potential_insights_interpretation_request_id_fkey";
            columns: ["interpretation_request_id"];
            isOneToOne: false;
            referencedRelation: "interpretation_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "potential_insights_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
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
      user_missions: {
        Row: {
          activated_at: string | null;
          completed_at: string | null;
          created_at: string;
          current_caution: string;
          first_meaningful_outcome: string;
          generation_request_id: string;
          human_potential_profile_id: string;
          id: string;
          mission_statement: string;
          model: string;
          profile_evidence_refs: string[];
          prompt_version: string;
          replaces_mission_id: string | null;
          status: Database["public"]["Enums"]["mission_status"];
          success_signal: string;
          time_horizon: string;
          title: string;
          updated_at: string;
          user_id: string;
          who_this_helps: string;
          why_this_fits: string;
        };
        Insert: {
          activated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          current_caution: string;
          first_meaningful_outcome: string;
          generation_request_id: string;
          human_potential_profile_id: string;
          id?: string;
          mission_statement: string;
          model: string;
          profile_evidence_refs: string[];
          prompt_version: string;
          replaces_mission_id?: string | null;
          status?: Database["public"]["Enums"]["mission_status"];
          success_signal: string;
          time_horizon: string;
          title: string;
          updated_at?: string;
          user_id: string;
          who_this_helps: string;
          why_this_fits: string;
        };
        Update: {
          activated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          current_caution?: string;
          first_meaningful_outcome?: string;
          generation_request_id?: string;
          human_potential_profile_id?: string;
          id?: string;
          mission_statement?: string;
          model?: string;
          profile_evidence_refs?: string[];
          prompt_version?: string;
          replaces_mission_id?: string | null;
          status?: Database["public"]["Enums"]["mission_status"];
          success_signal?: string;
          time_horizon?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          who_this_helps?: string;
          why_this_fits?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_missions_generation_request_id_fkey";
            columns: ["generation_request_id"];
            isOneToOne: true;
            referencedRelation: "mission_generation_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_missions_human_potential_profile_id_fkey";
            columns: ["human_potential_profile_id"];
            isOneToOne: false;
            referencedRelation: "human_potential_profile_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_missions_replaces_mission_id_fkey";
            columns: ["replaces_mission_id"];
            isOneToOne: false;
            referencedRelation: "user_missions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_missions_user_id_fkey";
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
      activate_stage6_journey: {
        Args: { journey_id_input: string };
        Returns: boolean;
      };
      activate_stage5_mission: {
        Args: { mission_id_input: string };
        Returns: boolean;
      };
      claim_stage4_interpretation_request: {
        Args: {
          model_input: string;
          provider_input: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
      claim_stage5_mission_request: {
        Args: {
          model_input: string;
          provider_input: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
      claim_stage6_journey_request: {
        Args: {
          model_input: string;
          provider_input: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
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
      create_stage4_interpretation_request: {
        Args: {
          idempotency_key_input: string;
          interpretation_schema_version_input: string;
          prompt_version_input: string;
        };
        Returns: string;
      };
      create_stage5_mission_request: {
        Args: {
          generation_kind_input: Database["public"]["Enums"]["mission_generation_kind"];
          profile_id_input: string;
          prompt_version_input?: string;
          refinement_instruction_input?: string;
          source_mission_id_input?: string;
        };
        Returns: string;
      };
      create_stage6_journey_request: {
        Args: {
          generation_kind_input: Database["public"]["Enums"]["journey_generation_kind"];
          mission_id_input: string;
          prompt_version_input?: string;
          refinement_instruction_input?: string;
          source_journey_id_input?: string;
        };
        Returns: string;
      };
      discovery_progress: {
        Args: { session_id_input: string };
        Returns: number;
      };
      fail_stage4_interpretation_request: {
        Args: {
          failure_code_input: string;
          failure_detail_safe_input?: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
      fail_stage5_mission_request: {
        Args: {
          failure_code_input: string;
          failure_detail_safe_input?: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
      fail_stage6_journey_request: {
        Args: {
          failure_code_input: string;
          failure_detail_safe_input?: string;
          request_id_input: string;
        };
        Returns: boolean;
      };
      normalize_stage4_discovery_evidence: { Args: never; Returns: number };
      open_discovery_review: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: number;
      };
      open_discovery_review_v1_internal: {
        Args: { expected_version_input: number; session_id_input: string };
        Returns: number;
      };
      persist_stage4_human_potential_profile: {
        Args: {
          insights_input: Json;
          profile_metadata_input: Json;
          profile_summary_input: string;
          request_id_input: string;
        };
        Returns: string;
      };
      persist_stage5_mission: {
        Args: { mission_input: Json; request_id_input: string };
        Returns: string;
      };
      persist_stage6_journey: {
        Args: { journey_input: Json; request_id_input: string };
        Returns: string;
      };
      provision_identity: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      record_stage4_insight_feedback: {
        Args: {
          feedback_type_input: Database["public"]["Enums"]["hpi_feedback_type"];
          insight_id_input: string;
          reason_input?: string;
          replacement_text_input?: string;
        };
        Returns: string;
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
      hpi_confidence_level: "low" | "emerging" | "moderate" | "strong";
      hpi_evidence_category:
        | "current_reality"
        | "interest"
        | "capability"
        | "experience"
        | "value"
        | "environment"
        | "constraint"
        | "motivation"
        | "readiness";
      hpi_evidence_source_type: "discovery_response";
      hpi_evidence_status: "eligible" | "invalidated" | "superseded";
      hpi_feedback_type:
        | "confirmed"
        | "partly_true"
        | "not_true"
        | "needs_context"
        | "unsure"
        | "edited";
      hpi_insight_status:
        "draft" | "active" | "rejected" | "superseded" | "archived";
      hpi_insight_type:
        | "strength_pattern"
        | "interest_pattern"
        | "value_pattern"
        | "capability_pattern"
        | "environmental_preference"
        | "problem_orientation"
        | "contribution_orientation"
        | "growth_need"
        | "constraint"
        | "motivation_pattern"
        | "readiness_pattern";
      hpi_profile_item_visibility: "private";
      hpi_profile_version_status:
        "draft" | "active" | "superseded" | "archived";
      hpi_request_status:
        | "pending"
        | "validating"
        | "ready"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "superseded";
      hpi_sensitivity_level: "standard" | "sensitive";
      hpi_support_type: "supporting" | "contradicting" | "context";
      hpi_uncertainty_type:
        | "insufficient_examples"
        | "conflicting_evidence"
        | "low_response_detail"
        | "age_or_life_stage"
        | "context_specific"
        | "outdated_evidence"
        | "possible_response_bias";
      identity_checkpoint_status: "not_started" | "in_progress" | "completed";
      journey_generation_kind: "initial" | "regenerate" | "refine";
      journey_milestone_status: "locked" | "available" | "active" | "completed";
      journey_request_status: "ready" | "processing" | "completed" | "failed";
      journey_status: "draft" | "active" | "paused" | "completed" | "replaced";
      mission_generation_kind: "initial" | "regenerate" | "refine";
      mission_request_status: "ready" | "processing" | "completed" | "failed";
      mission_status: "draft" | "active" | "paused" | "completed" | "replaced";
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
      hpi_confidence_level: ["low", "emerging", "moderate", "strong"],
      hpi_evidence_category: [
        "current_reality",
        "interest",
        "capability",
        "experience",
        "value",
        "environment",
        "constraint",
        "motivation",
        "readiness",
      ],
      hpi_evidence_source_type: ["discovery_response"],
      hpi_evidence_status: ["eligible", "invalidated", "superseded"],
      hpi_feedback_type: [
        "confirmed",
        "partly_true",
        "not_true",
        "needs_context",
        "unsure",
        "edited",
      ],
      hpi_insight_status: [
        "draft",
        "active",
        "rejected",
        "superseded",
        "archived",
      ],
      hpi_insight_type: [
        "strength_pattern",
        "interest_pattern",
        "value_pattern",
        "capability_pattern",
        "environmental_preference",
        "problem_orientation",
        "contribution_orientation",
        "growth_need",
        "constraint",
        "motivation_pattern",
        "readiness_pattern",
      ],
      hpi_profile_item_visibility: ["private"],
      hpi_profile_version_status: ["draft", "active", "superseded", "archived"],
      hpi_request_status: [
        "pending",
        "validating",
        "ready",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "superseded",
      ],
      hpi_sensitivity_level: ["standard", "sensitive"],
      hpi_support_type: ["supporting", "contradicting", "context"],
      hpi_uncertainty_type: [
        "insufficient_examples",
        "conflicting_evidence",
        "low_response_detail",
        "age_or_life_stage",
        "context_specific",
        "outdated_evidence",
        "possible_response_bias",
      ],
      identity_checkpoint_status: ["not_started", "in_progress", "completed"],
      mission_generation_kind: ["initial", "regenerate", "refine"],
      mission_request_status: ["ready", "processing", "completed", "failed"],
      mission_status: ["draft", "active", "paused", "completed", "replaced"],
      onboarding_status: ["identity_required", "stage_3_ready"],
      profile_visibility: ["private"],
    },
  },
} as const;
