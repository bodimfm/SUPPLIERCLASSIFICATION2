-- Configuração de papéis de usuário (roles) para segregar clientes e membros do escritório DPO

-- 1. Criar uma tabela de perfis de usuário para armazenar papéis (roles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('client', 'dpo_member', 'admin')),
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Habilitar RLS para a tabela de perfis
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas para tabela de perfis
-- Permitir que usuários vejam seus próprios perfis
CREATE POLICY "Os usuários podem ver seus próprios perfis"
ON public.user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Permitir que membros do escritório DPO vejam todos os perfis
CREATE POLICY "Membros do escritório DPO podem ver todos os perfis"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  -- Verificar se o usuário atual é um membro do DPO ou admin
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- 4. Trigger para criar automaticamente perfil ao criar um usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Por padrão, novos usuários são clientes
  -- Administradores podem mudar isso manualmente depois
  INSERT INTO public.user_profiles (id, role, full_name)
  VALUES (NEW.id, 'client', NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger na tabela de usuários do Supabase Auth
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 5. Modificar as políticas RLS existentes para as tabelas principais

-- FORNECEDORES (suppliers)

-- Política para visualização - clientes só podem ver seus próprios fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os fornecedores" ON suppliers;

-- Clientes podem ver apenas seus próprios fornecedores
CREATE POLICY "Clientes podem ver seus próprios fornecedores"
ON suppliers FOR SELECT
TO authenticated
USING (
  -- Se o usuário for cliente, só vê seus próprios fornecedores
  (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'client' AND suppliers.created_by = auth.uid()
  ))
  OR
  -- Se o usuário for membro do DPO ou admin, vê todos os fornecedores
  (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  ))
);

-- Política para inserção - mantém a mesma
-- Política para atualização - clientes não podem atualizar, apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios fornecedores" ON suppliers;

CREATE POLICY "Apenas membros do DPO podem atualizar fornecedores"
ON suppliers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- Política para exclusão - apenas membros do DPO podem excluir
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios fornecedores" ON suppliers;

CREATE POLICY "Apenas membros do DPO podem excluir fornecedores"
ON suppliers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- DOCUMENTOS (supplier_documents)

-- Política para visualização - clientes só podem ver seus próprios documentos
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os documentos" ON supplier_documents;

CREATE POLICY "Visualização de documentos baseada em role"
ON supplier_documents FOR SELECT
TO authenticated
USING (
  -- Clientes só veem documentos de fornecedores que eles criaram
  (EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN suppliers s ON supplier_documents.supplier_id = s.id
    WHERE up.id = auth.uid() AND up.role = 'client' AND s.created_by = auth.uid()
  ))
  OR
  -- Membros do DPO veem todos os documentos
  (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  ))
);

-- Política para atualização - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios documentos" ON supplier_documents;

CREATE POLICY "Apenas membros do DPO podem atualizar documentos"
ON supplier_documents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- Política para exclusão - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios documentos" ON supplier_documents;

CREATE POLICY "Apenas membros do DPO podem excluir documentos"
ON supplier_documents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- AVALIAÇÕES DE RISCO (risk_assessments)

-- Política para visualização - clientes só podem ver avaliações de seus fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as avaliações de risco" ON risk_assessments;

CREATE POLICY "Visualização de avaliações baseada em role"
ON risk_assessments FOR SELECT
TO authenticated
USING (
  -- Clientes veem apenas avaliações dos fornecedores que eles criaram
  (EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN suppliers s ON risk_assessments.supplier_id = s.id
    WHERE up.id = auth.uid() AND up.role = 'client' AND s.created_by = auth.uid()
  ))
  OR
  -- Membros do DPO veem todas as avaliações
  (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  ))
);

-- Política para atualização - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias avaliações de risco" ON risk_assessments;

CREATE POLICY "Apenas membros do DPO podem atualizar avaliações"
ON risk_assessments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- Política para exclusão - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias avaliações de risco" ON risk_assessments;

CREATE POLICY "Apenas membros do DPO podem excluir avaliações"
ON risk_assessments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- TAREFAS DE MONITORAMENTO (monitoring_tasks)

-- Política para visualização - clientes só veem tarefas de seus fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as tarefas" ON monitoring_tasks;

CREATE POLICY "Visualização de tarefas baseada em role"
ON monitoring_tasks FOR SELECT
TO authenticated
USING (
  -- Clientes veem apenas tarefas dos fornecedores que eles criaram
  (EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN suppliers s ON monitoring_tasks.supplier_id = s.id
    WHERE up.id = auth.uid() AND up.role = 'client' AND s.created_by = auth.uid()
  ))
  OR
  -- Membros do DPO veem todas as tarefas
  (EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  ))
);

-- Política para atualização - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tarefas" ON monitoring_tasks;

CREATE POLICY "Apenas membros do DPO podem atualizar tarefas"
ON monitoring_tasks FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- Política para exclusão - apenas membros do DPO
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias tarefas" ON monitoring_tasks;

CREATE POLICY "Apenas membros do DPO podem excluir tarefas"
ON monitoring_tasks FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')
  )
);

-- 6. Storage - ajustar políticas para refletir funções

-- Leitura - clientes só podem ler seus próprios arquivos
DROP POLICY IF EXISTS "Usuários autenticados podem ler arquivos" ON storage.objects;

CREATE POLICY "Leitura de arquivos baseada em role"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'supplier-documents' AND 
  (
    -- Clientes só veem seus próprios arquivos
    ((storage.foldername(name))[1] = auth.uid()::text AND
     EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'client'))
    OR
    -- Membros do DPO veem todos os arquivos
    (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('dpo_member', 'admin')))
  )
);

-- Atualização - apenas membros do DPO podem atualizar qualquer arquivo
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios arquivos" ON storage.objects;

CREATE POLICY "Apenas membros do DPO podem atualizar arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'supplier-documents' AND
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('dpo_member', 'admin'))
);

-- Exclusão - apenas membros do DPO podem excluir qualquer arquivo
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios arquivos" ON storage.objects;

CREATE POLICY "Apenas membros do DPO podem excluir arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'supplier-documents' AND
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('dpo_member', 'admin'))
);

-- 7. Função para obter o papel atual do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;