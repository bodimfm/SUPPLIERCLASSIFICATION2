# Plano de Melhorias – *SupplierClassification2*

> Última atualização: 2025-04-16 21:48

Este documento consolida todas as recomendações de UI/UX, código e processo para que a equipe de desenvolvimento implemente as melhorias necessárias na aplicação **SupplierClassification2**.

---

## Visão Geral

A aplicação utiliza **Next.js 14** (App Router) com **TypeScript**, **Tailwind** e **shadcn/ui**; autenticação, dados e storage ficam no **Supabase**. Foram identificados três áreas críticas:

1. **Ruído de repositório**: arquivos duplicados e artefatos desnecessários.
2. **Fluxos de UI/UX inacabados**: ausência de salvamento de rascunho, acessibilidade limitada e feedback de erro fraco.
3. **Inconsistências de naming e serviços**: referências antigas a “SharePoint” mesmo após migração total para Supabase.

O roadmap abaixo detalha cada melhoria.

---

## 1 | Limpeza de Repositório

| Passo | Ação | Comando sugerido |
|-------|------|------------------|
| 1.1 | Remover arquivos duplicados (`* 2.*`) e `.DS_Store` | `git ls-files | grep ' 2\.' | xargs git rm` |
| 1.2 | Atualizar `.gitignore` para ignorar *macOS* artefacts e imagens placeholder | Acrescentar `*.DS_Store`, `public/placeholder*` |
| 1.3 | Verificar que apenas **um** `package.json`, `next.config.mjs`, `tsconfig.json` permaneçam no *root* |

---

## 2 | UI & UX

| Nº | Melhoria | Arquivo(s) | Detalhe de implementação |
|----|----------|------------|--------------------------|
| 2.1 | Salvamento automático de rascunho | `components/supplier-risk-assessment.tsx` | Migrar formulário para **react‑hook‑form + zod**; persistir em `suppliers_drafts` no Supabase a cada `debounce(800 ms)`. |
| 2.2 | Barra de progresso correta | `components/step-indicator.tsx` | Calcular `total = displaySteps.length` e exibir *check* animado (`CheckCircle`) nos passos concluídos. |
| 2.3 | Mensagens de erro inline + acessibilidade | `screening-form.tsx`, `document-upload.tsx` | Mostrar `errors[field]` logo abaixo do input, usar `aria-invalid` e `aria-describedby`. |
| 2.4 | Revisão de paleta/hierarquia | `globals.css`, `tailwind.config.ts` | Implementar escala Radix Colors (11‑step), reduzir sombras de cards. |
| 2.5 | Responsividade dashboard | `app/dashboard/page.tsx` | Quebrar arquivo em subcomponentes + `dynamic import` (`ssr:false`); usar **react‑virtualized** para listas. |
| 2.6 | Upload de arquivos UX | `document-upload.tsx` | Barra de progresso real, limite 10 MB, extensões restritas; renomear funções de *SharePoint* para *Storage*. |
| 2.7 | Passo “Revisar & Enviar” | Novo `components/review-step.tsx` | Mostrar resumo de dados + risco calculado antes de enviar ao DPO. |

---

## 3 | Código & Arquitetura

| Nº | Problema | Ação | Prioridade |
|----|----------|------|-----------|
| 3.1 | Variáveis de ambiente obrigatórias sem validação | Utilizar `invariant()` ou `zod` no bootstrap para lançar erro se faltar env | 🚩 Alta |
| 3.2 | Arquivos `.js` em `lib/` com `allowJs:true` | Migrar para `.ts` ou mover para `/legacy`; habilitar lint `"no-explicit-any": "error"` | Média |
| 3.3 | Naming inconsistente “SharePoint” | Buscar & substituir por “Supabase Storage” em *toda* code‑base | Alta |
| 3.4 | Buckets Supabase sem RLS | Implementar RLS: somente usuário autenticado pode ler seus próprios documentos | Alta |
| 3.5 | Ausência de testes | Configurar **Vitest + Testing Library** (mín. `risk-matrix.test.ts`, `screening-form.test.tsx`) | Média |

---

## 4 | Qualidade e DevOps

1. **CI – GitHub Actions**

   ```yaml
   name: CI

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
         - run: pnpm install --frozen-lockfile
         - run: pnpm lint
         - run: pnpm test --coverage
         - run: pnpm build
   ```

2. **Preview automático**  
   – Configurar deploy de *preview* no **Vercel** para cada PR.

3. **Storybook + Chromatic**  
   – Documentar componentes shadcn/ui e gerar testes visuais.

---

## 5 | Correções rápidas de bug

| Arquivo | Linha/problema | Correção |
|---------|----------------|----------|
| `components/step-indicator.tsx` | Progresso 100 % antes do fim | Usar `displaySteps.length` |
| `components/document-upload.tsx` | Tipo `sharePointUrl` legado | Renomear para `storageUrl` |
| `lib/risk-matrix.ts` | String “Fornecedor Bá…” truncada | Completar descrição e adicionar teste unitário |
| `app/dashboard/page.tsx` | 17 kB de JSX causa *hydrate* lento | Refatorar em subcomponentes + *lazy* |

---

## 6 | Checklist do Próximo Commit

- [ ] Executar **Limpeza de Repositório** (Seção 1)  
- [ ] Renomear todas referências a SharePoint (3.3)  
- [ ] Implementar salvamento automático de rascunho (2.1)  
- [ ] Ajustar barra de progresso (2.2)  
- [ ] Criar `ReviewStep` (2.7)  
- [ ] Adicionar pipeline CI básico (Seção 4.1)  
- [ ] Empurrar para branch `feature/ui-ux-improvements` e abrir PR

> Depois de mergear, programe uma sprint para as melhorias de teste e Storybook.

---

**Contato do revisor:**  
Rafael Maciel • *DPO & Privacy Tech* – <rafael@rafaelmaciel.com.br>

