# Documentação Técnica – Nova Interface de Triagem de Fornecedores

## Objetivo e Visão Geral do Novo Fluxo UX

A nova interface de triagem de fornecedores tem como objetivo modernizar e simplificar o processo de classificação de risco de fornecedores, proporcionando uma experiência de usuário mais **fluida e interativa**. Inspirada no fluxo *AIReadinessFact*, a proposta é apresentar **uma pergunta por tela**, com animações, ajuda contextual e validações em tempo real, guiando o usuário passo a passo.

* **Uma pergunta por vez** com transições suaves.
* **Ajuda contextual** via ícones de ajuda e descrições.
* **Validação em tempo real** impedindo erros de envio.
* **Animações** com Framer Motion para feedback visual.
* **Microinterações** (auto‑avanço em escolhas, confirmação final animada).

Em resumo, o novo fluxo se comporta como um *wizard* interativo que conduz o usuário, mas mantém a lógica de negócio de classificação de risco intacta.

## Arquitetura da Aplicação

A aplicação continua baseada em **Next.js 13+ (App Router)** com **TypeScript** e integração ao **Supabase**. Os componentes principais ficam em `src/components/supplier-screening` e incluem:

* `Questionnaire.tsx` – controla estado e navegação entre perguntas.
* `QuestionStep.tsx` – renderiza uma única pergunta/tipo de campo.
* Componentes de ajuda contextual, indicadores de progresso e toasts.

A persistência usa o cliente Supabase. Dados são inseridos via funções utilitárias como `createSupplier` e `createAssessment`. Uploads de arquivo utilizam rotas API que interagem com o storage Supabase.

## Fluxo de Perguntas

1. **Nome do Fornecedor** (obrigatório)
2. **CNPJ do Fornecedor** (opcional, validado se informado)
3. **Responsável Interno** (obrigatório)
4. **Descrição do Serviço** (textarea, obrigatório)
5. **Volume de Dados Envolvidos** (seleção)
6. **Sensibilidade dos Dados** (seleção com alerta se "sensíveis")
7. **Tipo de Contrato** (pontual/continuado)
8. **Fornecedor de TI/SaaS** (checkbox)
9. **Upload de Documentos** (opcional, com feedback de progresso)
10. **Análise Prévia** (exibe classificação preliminar)
11. **Submissão da Triagem** (grava dados e exibe confirmação)

O fluxo é linear, mas exibe avisos contextuais conforme as respostas.

## Validações

Usaremos **React Hook Form** com **Zod** para validar campos obrigatórios e formatos (CNPJ, tamanho mínimo de texto, etc.). Cada pergunta é validada ao avançar. Erros aparecem abaixo do campo e em toast, impedindo o progresso.

## Animações e Microinterações

Framer Motion anima as transições entre perguntas (fade/slide). Perguntas de escolha única avançam automaticamente após seleção. Indicadores de progresso e alertas são animados. Durante uploads ou submissão exibimos spinners e mensagens de sucesso/erro.

## Tratamento de Erros

Erros de validação impedem avanço. Se falhar ao gravar no Supabase ou fazer upload, mostramos banner de erro e permitimos tentar novamente. O upload mal‑sucedido não bloqueia o cadastro – apenas exibimos aviso.

## Regras de Classificação

Mantemos as funções existentes, como `calculateSupplierType`, para determinar o tipo de fornecedor (A/B/C/D) e nível de risco. A nova interface apenas coleta as respostas de forma mais amigável.

## Responsividade e Acessibilidade

O layout é mobile‑first, ajustando‐se a diversos tamanhos de tela via Tailwind. Os campos têm rótulos associados e suporte a navegação por teclado. Preferências de movimento reduzido são respeitadas e o contraste de cores segue as diretrizes WCAG.

## Exemplo de Componente com Auto‑avanço

```tsx
interface MultiChoiceProps {
  question: string;
  options: { value: string; label: string }[];
  onAnswer: (value: string) => void;
}

export function MultiChoiceQuestion({ question, options, onAnswer }: MultiChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    onAnswer(value); // grava e avança
  };

  return (
    <div>
      <h3>{question}</h3>
      {options.map((opt) => (
        <label key={opt.value} className={selected === opt.value ? "bg-blue-100" : ""}>
          <input
            type="radio"
            className="sr-only"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => handleSelect(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
```

Esse componente ilustra como avançar automaticamente ao escolher uma opção.

## Conclusão

Seguindo essas diretrizes, o time conseguirá implementar a nova interface sem alterar as regras de negócio. O formulário em estilo wizard coleta uma pergunta por tela, valida em tempo real e anima as transições, mantendo integridade dos dados e boa experiência para o usuário.

