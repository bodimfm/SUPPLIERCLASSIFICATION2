# Sistema de Classificação de Fornecedores - Documentação Técnica

## Visão Geral

Este sistema foi desenvolvido para gerenciar a classificação de fornecedores, avaliação de riscos e armazenamento de documentos. Utiliza Next.js 15.3.0 como framework principal, integrado com Supabase para autenticação e armazenamento.

## Estrutura do Projeto

### Diretórios Principais

- `/app`: Contém as páginas e rotas da aplicação (Next.js App Router)
  - `/api`: Endpoints da API
  - `/auth`: Rotas de autenticação
  - `/dashboard`: Página principal do painel administrativo
  - `/login`: Página de login
- `/components`: Componentes React reutilizáveis
  - `/ui`: Componentes básicos de UI (baseados em shadcn/ui)
- `/hooks`: Hooks React personalizados
- `/lib`: Utilitários, serviços e funções auxiliares
  - `/supabase`: Configuração e clientes do Supabase
  - `/types`: Definições de tipos TypeScript
- `/public`: Arquivos estáticos
- `/styles`: Estilos globais

## Dependências Principais

### Frameworks e Biblioteca de UI
- **Next.js**: Framework React para aplicações web (v15.3.0)
- **React**: Biblioteca para construção de interfaces (v19.1.0)
- **Tailwind CSS**: Framework de CSS utilitário (v3.4.17)
- **shadcn/ui**: Componentes de UI baseados em Radix UI
- **Framer Motion**: Para animações fluidas

### Gerenciamento de Estado e Formulários
- **react-hook-form**: Para gerenciamento de formulários (v7.55.0)
- **zod**: Para validação de esquemas (v3.24.2)

### Armazenamento e Backend
- **Supabase**: Para autenticação, banco de dados e armazenamento
  - @supabase/supabase-js: Cliente JavaScript (v2.49.4)
  - @supabase/auth-helpers-nextjs: Helpers para integração com Next.js

### Utilitários
- **uuid**: Geração de identificadores únicos (v11.1.0)
- **date-fns**: Manipulação de datas (v4.1.0)
- **recharts**: Biblioteca de gráficos (v2.15.0)

## Funcionalidades Principais

### Autenticação (auth/)
- Integração com Supabase para autenticação de usuários
- Middleware para proteção de rotas
- Hook personalizado (useAuth) para gerenciamento de sessão

### Avaliação de Fornecedores
- Formulário completo para cadastro de fornecedores
- Avaliação de risco baseada em múltiplos critérios
- Matriz de risco com visualização gráfica
- Serviço de pontuação de risco (risk-scoring.ts)

### Upload e Gerenciamento de Documentos
- Upload de documentos para o Supabase Storage
- Organização de arquivos por fornecedor
- Verificação de documentos obrigatórios
- Suporte para diferentes tipos de documentos

### Monitoramento
- Sistema para criação e acompanhamento de tarefas
- Análise de aderência a requisitos
- Geração de resultados e relatórios

## Arquivos Chave

### Configuração e Conexão
- `lib/supabase-client.ts`: Cliente principal para conexão com Supabase
- `lib/supabase/server.ts`: Cliente Supabase para contexto de servidor
- `lib/supabase/client.ts`: Cliente Supabase para contexto de navegador
- `middleware.ts`: Middleware para autenticação e proteção de rotas

### Serviços
- `lib/document-storage-service.ts`: Gerencia uploads e armazenamento de documentos
- `lib/risk-assessment-service.ts`: Avaliação de risco de fornecedores
- `lib/monitoring-tasks-service.ts`: Gerenciamento de tarefas de monitoramento
- `lib/adherence-analysis-service.ts`: Análise de aderência a requisitos

### Componentes Principais
- `components/supplier-risk-assessment.tsx`: Formulário principal de avaliação
- `components/document-upload.tsx`: Componente para upload de documentos
- `components/risk-matrix.tsx`: Visualização da matriz de risco
- `components/suppliers-list.tsx`: Lista de fornecedores cadastrados

## Fluxo de Dados

1. **Autenticação de Usuário**:
   - Login via Supabase Auth
   - Proteção de rotas via middleware

2. **Cadastro de Fornecedor**:
   - Coleta de informações no formulário multietapa
   - Avaliação de risco automática
   - Classificação na matriz de risco

3. **Upload de Documentos**:
   - Seleção de documentos pelo usuário
   - Upload para Supabase Storage
   - Organização por fornecedor
   - Verificação de documentos obrigatórios

4. **Monitoramento**:
   - Criação de tarefas para acompanhamento
   - Análise de aderência 
   - Geração de alertas e notificações

## Notas para Deploy

- Requer Node.js v18+ e pnpm
- Comandos principais:
  - `pnpm install`: Instala dependências
  - `node_modules/.bin/next build`: Gera build de produção
  - `node_modules/.bin/next start`: Inicia servidor em modo produção
- Variáveis de ambiente necessárias:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
  - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (para operações admin)

## Considerações Técnicas

- O sistema utiliza arquitetura client-side e server-side para otimização de performance
- Implementa controle de acesso baseado em funções (RLS do Supabase)
- O armazenamento de documentos é organizado com políticas de segurança
- A avaliação de risco segue metodologias estabelecidas de análise de risco de fornecedores

## Segurança e Controle de Acesso

O sistema implementa segurança de várias camadas:

1. **Autenticação via Supabase Auth**
   - Login seguro com email/senha
   - Suporte a autenticação multifator

2. **Controle de Acesso Baseado em Funções (RBAC)**
   - **Cliente**: Pode criar fornecedores e ver apenas seus próprios dados
   - **Membro DPO**: Pode ver e editar todos os fornecedores e documentos
   - **Admin**: Acesso completo a todas as funcionalidades

3. **Row Level Security (RLS)**
   - Controle de acesso por linha no banco de dados
   - Segmentação de fornecedores por usuário criador
   - Segmentação de arquivos por usuário/cliente

4. **Storage Seguro**
   - Documentos armazenados no Supabase Storage
   - Cada usuário tem seu próprio diretório isolado
   - Controle de acesso granular por arquivo