# Limpeza de Arquivos Duplicados

Este documento contém orientações para limpar os arquivos duplicados do projeto e garantir uma organização adequada.

## Problema

O projeto contém diversos arquivos duplicados com o sufixo " 2" no nome. Esses arquivos são cópias idênticas dos originais e estão causando confusão e possíveis erros.

## Arquivos a serem removidos

Você pode remover manualmente os seguintes arquivos duplicados:

```bash
# Configurações duplicadas
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/components 2.json"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/next.config 2.mjs"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/package 2.json"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/pnpm-lock 2.yaml"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/postcss.config 2.mjs"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/tsconfig 2.json"

# Componentes duplicados
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/components/theme-provider 2.tsx"

# Hooks duplicados
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/hooks/use-mobile 2.tsx"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/hooks/use-toast 2.ts"

# Utilitários duplicados
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/lib/utils 2.ts"

# Assets duplicados
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/public/placeholder 2.jpg"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/public/placeholder 2.svg"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/public/placeholder-logo 2.png"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/public/placeholder-logo 2.svg"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/public/placeholder-user 2.jpg"
rm "/Users/rafaelmaciel/Documents/GitHub/SUPPLIERCLASSIFICATION2/styles/globals 2.css"
```

## Verificação após remoção

Após remover os arquivos duplicados, verifique se a aplicação continua funcionando corretamente executando:

```bash
npm run dev
```

## Recomendações para evitar duplicações

1. **Use controle de versão adequadamente**: Utilize Git para gerenciar alterações ao invés de criar cópias de arquivos.

2. **Padronize suas importações**: Sempre use os caminhos corretos para importações, por exemplo:
   ```typescript
   // Correto
   import { useIsMobile } from "@/hooks/use-mobile";
   import { cn } from "@/lib/utils";
   import { ThemeProvider } from "@/components/theme-provider";
   ```

3. **Nomeie os arquivos adequadamente**: Evite adicionar sufixos como "2" ou "copy" nos nomes dos arquivos.

4. **Limpe regularmente**: Faça limpezas periódicas no projeto para remover arquivos não utilizados.

## Normalização de imports

Após a limpeza, certifique-se que todos os arquivos estão importando os hooks corretos:

1. Verifique se todos os componentes que usam `useMobile` (nome incorreto) foram alterados para usar `useIsMobile` (nome correto):

```typescript
// Incorreto
import { useMobile } from "@/hooks/use-mobile";
const isMobile = useMobile();

// Correto
import { useIsMobile } from "@/hooks/use-mobile";
const isMobile = useIsMobile();
```

Isso garantirá que não haja mais erros de importação no projeto.