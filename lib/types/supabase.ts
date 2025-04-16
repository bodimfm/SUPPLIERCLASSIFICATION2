/**
 * Interface da base de dados do Supabase para tipagem
 * Será melhorada quando executarmos a geração de tipos do Supabase
 */
export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string
          name: string
          tax_id: string | null
          email: string | null
          phone: string | null
          address: string | null
          contact_person: string | null
          service_description: string | null
          internal_responsible: string | null
          is_technology: boolean
          data_type: string | null
          data_volume: string | null
          criticality: string | null
          policy: string | null
          certification: string | null
          subcontracting: string | null
          incidents: string | null
          risk_score: number | null
          risk_level: string | null
          risk_description: string | null
          supplier_type: string | null
          supplier_type_description: string | null
          status: string | null
          registration_date: string | null
          last_assessment_date: string | null
          next_assessment_date: string | null
          documents_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_id?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          service_description?: string | null
          internal_responsible?: string | null
          is_technology?: boolean
          data_type?: string | null
          data_volume?: string | null
          criticality?: string | null
          policy?: string | null
          certification?: string | null
          subcontracting?: string | null
          incidents?: string | null
          risk_score?: number | null
          risk_level?: string | null
          risk_description?: string | null
          supplier_type?: string | null
          supplier_type_description?: string | null
          status?: string | null
          registration_date?: string | null
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          documents_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_id?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          contact_person?: string | null
          service_description?: string | null
          internal_responsible?: string | null
          is_technology?: boolean
          data_type?: string | null
          data_volume?: string | null
          criticality?: string | null
          policy?: string | null
          certification?: string | null
          subcontracting?: string | null
          incidents?: string | null
          risk_score?: number | null
          risk_level?: string | null
          risk_description?: string | null
          supplier_type?: string | null
          supplier_type_description?: string | null
          status?: string | null
          registration_date?: string | null
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          documents_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      supplier_documents: {
        Row: {
          id: string
          supplier_id: string
          document_name: string
          document_id: string | null
          file_name: string | null
          file_path: string | null
          is_provided: boolean
          upload_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          document_name: string
          document_id?: string | null
          file_name?: string | null
          file_path?: string | null
          is_provided?: boolean
          upload_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          document_name?: string
          document_id?: string | null
          file_name?: string | null
          file_path?: string | null
          is_provided?: boolean
          upload_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      supplier_assessments: {
        Row: {
          id: string
          supplier_id: string
          assessment_date: string
          assessed_by: string
          risk_score_data: any
          risk_score: number
          risk_level: string
          supplier_type: string
          recommended_actions: string[] | null
          next_assessment_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          assessment_date: string
          assessed_by: string
          risk_score_data?: any
          risk_score: number
          risk_level: string
          supplier_type: string
          recommended_actions?: string[] | null
          next_assessment_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          assessment_date?: string
          assessed_by?: string
          risk_score_data?: any
          risk_score?: number
          risk_level?: string
          supplier_type?: string
          recommended_actions?: string[] | null
          next_assessment_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          role: 'client' | 'dpo_member' | 'admin'
          full_name: string | null
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'client' | 'dpo_member' | 'admin'
          full_name?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'client' | 'dpo_member' | 'admin'
          full_name?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      monitoring_tasks: {
        Row: {
          id: string
          task_name: string
          description: string | null
          supplier_id: string | null
          supplier_name: string
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'completed' | 'overdue'
          assigned_to: string
          notify_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_name: string
          description?: string | null
          supplier_id?: string | null
          supplier_name: string
          due_date: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'completed' | 'overdue'
          assigned_to: string
          notify_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_name?: string
          description?: string | null
          supplier_id?: string | null
          supplier_name?: string
          due_date?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'completed' | 'overdue'
          assigned_to?: string
          notify_email?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}