// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


/**
 * Singleton do cliente Supabase para uso em componentes Client e Server.
 * Para chamadas server‑side, combine com cookies/headers conforme a doc.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

// Types
export interface Supplier {
  id?: string;
  company_id: string;
  name: string;
  cnpj?: string | null;
  supplier_type: string;
  risk_level: string;
  status: string;
  contract_type: string;
  is_technology: boolean;
  data_volume: string;
  data_sensitivity: string;
  service_description: string;
  internal_responsible: string;
  [key: string]: any;
}

export interface Assessment {
  id?: string;
  supplier_id: string;
  status: string;
  risk_level: string;
  data_volume: string;
  data_type: string;
  classification_code: string;
  classification_description: string;
  [key: string]: any;
}

// Database functions
export async function createSupplier(data: Partial<Supplier>): Promise<Supplier | null> {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return supplier;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
}

export async function createAssessment(data: Partial<Assessment>): Promise<Assessment | null> {
  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return assessment;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
}

export async function updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment | null> {
  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return assessment;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
}

export async function getChecklistItemsByAssessment(assessmentId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return [];
  }
}

export async function saveChecklistItems(items: any[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('checklist_items')
      .upsert(items, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving checklist items:', error);
    return false;
  }
}

export interface ScreeningResponse {
  id?: string;
  formulario_id?: string;
  nome_fornecedor: string;
  cnpj?: string | null;
  email_contato?: string | null;
  telefone?: string | null;
  respostas: Record<string, any>;
  data_submissao?: string;
  status_processamento?: string;
  fornecedor_id?: number;
  ip_submissao?: string | null;
  metadata?: Record<string, any> | null;
  arquivos_anexos?: Record<string, any> | null;
}

export async function saveScreeningResponse(
  data: Partial<ScreeningResponse>
): Promise<ScreeningResponse | null> {
  try {
    const { data: response, error } = await supabase
      .from('resposta_triagem_fornecedores')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return response as ScreeningResponse;
  } catch (error) {
    console.error('Error saving screening response:', error);
    throw error;
  }
}

// ----------------------------------------------------------
// Additional retrieval helpers
// ----------------------------------------------------------

export interface Document {
  id: string;
  supplier_id: string;
  assessment_id?: string | null;
  name: string;
  storage_path: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_at?: string | null;
  uploaded_by?: string | null;
  file_url?: string | null;
}

/** Obtem lista de fornecedores */
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Supplier[]) || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

/** Recupera fornecedor por ID */
export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Supplier;
  } catch (error) {
    console.error('Error fetching supplier by id:', error);
    return null;
  }
}

/** Documentos vinculados ao fornecedor */
export async function getDocumentsBySupplier(
  supplierId: string
): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    const docs = (data as Document[]) || [];
    return docs.map((doc) => ({
      ...doc,
      file_url: doc.storage_path
        ? `${supabaseUrl}/storage/v1/object/public/supplier-documents/${doc.storage_path}`
        : null,
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

/** Avaliacoes vinculadas ao fornecedor */
export async function getAssessmentsBySupplier(
  supplierId: string
): Promise<Assessment[]> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Assessment[]) || [];
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
}
