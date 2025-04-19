# Estrutura da Tabela Suppliers

## Descrição
A tabela `suppliers` armazena informações sobre os fornecedores cadastrados no sistema. Cada fornecedor tem um identificador único gerado automaticamente pelo Supabase.

## Estrutura da Tabela

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-----------|------------|
| id | uuid | Identificador único do fornecedor | PRIMARY KEY, gerado automaticamente |
| name | text | Nome do fornecedor | NOT NULL |
| cnpj | text | CNPJ do fornecedor | UNIQUE |
| email | text | Email de contato do fornecedor | |
| phone | text | Telefone de contato | |
| address | text | Endereço do fornecedor | |
| city | text | Cidade | |
| state | text | Estado | |
| zip_code | text | CEP | |
| contact_name | text | Nome do contato principal | |
| description | text | Descrição ou observações sobre o fornecedor | |
| created_at | timestamp with time zone | Data de criação do registro | DEFAULT now() |
| updated_at | timestamp with time zone | Data da última atualização | |
| status | text | Status do fornecedor (ativo, inativo, etc.) | |
| category | text | Categoria do fornecedor | |
| risk_level | text | Nível de risco associado ao fornecedor | |

## Relacionamentos

A tabela `suppliers` é referenciada por outras tabelas no sistema:

1. **assessments** - Cada avaliação (assessment) está vinculada a um fornecedor através do campo `supplier_id` que referencia `suppliers(id)`.

## SQL para Criação da Tabela

```sql
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    contact_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,
    status TEXT,
    category TEXT,
    risk_level TEXT
);
```

## Importante para Vinculação com Avaliações

Ao criar uma avaliação (assessment) que faz referência a um fornecedor, é necessário utilizar o campo `id` da tabela `suppliers` como valor para o campo `supplier_id` na tabela `assessments`. 

O campo `id` é do tipo UUID e é gerado automaticamente pelo Supabase quando um novo fornecedor é inserido na tabela. Para referenciá-lo corretamente, você deve:

1. Primeiro obter o ID do fornecedor através de uma consulta:
   ```javascript
   const { data: supplier, error } = await supabase
     .from('suppliers')
     .select('id')
     .eq('name', 'Nome do Fornecedor')
     .single();
   
   const supplierId = supplier.id;
   ```

2. Em seguida, usar esse ID ao criar uma nova avaliação:
   ```javascript
   const { data, error } = await supabase
     .from('assessments')
     .insert([
       { 
         supplier_id: supplierId,
         // outros campos da avaliação
       }
     ])
     .select();
   ```

Este processo garante que a avaliação esteja corretamente vinculada ao fornecedor específico no banco de dados.