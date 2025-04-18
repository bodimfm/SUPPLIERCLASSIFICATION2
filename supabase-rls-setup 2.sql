-- Configuração de políticas RLS para o Supabase
-- Este script configura as permissões necessárias para o correto funcionamento
-- do aplicativo, especialmente para o upload de documentos.

-- Políticas de acesso ao Storage
-- ==============================

-- Permitir acesso anônimo para listar buckets (necessário para verificação inicial)
CREATE POLICY IF NOT EXISTS "Permitir listar buckets para qualquer um" 
ON storage.buckets FOR SELECT
USING (true);

-- Permitir a criação do bucket supplier-documents para usuários anônimos (necessário para inicialização)
CREATE POLICY IF NOT EXISTS "Permitir criação do bucket supplier-documents" 
ON storage.buckets FOR INSERT
TO anon
WITH CHECK (name = 'supplier-documents');

-- 1. Permitir que usuários anônimos leiam arquivos públicos
CREATE POLICY IF NOT EXISTS "Arquivos públicos são acessíveis por qualquer um" 
ON storage.objects FOR SELECT
USING (bucket_id = 'supplier-documents');

-- 2. Permitir que usuários anônimos façam upload
CREATE POLICY IF NOT EXISTS "Usuários anônimos podem fazer upload" 
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'supplier-documents');

-- 3. Permitir que usuários anônimos atualizem seus próprios uploads
CREATE POLICY IF NOT EXISTS "Usuários anônimos podem atualizar uploads" 
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'supplier-documents')
WITH CHECK (bucket_id = 'supplier-documents');

-- 4. Permitir que usuários anônimos excluam seus próprios uploads
CREATE POLICY IF NOT EXISTS "Usuários anônimos podem excluir uploads" 
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'supplier-documents');

-- 5. Usuários autenticados podem ler todos os arquivos no bucket
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ler todos os arquivos" 
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'supplier-documents');

-- 6. Usuários autenticados podem fazer upload
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem fazer upload" 
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'supplier-documents');

-- 7. Usuários autenticados podem atualizar qualquer arquivo
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem atualizar qualquer arquivo" 
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'supplier-documents')
WITH CHECK (bucket_id = 'supplier-documents');

-- 8. Usuários autenticados podem excluir qualquer arquivo
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem excluir qualquer arquivo" 
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'supplier-documents');

-- Garantir que o bucket supplier-documents exista
-- ==============================================

-- Função para garantir que o bucket supplier-documents exista
CREATE OR REPLACE FUNCTION public.ensure_supplier_documents_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o bucket já existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'supplier-documents') THEN
    -- Criar o bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('supplier-documents', 'supplier-documents', true);
  END IF;
END;
$$;

-- Executar a função para garantir que o bucket exista
SELECT ensure_supplier_documents_bucket();

-- Função para registrar uploads de documentos automaticamente
-- ==========================================================

-- Criar tabela supplier_documents se ela ainda não existir
CREATE TABLE IF NOT EXISTS public.supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id TEXT,
  document_id TEXT,
  document_name TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_provided BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  notes TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Habilitar RLS na tabela supplier_documents
ALTER TABLE IF EXISTS public.supplier_documents ENABLE ROW LEVEL SECURITY;

-- Criar políticas para a tabela supplier_documents
CREATE POLICY IF NOT EXISTS "Qualquer um pode ver documentos" 
ON public.supplier_documents FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Qualquer um pode inserir documentos" 
ON public.supplier_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Qualquer um pode atualizar documentos" 
ON public.supplier_documents FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Qualquer um pode excluir documentos" 
ON public.supplier_documents FOR DELETE
USING (true);

-- Garantir que o service_role tenha acesso total ao bucket e objetos
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON TABLE public.supplier_documents TO service_role;

-- Garantir que o anon role tenha acesso básico
GRANT USAGE ON SCHEMA storage TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE storage.buckets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.supplier_documents TO anon;

-- Garantir que o authenticated role tenha acesso completo
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE storage.buckets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.supplier_documents TO authenticated;