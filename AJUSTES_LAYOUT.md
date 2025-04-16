# Documentação Técnica - Sistema de Classificação de Fornecedores

## Arquitetura e Componentes Instalados

### Estrutura Principal do Projeto

- **/app**: Implementa Next.js App Router
  - **/api/suppliers**: Endpoints para gerenciamento de fornecedores
  - **/auth**: Sistema de autenticação via Supabase
  - **/dashboard**: Painel principal da aplicação
  - **/login**: Interface de login
  
- **/components**: Componentes React reutilizáveis
  - **adherence-analysis-results.tsx**: Exibe resultados da análise de aderência
  - **adherence-analysis.tsx**: Implementa análise de aderência a regulamentos
  - **assessment-form.tsx**: Formulário de avaliação de fornecedores
  - **checklist.tsx**: Componente de checklist para verificação de conformidade
  - **contract-form.tsx**: Gerenciamento de contratos
  - **contract-upload.tsx**: Upload de contratos
  - **document-upload.tsx**: Sistema de upload de documentos para Supabase Storage
  - **dpo-review-form.tsx**: Formulário de revisão para DPO
  - **live-classification.tsx**: Classificação em tempo real de fornecedores
  - **risk-matrix.tsx**: Visualização da matriz de risco
  - **step-indicator.tsx**: Indicador de progresso para formulários multi-etapa
  - **supplier-risk-assessment.tsx**: Componente principal para avaliação de risco
  - **suppliers-list.tsx**: Lista de fornecedores cadastrados
  - **/ui**: Componentes de UI baseados em shadcn
  
- **/hooks**: Hooks React personalizados
  - **use-auth.tsx**: Gerenciamento de autenticação
  - **use-mobile.tsx**: Detecção de dispositivos móveis
  - **use-toast.ts**: Notificações toast
  
- **/lib**: Utilitários e serviços
  - **adherence-analysis-service.ts**: Serviço para análise de aderência
  - **auth-service.ts**: Serviço de autenticação
  - **database.ts**: Interface com o banco de dados Supabase
  - **document-requirements.ts**: Requisitos de documentação por tipo de fornecedor
  - **document-storage-service.ts**: Gerenciamento de armazenamento de documentos
  - **monitoring-tasks-service.ts**: Serviço de monitoramento de tarefas
  - **risk-assessment-service.ts**: Avaliação de risco de fornecedores
  - **risk-matrix.ts**: Cálculo e visualização da matriz de risco
  - **risk-scoring.ts**: Algoritmo de pontuação de risco
  - **/supabase**: Clientes Supabase para servidor e navegador
  - **/types**: Definições de tipos TypeScript

- **/public**: Arquivos estáticos e imagens
- **/styles**: Estilos globais com Tailwind CSS

## Dependências Instaladas

### Framework e UI
- **Next.js**: v15.3.0 - Framework React com renderização híbrida
- **React**: v19.1.0 - Biblioteca para interfaces de usuário
- **React DOM**: v19.1.0 - Renderização de componentes React no navegador
- **Tailwind CSS**: v3.4.17 - Framework CSS utilitário
- **shadcn/ui**: Componentes de UI baseados em Radix UI
- **Framer Motion**: v12.7.2 - Biblioteca de animações
- **Lucide React**: v0.454.0 - Ícones SVG

### Formulários e Validação
- **React Hook Form**: v7.55.0 - Gerenciamento de formulários
- **Zod**: v3.24.2 - Validação de esquemas
- **@hookform/resolvers**: v3.10.0 - Integração entre React Hook Form e Zod

### Data e Visualização
- **Recharts**: v2.15.0 - Biblioteca de gráficos
- **date-fns**: v4.1.0 - Manipulação de datas
- **React Day Picker**: v8.10.1 - Seletor de datas

### Backend e Armazenamento
- **Supabase JS**: v2.49.4 - Cliente Supabase
- **@supabase/auth-helpers-nextjs**: v0.10.0 - Helpers para Next.js
- **@supabase/ssr**: v0.6.1 - Suporte para Server-Side Rendering
- **uuid**: v11.1.0 - Geração de identificadores únicos

### Utilitários
- **class-variance-authority**: v0.7.1 - Gerenciamento de variantes de componentes
- **clsx**: v2.1.1 - Utilitário para classes condicionais
- **tailwind-merge**: v2.6.0 - Merge de classes Tailwind
- **Papa Parse**: v5.5.2 - Parsing de CSV

## Funcionalidades Detalhadas

### 1. Sistema de Upload de Documentos

O sistema de upload de documentos é implementado no componente `document-upload.tsx` e usa o serviço `document-storage-service.ts` para gerenciar o armazenamento no Supabase. O fluxo funciona da seguinte forma:

1. O usuário seleciona um tipo de documento e arquivo no componente `DocumentUpload`
2. O arquivo é enviado para o Supabase Storage através do serviço `DocumentService`
3. O arquivo é armazenado em uma estrutura de pastas organizada por usuário e fornecedor
4. Os metadados do documento são salvos no banco de dados para referência futura

**Principais características:**
- Validação de tamanho (máximo 10MB)
- Organização por fornecedor
- Estrutura segura com permissões baseadas em usuário
- Suporte para marcação de documentos não fornecidos
- Interface visual para acompanhamento de progresso

### 2. Avaliação de Risco de Fornecedores

O processo de avaliação de risco é implementado no componente `supplier-risk-assessment.tsx` e utiliza o serviço `risk-assessment-service.ts` para calcular o risco baseado em múltiplos critérios.

**Fluxo de avaliação:**
1. Coleta de dados básicos do fornecedor
2. Preenchimento de questionário de avaliação
3. Upload de documentos necessários
4. Cálculo de pontuação de risco
5. Classificação na matriz de risco
6. Geração de recomendações

**Matriz de Risco:**
- Eixo X: Probabilidade (1-5)
- Eixo Y: Impacto (1-5)
- Classificação: Baixo, Médio, Alto, Crítico

### 3. Sistema de Autenticação

A autenticação é implementada usando Supabase Auth e protegida por middleware Next.js:

1. `middleware.ts`: Verifica sessões e redireciona usuários não autenticados
2. `use-auth.tsx`: Hook para gerenciar estado de autenticação no cliente
3. `auth-service.ts`: Funções auxiliares para login, logout e verificação de sessão

**Fluxos suportados:**
- Login com email/senha
- Verificação de email
- Recuperação de senha
- Controle de acesso baseado em função (Role-Based Access Control)

### 4. Monitoramento e Análise

O sistema inclui funcionalidades para monitoramento contínuo e análise de aderência:

1. `monitoring-tasks-service.ts`: Gerencia tarefas de monitoramento para fornecedores
2. `adherence-analysis-service.ts`: Avalia a aderência a requisitos regulatórios
3. `components/tasks-list.tsx`: Interface para visualização e gerenciamento de tarefas

**Tipos de monitoramento:**
- Vencimento de documentos
- Atualizações contratuais
- Verificações periódicas de conformidade
- Auditorias programadas

## Ajustes e Correções Realizadas

### Correção de Variáveis Duplicadas
O erro de build foi corrigido no arquivo `document-storage-service.ts`, onde havia uma declaração duplicada da variável `{data, error}`. A segunda instância foi renomeada para `{data: userData, error: userError}`.

### Otimizações de Build
Foram realizados ajustes para garantir que o processo de build funcione corretamente:
- Correção de erros de compilação
- Configuração de scripts no package.json
- Verificação de dependências

## Considerações para Deploy

### Requisitos de Ambiente
- Node.js v18+ (recomendado v20+)
- Supabase Project configurado com:
  - Authentication ativado
  - Storage com bucket `supplier-documents`
  - Database com tabelas e RLS configurado

### Variáveis de Ambiente Necessárias
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anônima
SUPABASE_SERVICE_ROLE_KEY=chave-de-serviço (opcional, para operações admin)
```

### Comandos para Deploy
```bash
# Instalar dependências
pnpm install

# Build do projeto
./node_modules/.bin/next build

# Iniciar em modo produção
./node_modules/.bin/next start
```

### Procedimentos de Verificação Pós-Deploy
1. Testar autenticação
2. Verificar upload de documentos
3. Confirmar funcionamento da avaliação de risco
4. Validar permissões de acesso baseadas em função