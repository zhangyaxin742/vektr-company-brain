export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          org_id: string;
          role: "owner" | "admin" | "member";
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          org_id: string;
          role: "owner" | "admin" | "member";
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          org_id?: string;
          role?: "owner" | "admin" | "member";
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          org_id: string;
          raw_text: string;
          source_date: string | null;
          source_type:
            | "slack_json"
            | "email_json"
            | "markdown"
            | "text"
            | "pdf"
            | "demo_seed";
          storage_path: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          org_id: string;
          raw_text: string;
          source_date?: string | null;
          source_type:
            | "slack_json"
            | "email_json"
            | "markdown"
            | "text"
            | "pdf"
            | "demo_seed";
          storage_path?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          org_id?: string;
          raw_text?: string;
          source_date?: string | null;
          source_type?:
            | "slack_json"
            | "email_json"
            | "markdown"
            | "text"
            | "pdf"
            | "demo_seed";
          storage_path?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chunks: {
        Row: {
          chunk_index: number;
          content: string;
          created_at: string;
          document_id: string;
          embedding: string | null;
          id: string;
          metadata: Json;
          org_id: string;
        };
        Insert: {
          chunk_index: number;
          content: string;
          created_at?: string;
          document_id: string;
          embedding?: string | null;
          id?: string;
          metadata?: Json;
          org_id: string;
        };
        Update: {
          chunk_index?: number;
          content?: string;
          created_at?: string;
          document_id?: string;
          embedding?: string | null;
          id?: string;
          metadata?: Json;
          org_id?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          allowed_actions: Json;
          approval_gates: Json;
          confidence: number;
          created_at: string;
          forbidden_actions: Json;
          id: string;
          inputs_required: Json;
          metadata: Json;
          name: string;
          org_id: string;
          slug: string;
          source_chunk_ids: string[];
          source_entity_ids: string[];
          status: "draft" | "approved" | "rejected";
          steps: Json;
          trigger: string;
          updated_at: string;
          version: string;
        };
        Insert: {
          allowed_actions?: Json;
          approval_gates?: Json;
          confidence?: number;
          created_at?: string;
          forbidden_actions?: Json;
          id?: string;
          inputs_required?: Json;
          metadata?: Json;
          name: string;
          org_id: string;
          slug: string;
          source_chunk_ids?: string[];
          source_entity_ids?: string[];
          status?: "draft" | "approved" | "rejected";
          steps?: Json;
          trigger: string;
          updated_at?: string;
          version?: string;
        };
        Update: {
          allowed_actions?: Json;
          approval_gates?: Json;
          confidence?: number;
          created_at?: string;
          forbidden_actions?: Json;
          id?: string;
          inputs_required?: Json;
          metadata?: Json;
          name?: string;
          org_id?: string;
          slug?: string;
          source_chunk_ids?: string[];
          source_entity_ids?: string[];
          status?: "draft" | "approved" | "rejected";
          steps?: Json;
          trigger?: string;
          updated_at?: string;
          version?: string;
        };
        Relationships: [];
      };
      health_flags: {
        Row: {
          created_at: string;
          description: string;
          evidence_chunk_ids: string[];
          id: string;
          org_id: string;
          related_entity_ids: string[];
          severity: "info" | "warning" | "critical";
          status: "open" | "dismissed" | "resolved";
          title: string;
          type:
            | "conflict"
            | "missing_owner"
            | "stale_skill"
            | "low_confidence"
            | "unapproved_skill"
            | "customer_risk";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          evidence_chunk_ids?: string[];
          id?: string;
          org_id: string;
          related_entity_ids?: string[];
          severity: "info" | "warning" | "critical";
          status?: "open" | "dismissed" | "resolved";
          title: string;
          type:
            | "conflict"
            | "missing_owner"
            | "stale_skill"
            | "low_confidence"
            | "unapproved_skill"
            | "customer_risk";
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          evidence_chunk_ids?: string[];
          id?: string;
          org_id?: string;
          related_entity_ids?: string[];
          severity?: "info" | "warning" | "critical";
          status?: "open" | "dismissed" | "resolved";
          title?: string;
          type?:
            | "conflict"
            | "missing_owner"
            | "stale_skill"
            | "low_confidence"
            | "unapproved_skill"
            | "customer_risk";
          updated_at?: string;
        };
        Relationships: [];
      };
      ask_logs: {
        Row: {
          answer: Json;
          citation_chunk_ids: string[];
          created_at: string;
          id: string;
          org_id: string;
          question: string;
          user_id: string;
        };
        Insert: {
          answer?: Json;
          citation_chunk_ids?: string[];
          created_at?: string;
          id?: string;
          org_id: string;
          question: string;
          user_id: string;
        };
        Update: {
          answer?: Json;
          citation_chunk_ids?: string[];
          created_at?: string;
          id?: string;
          org_id?: string;
          question?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_chunks: {
        Args: {
          match_count?: number;
          match_threshold?: number | null;
          query_embedding: number[];
          target_org_id: string;
        };
        Returns: {
          content: string;
          document_id: string;
          document_source_type: string;
          document_title: string;
          id: string;
          metadata: Json;
          org_id: string;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
