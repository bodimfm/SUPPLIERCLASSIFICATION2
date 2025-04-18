export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      classification_document_requirements: {
        Row: {
          classification_code: string
          created_at: string | null
          document_id: string
          id: string
          is_required: boolean
          technology_only: boolean
        }
        Insert: {
          classification_code: string
          created_at?: string | null
          document_id: string
          id?: string
          is_required?: boolean
          technology_only?: boolean
        }
        Update: {
          classification_code?: string
          created_at?: string | null
          document_id?: string
          id?: string
          is_required?: boolean
          technology_only?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "classification_document_requirements_classification_code_fkey"
            columns: ["classification_code"]
            isOneToOne: false
            referencedRelation: "supplier_classifications"
            referencedColumns: ["code"]
          },
        ]
      }
      Clientes: {
        Row: {
          created_at: string
          Empresa: string
          id: number
        }
        Insert: {
          created_at?: string
          Empresa: string
          id?: number
        }
        Update: {
          created_at?: string
          Empresa?: string
          id?: number
        }
        Relationships: []
      }
      monitoring_tasks: {
        Row: {
          assigned_to: string
          created_at: string | null
          description: string | null
          due_date: string
          email_notifications: Json | null
          id: string
          last_notification_date: string | null
          notify_email: boolean | null
          priority: string
          status: string
          supplier_id: string
          task_name: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          description?: string | null
          due_date: string
          email_notifications?: Json | null
          id?: string
          last_notification_date?: string | null
          notify_email?: boolean | null
          priority: string
          status?: string
          supplier_id: string
          task_name: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          description?: string | null
          due_date?: string
          email_notifications?: Json | null
          id?: string
          last_notification_date?: string | null
          notify_email?: boolean | null
          priority?: string
          status?: string
          supplier_id?: string
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_tasks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: never
          title: string
        }
        Update: {
          id?: never
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      required_documents: {
        Row: {
          descricao: string | null
          id: number
          nome: string
          obrigatorio: boolean | null
          tipos_classificacao_id: number | null
        }
        Insert: {
          descricao?: string | null
          id?: number
          nome: string
          obrigatorio?: boolean | null
          tipos_classificacao_id?: number | null
        }
        Update: {
          descricao?: string | null
          id?: number
          nome?: string
          obrigatorio?: boolean | null
          tipos_classificacao_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_requisitos_tipos_classificacao_id_fkey"
            columns: ["tipos_classificacao_id"]
            isOneToOne: false
            referencedRelation: "tipos_classificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_assessments: {
        Row: {
          assessed_by: string
          assessment_date: string | null
          assessment_notes: string | null
          created_at: string | null
          current_risk_level: string
          document_url: string | null
          id: string
          next_assessment_date: string | null
          previous_risk_level: string | null
          supplier_id: string
        }
        Insert: {
          assessed_by: string
          assessment_date?: string | null
          assessment_notes?: string | null
          created_at?: string | null
          current_risk_level: string
          document_url?: string | null
          id?: string
          next_assessment_date?: string | null
          previous_risk_level?: string | null
          supplier_id: string
        }
        Update: {
          assessed_by?: string
          assessment_date?: string | null
          assessment_notes?: string | null
          created_at?: string | null
          current_risk_level?: string
          document_url?: string | null
          id?: string
          next_assessment_date?: string | null
          previous_risk_level?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_assessments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_classifications: {
        Row: {
          code: string
          color_code: string
          created_at: string | null
          data_sensitivity_criteria: string[]
          data_volume_criteria: string[]
          description: string
          display_order: number
          id: string
          reassessment_period: number
          risk_description: string
          risk_level: string
          updated_at: string | null
        }
        Insert: {
          code: string
          color_code: string
          created_at?: string | null
          data_sensitivity_criteria: string[]
          data_volume_criteria: string[]
          description: string
          display_order: number
          id?: string
          reassessment_period: number
          risk_description: string
          risk_level: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          color_code?: string
          created_at?: string | null
          data_sensitivity_criteria?: string[]
          data_volume_criteria?: string[]
          description?: string
          display_order?: number
          id?: string
          reassessment_period?: number
          risk_description?: string
          risk_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_documents: {
        Row: {
          created_at: string | null
          document_description: string | null
          document_id: string
          document_name: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_provided: boolean | null
          is_required: boolean | null
          notes: string | null
          supplier_id: string
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_description?: string | null
          document_id: string
          document_name: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_provided?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          supplier_id: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_description?: string | null
          document_id?: string
          document_name?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_provided?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          supplier_id?: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_documents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          certification: string | null
          company_id: string | null
          created_at: string | null
          criticality: string | null
          data_type: string | null
          data_volume: string | null
          dpo_adjusted_risk_level: string | null
          dpo_comments: string | null
          dpo_review_date: string | null
          dpo_reviewed: boolean | null
          dpo_reviewer: string | null
          id: string
          incidents: string | null
          internal_responsible: string | null
          is_technology: boolean | null
          name: string
          policy: string | null
          registration_date: string | null
          risk_description: string | null
          risk_level: string | null
          risk_score: number | null
          status: string
          subcontracting: string | null
          supplier_type: string
          supplier_type_description: string | null
          tax_id: string
          updated_at: string | null
        }
        Insert: {
          certification?: string | null
          company_id?: string | null
          created_at?: string | null
          criticality?: string | null
          data_type?: string | null
          data_volume?: string | null
          dpo_adjusted_risk_level?: string | null
          dpo_comments?: string | null
          dpo_review_date?: string | null
          dpo_reviewed?: boolean | null
          dpo_reviewer?: string | null
          id?: string
          incidents?: string | null
          internal_responsible?: string | null
          is_technology?: boolean | null
          name: string
          policy?: string | null
          registration_date?: string | null
          risk_description?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          subcontracting?: string | null
          supplier_type: string
          supplier_type_description?: string | null
          tax_id: string
          updated_at?: string | null
        }
        Update: {
          certification?: string | null
          company_id?: string | null
          created_at?: string | null
          criticality?: string | null
          data_type?: string | null
          data_volume?: string | null
          dpo_adjusted_risk_level?: string | null
          dpo_comments?: string | null
          dpo_review_date?: string | null
          dpo_reviewed?: boolean | null
          dpo_reviewer?: string | null
          id?: string
          incidents?: string | null
          internal_responsible?: string | null
          is_technology?: boolean | null
          name?: string
          policy?: string | null
          registration_date?: string | null
          risk_description?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          subcontracting?: string | null
          supplier_type?: string
          supplier_type_description?: string | null
          tax_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tipos_classificacao: {
        Row: {
          descricao: string
          id: number
          nivel_criticidade: string
          nome: string
        }
        Insert: {
          descricao: string
          id?: number
          nivel_criticidade: string
          nome: string
        }
        Update: {
          descricao?: string
          id?: number
          nivel_criticidade?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_documentos_by_classificacao: {
        Args: { class_id: number }
        Returns: {
          id: number
          nome: string
          descricao: string
          obrigatorio: boolean
        }[]
      }
      log_email_notification: {
        Args: { task_id: string; sent_date: string; recipient: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "dpo" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["dpo", "client"],
    },
  },
} as const
