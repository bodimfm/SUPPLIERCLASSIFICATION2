# Documentação Técnica – Nova Interface de Triagem de Fornecedores

## Objetivo e Visão Geral do Novo Fluxo UX

A nova interface de triagem de fornecedores tem como objetivo modernizar e simplificar o processo de classificação de risco de fornecedores, proporcionando uma experiência de usuário mais **fluida e interativa**. Inspirada no fluxo *AIReadinessFact* (um modelo de questionário dinâmico), a proposta é apresentar **uma pergunta por tela**, acompanhada de animações suaves, ajuda contextual e validações em tempo real. Com essa abordagem, espera-se que o usuário foque em cada pergunta individualmente, reduzindo a sobrecarga cognitiva e minimizando erros de preenchimento.

Em resumo, o novo fluxo UX traz as seguintes melhorias:

* **Uma pergunta por vez:** Cada etapa da triagem exibe somente uma pergunta/campo, guiando o usuário passo a passo no questionário, semelhante ao estilo de formulários do Typeform ou assistentes interativos.
* **Ajuda contextual:** Ícones de ajuda e descrições complementares são fornecidos junto a cada pergunta, oferecendo esclarecimentos instantâneos sobre o que é solicitado (por exemplo, explicando formatos esperados ou conceitos específicos). Isso garante que o usuário tenha suporte durante o preenchimento sem precisar sair da tela.
* **Validação em tempo real:** À medida que o usuário insere as respostas, o sistema valida os dados instantaneamente. Campos obrigatórios não preenchidos ou formatos incorretos são sinalizados de imediato, evitando a submissão de informações incompletas ou inválidas. Por exemplo, se um campo obrigatório ficar em branco, uma mensagem de erro é exibida antes mesmo do envio.
* **Animações suaves:** Transições animadas entre perguntas e feedback visual (como indicadores de progresso) tornam a interação mais agradável e fornecem *feedback* claro. A troca de uma pergunta para a próxima ocorre com animações de fade/slide usando Framer Motion, o que confere fluidez e indica ao usuário que a navegação ocorreu.
* **Microinterações de feedback:** Pequenas animações ou destaques ocorrem em resposta às ações do usuário. Por exemplo, ao selecionar uma resposta em uma pergunta de múltipla escolha, o sistema pode avançar automaticamente para a próxima questão, exibindo uma breve indicação de progresso. Da mesma forma, ao finalizar a triagem, uma tela de sucesso animada com ícones apropriados confirma a conclusão.

Em suma, a visão geral é transformar a triagem de fornecedores em um **wizard** interativo, no qual o usuário é conduzido passo a passo, com suporte e feedback contínuos. Isso melhora a usabilidade para os responsáveis internos pela triagem, garantindo que as informações coletadas estejam corretas e completas, sem alterar a lógica de negócio subjacente da classificação de risco.

## Arquitetura da Aplicação

A implementação será realizada dentro do projeto **SupplierClassification2**, seguindo a arquitetura modular em React/Next.js. O front-end utiliza **Next.js 13+ (App Router)** e **TypeScript**, com integração ao **Supabase** para persistência de dados e autenticação. A estrutura de pastas está organizada de forma a separar componentes reutilizáveis, formulários e serviços de negócio. Por exemplo, podemos ter algo como:

```bash
src/
├── app/                      # Páginas Next.js (App Router)
│   └── suppliers/
│       └── new/              # Página de início da triagem (nova interface)
├── components/
│   ├── supplier-screening/   # Componentes específicos da triagem de fornecedores
│   │   ├── Questionnaire.tsx # Componente principal do questionário (wizard)
│   │   ├── QuestionStep.tsx  # Componente para uma pergunta (genérico ou específicos por tipo)
│   │   ├── ... outros componentes UI da triagem ...
│   └── ui/                   # Componentes de interface genéricos (ex: botão, tooltip, etc.)
├── lib/
│   ├── supabase.ts           # Inicialização do cliente Supabase
│   ├── risk-assessment.ts    # Funções de classificação de risco (calculateSupplierType etc.)
│   └── ...                  # Outros utilitários e serviços
└── hooks/                    # Hooks reutilizáveis (ex: useToast, useMobile)
```

No front-end, o componente principal da nova interface será um **Wizard/Questionnaire** que controla o estado e fluxo das perguntas. Este componente poderá ser dividido em subcomponentes menores para cada etapa ou tipo de campo:

* **Questionnaire/Wizard Component:** componente de alto nível que mantém o estado do formulário completo (todas as respostas coletadas) e qual é a pergunta atual sendo exibida. Ele orquestra a navegação entre perguntas, controla o progresso e aciona a validação e submissão final.
* **QuestionStep Component:** componente responsável por renderizar uma única pergunta (campo) e coletar sua resposta. Pode ser um componente genérico parametrizado pelo tipo de pergunta, ou conjuntos de componentes especializados (por exemplo, `<TextQuestion>`, `<SelectQuestion>`, `<FileUploadQuestion>` etc.), dependendo das necessidades.
* **Contextual Help Subcomponents:** para implementar a ajuda contextual, pode-se ter um componente de tooltip/popover ou utilizar diretamente ícones com textos auxiliares. No código existente, por exemplo, cada campo inclui um ícone de ajuda (`<HelpCircle>` do Lucide) com texto explicativo associado via `aria-describedby`. Podemos aprimorar isso encapsulando essa lógica em um componente `<FieldHelp>` que ao ser clicado ou focado exiba uma breve descrição da pergunta.
* **Animated Progress/Step Indicator:** um componente que indica visualmente o progresso do usuário através das etapas. No fluxo atual, há tanto uma barra de progresso percentual quanto indicadores de etapa com números e checkmarks. Esse componente atualiza seu estado conforme o usuário responde perguntas, marcando etapas concluídas (por exemplo, usando um ícone de check) e destacando a etapa corrente.
* **Toast/Notifications:** aproveitaremos o hook de toast já existente (`useToast`) para feedback rápido de ações (ex: erro ao enviar, sucesso). Mensagens de sucesso/erro breves aparecerão no canto da tela para confirmar ações do usuário, complementando os feedbacks inline.

No **back-end**, usaremos o Supabase tanto para o banco de dados quanto para o armazenamento de arquivos. A integração se dará de duas formas:

* **Inserção de dados via Supabase client:** Ao final da triagem (ou em pontos intermediários, conforme necessário), as informações do fornecedor e da avaliação inicial serão enviadas ao banco de dados do Supabase. Podemos utilizar o cliente JS do Supabase diretamente no front-end com a chave anônima (respeitando regras de Row Level Security) para inserir os registros, ou chamar *Server Actions* / rotas API Next.js que usem a chave de serviço para operações privilegiadas. No código atual, por exemplo, as funções `createSupplier` e `createAssessment` são utilizadas para inserir no Supabase os dados do fornecedor e da avaliação. Essas funções abstraem chamadas como `supabase.from('suppliers').insert(...)` e tratam o retorno (id gerado etc.).
* **Upload de arquivos via Storage:** Caso seja necessário anexar documentos (por exemplo, um contrato ou questionário preenchido pelo fornecedor), o upload será feito para o storage do Supabase. Para isso, podemos usar uma rota API dedicada (por exemplo, `/api/documents`) que receba o arquivo do formulário e utilize a SDK do Supabase (com chave de serviço) para armazená-lo de forma segura. No fluxo existente, o componente de triagem chama uma rota `/api/documents` via `fetch` para envio do arquivo, passando também metadados como `supplierId` e `assessmentId`. A rota API, por sua vez, realiza o `supabase.storage.from('supplier-documents').upload(...)` e retorna um status de sucesso ou erro. O front-end então atualiza o estado de upload, exibindo mensagens de progresso/sucesso/erro conforme o caso.

**Estado do formulário:** Durante a navegação pelas perguntas, as respostas serão armazenadas em um estado central (por exemplo, usando um hook `useState` ou a API do React Hook Form). Dado que o Next.js App Router incentiva componentes sem estado no servidor e componentes client para interatividade, o componente Questionnaire será marcado como `"use client"` para gerenciar este estado de forma dinâmica. Alternativamente, pode-se usar um contexto para compartilhar os dados entre passos ou mesmo persistir parcialmente as respostas (draft) no Supabase conforme o usuário avança de etapa (auto-save). No código atual, as respostas ficam em um estado local `formData` e há uma funcionalidade de "save notification" sugerindo salvamento automático periódico ou em eventos-chave. Se for necessário auto-salvar, implementaríamos uma lógica que, a cada resposta respondida ou intervalo de tempo, enviasse os dados parciais para o Supabase (tabela de draft/assessment com status "draft"). Por enquanto, assumiremos que o salvamento ocorre apenas ao final da triagem inicial (submit final), mas essa extensão de auto-save está preparada caso seja requisitada.

## Fluxo de Perguntas e Etapas do Questionário

O questionário de triagem seguirá uma **sequência linear** de perguntas, apresentando uma por tela, na seguinte ordem lógica:

1. **Nome do Fornecedor:** *(Texto curto, obrigatório)* – Pergunta para o usuário fornecer o nome completo ou razão social do fornecedor. Essa é a primeira informação básica identificadora. Exemplo de implementação: um campo de texto simples com placeholder "Digite o nome do fornecedor". Este campo é marcado como obrigatório (indicador "*" e atributo `required`) e possui um ícone de ajuda que explica que deve ser o nome completo da empresa.
2. **CNPJ do Fornecedor:** *(Texto curto, opcional)* – Pergunta para inserir o CNPJ (Cadastro Nacional de Pessoa Jurídica) do fornecedor, caso aplicável. Embora seja recomendável preencher para identificação, pode ser deixado em branco se o fornecedor não possuir CNPJ (por exemplo, fornecedores estrangeiros ou pessoas físicas, conforme as regras do negócio). Se preenchido, o sistema deve validar o formato (`##.###.###/####-##`). Podemos implementar uma máscara ou validação de formato para garantir a entrada correta. O campo não é marcado como obrigatório no código atual, mas fornece placeholder no formato esperado. Também inclui ajuda contextual indicando o formato esperado do CNPJ.
3. **Responsável Interno pela Triagem:** *(Texto curto, obrigatório)* – Pergunta o nome do colaborador interno responsável por conduzir a triagem do fornecedor. Esse nome pode ser usado para registro e acompanhamento (por exemplo, para saber quem submeteu a avaliação). Campo de texto obrigatório, com placeholder "Nome do responsável interno" e ajuda contextual sugerindo que é a pessoa da empresa que está executando a triagem.
4. **Descrição do Serviço/Fornecimento:** *(Texto longo, obrigatório)* – Nesta etapa, o responsável descreve em detalhes o escopo do serviço que será prestado pelo fornecedor. Essa descrição ajuda a contextualizar o tipo de dados e riscos envolvidos. Implementa-se com um `<textarea>` de várias linhas. Validação: não pode estar vazio (obrigatório). Ajuda contextual pode instruir a detalhar o máximo possível o que o fornecedor fará.
5. **Volume de Dados Envolvidos:** *(Seleção, obrigatório)* – Pergunta de múltipla escolha (drop-down ou botões) sobre o **volume de dados pessoais** que o fornecedor terá acesso ou irá tratar. As opções seguem categorias predefinidas, por exemplo:

   * Baixo – menos de 100 indivíduos (titulares de dados)
   * Médio – entre 100 e 1.000 indivíduos
   * Alto – mais de 1.000 indivíduos
   * Massivo – volumes extremamente altos (a opção "massive" estava presente na matriz de risco original, possivelmente > 10.000)

   No formulário atual, isso é um `<select>` com valores `"low", "medium", "high", "massive"` e labels descritivos. Em nossa interface de uma pergunta por tela, podemos optar por exibir essas opções como botões ou radios para melhorar a usabilidade móvel. Essa pergunta é fundamental pois, junto da próxima, alimenta a matriz de classificação de risco.
6. **Sensibilidade dos Dados:** *(Seleção, obrigatório)* – Outra pergunta de múltipla escolha sobre a **sensibilidade dos dados pessoais** envolvidos no serviço. Opções típicas:

   * Não sensíveis – dados comuns, não confidenciais
   * Regulares – dados pessoais não sensíveis (ex.: nome, contato)
   * Sensíveis – dados pessoais sensíveis conforme LGPD (ex.: saúde, biometria, opiniões políticas)

   Implementado também como seleção. Se o usuário selecionar "Sensíveis", o sistema marca um flag interno (`sensitiveFlagged`) e imediatamente exibe um aviso visual na tela enfatizando cuidado adicional. Esse aviso contextual (um destaque em amarelo com ícone de alerta) informa, por exemplo: *"Atenção: O fornecedor terá acesso a dados sensíveis. Uma avaliação mais rigorosa será necessária."* – deixando claro que a classificação de risco resultante será maior. Essa é uma lógica condicional importante no fluxo: **a aparição desse alerta depende da resposta do usuário** (é um *efeito colateral* da seleção "sensível").
7. **Tipo de Contrato:** *(Seleção, obrigatório)* – Pergunta qual é o tipo de contrato ou relacionamento com o fornecedor. Duas categorias foram definidas inicialmente:

   * **Pontual:** contrato de curta duração ou fornecimento único (ex.: um serviço específico com prazo determinado).
   * **Continuado:** contrato de longa duração ou prestação de serviço contínua.

   Essa informação pode influenciar requisitos de documentação ou acompanhamento posterior. No formulário, é um dropdown com opções "Pontual" ou "Continuado". Campo obrigatório.
8. **Fornecedor de TI/SaaS:** *(Checkbox booleano)* – Uma pergunta de *sim/não* que identifica se o fornecedor provê tecnologia ou Software as a Service. Isto é, se o fornecedor terá acesso a sistemas, dados em nuvem, etc., caracterizando-o como um fornecedor de TI. No formulário, isso aparece como um checkbox marcado "Fornecedor de TI/SaaS (Software as a Service)". Caso marcado como **true**, o sistema considerará requisitos adicionais de segurança (por exemplo, políticas de acesso, criptografia, etc.) na etapa de documentação obrigatória. Essa flag também pode ser armazenada no banco (`is_technology`) para gerar relatórios ou filtros.
9. **Upload de Documentos Relevantes:** *(Upload de arquivo, opcional)* – Após coletar os dados acima, o sistema oferece a possibilidade de anexar documentos relevantes para a triagem, como propostas, contratos, questionários preenchidos pelo fornecedor, etc. Essa etapa não é exatamente uma pergunta, mas faz parte do fluxo para complementar informações. A interface exibe uma área de *drag-and-drop* ou um botão "Selecionar Arquivo". O usuário pode escolher um arquivo (PDF, Word, Excel ou ZIP, limite ~10MB). Assim que o arquivo é selecionado, o nome e tamanho aparecem na interface, e se necessário pode-se remover/substituir antes do envio. Ao prosseguir (ou imediatamente ao selecionar, dependendo da implementação), o upload é iniciado: o estado de **uploadStatus** muda para "uploading" e um indicador de progresso é mostrado (por exemplo, um spinner e mensagem "Enviando arquivo..."). Quando completo, uma mensagem de sucesso "Arquivo enviado com sucesso" é exibida. Em caso de falha, uma mensagem de erro em vermelho aparece e o usuário pode tentar novamente. *Nota:* esse passo é opcional – se nenhum arquivo for anexado, não impedirá a conclusão da triagem.
10. **Análise Prévia (Pré-visualização da Classificação):** *(Informativo, dependente de dados preenchidos)* – Antes de submeter definitivamente, a interface pode exibir um resumo **dinâmico** da classificação de risco calculada com base nas respostas fornecidas até aqui. Essa “prévia” permite ao responsável validar as informações e ver qual seria a categoria de risco do fornecedor. Na implementação existente, há um componente `<LiveClassification>` que mostra a classificação preliminar (A, B, C ou D e sua descrição) assim que o nome do fornecedor e descrição do serviço estão preenchidos. Assim, se o usuário já forneceu os campos chave (volume e sensibilidade de dados, etc.), ele poderá ver algo como: *"Classificação preliminar: B (Significativo)"* por exemplo, possivelmente acompanhado de explicações ou requisitos. Caso os campos mínimos não estejam preenchidos, em vez da análise é mostrado um aviso pedindo para completar os campos para visualizar a análise. Essa etapa não requer ação do usuário, é só uma confirmação visual e contextual.
11. **Submissão da Triagem Inicial:** *(Ação final)* – Por fim, o usuário confirma o envio dos dados. Na UI, isso pode ser um botão "Submeter" ou "Enviar para Análise" na última tela do wizard. No protótipo atual, o botão está rotulado como "Submeter para Análise do Escritório", indicando que após o envio, os dados serão encaminhados ao escritório terceirizado (DPO externo) para avaliação completa. Ao clicar em submeter, o sistema realiza as validações finais (assegurando que não falte nenhum campo obrigatório) e então grava os dados no banco (criando o registro do fornecedor e da avaliação inicial). O fluxo de gravação envolve:

    * Calcular o tipo de fornecedor (A/B/C/D) usando as respostas de Volume de Dados e Sensibilidade dos Dados (usando `calculateSupplierType`).
    * Definir o nível de risco (`risk_level`) correspondente ao tipo: por exemplo, A ⇒ crítico, B ⇒ alto, C ⇒ médio, D ⇒ baixo.
    * Salvar o fornecedor na tabela de fornecedores (com campos como nome, cnpj, responsável, tipo calculado, descrição do serviço, etc.) e obter seu `id`.
    * Salvar os detalhes da avaliação inicial na tabela de avaliações (ligando com o `supplier_id` recém-criado, incluindo volume, sensibilidade, tipo, etc.).
    * Associar o arquivo enviado, se houver, ao registro (por exemplo, guardar o caminho no storage ou um ID de documento). *Nota:* no código atual, o arquivo é enviado antes ou durante a criação; no novo fluxo podemos ter feito upload no passo 9 já. De qualquer forma, garantimos que o arquivo esteja vinculado (e.g., gravando `assessment_id` ou `supplier_id` nos metadados do arquivo conforme foi feito via rota API).
    * Marcar o status da avaliação inicial como "pending" ou "submitted" conforme modelagem (no código existente, `supplier.status = "pending"` e `assessment.status = "draft"` ou similar até conclusão pelo DPO).

Após a submissão bem-sucedida, o sistema apresenta uma **tela de confirmação** informando que a triagem inicial foi concluída com sucesso. Essa tela de confirmação (por exemplo, implementada em `SubmissionStatus` component) exibe um resumo dos dados submetidos e próximos passos:

* Mensagem de sucesso com destaque visual (ícone de check verde, texto "Triagem Concluída com Sucesso").
* Detalhes da submissão: data da solicitação, classificação de risco resultante (código e descrição, exibidos com cor correspondente ao nível de risco), nome do responsável interno, prazo estimado para próxima fase (que pode ser calculado conforme o tipo A/B/C/D – tipos críticos demoram mais dias, etc., como visto na função `getEstimatedTimeframe`), e nome do arquivo anexado se houve upload.
* Próximas etapas: uma lista enumerada indicando o que acontecerá em seguida, por exemplo: análise preliminar pelo escritório de DPO, solicitação de documentação adicional (listando quais documentos obrigatórios serão exigidos, com base na classificação e se é fornecedor de TI), avaliação completa e emissão de parecer. Essa lista é construída usando a função `getRequiredDocuments(code, isTechnology)` para filtrar os documentos requeridos para aquele tipo de fornecedor.

Se, por outro lado, o usuário tentar avançar sem preencher um campo obrigatório ou ocorrer algum erro durante o processo, o fluxo poderá impedi-lo de prosseguir até correção (no caso de validações) ou exibir mensagens de erro adequadas (no caso de falha no envio, tratado adiante na seção de erros).

**Lógicas condicionais e ramificações:** No geral, o fluxo é linear para todos os fornecedores, não havendo caminhos alternativos que pulem perguntas – todos respondem às perguntas 1 a 8. O que muda condicionalmente é essencialmente a apresentação de **avisos contextuais** ou informações extras baseadas nas respostas:

* O alerta sobre dados sensíveis aparece somente se a opção "Sensíveis" for escolhida.
* A lista de documentos obrigatórios exibida na confirmação varia conforme a classificação (tipos mais críticos listam mais documentos).
* Caso algum campo crítico não esteja preenchido, a prévia de classificação não é mostrada até que esteja (ex.: não viu a classificação porque não forneceu nome ou descrição).
* Em termos de fluxo de usuários, após a triagem interna ser enviada, as etapas posteriores (análise completa, coleta de documentos) são de responsabilidade de outro usuário (p. ex., um DPO terceirizado). No sistema, isso foi indicado mostrando uma mensagem de acesso restrito a partir do passo seguinte. Ou seja, o **fluxo de triagem interna termina na submissão**, e a continuidade (preencher formulários de avaliação completa, monitoramento etc.) seria realizada por usuários com perfil adequado (fora do escopo deste documento, mas o sistema suporta essas etapas separadamente nos componentes `AssessmentForm`, `ContractForm`, `MonitoringForm` mostrados no código).

Resumindo, o fluxo de perguntas é sequencial e consistente, garantindo que todas as informações relevantes sejam coletadas antes da classificação. A navegação entre as perguntas pode ser automática (no caso de perguntas de escolha simples) ou via um botão "Próximo" (no caso de perguntas abertas, após validação do preenchimento). Em qualquer ponto, o usuário pode voltar à pergunta anterior (um botão "Anterior" estará disponível, exceto na primeira pergunta) para revisar ou corrigir dados.

## Validações e Regras Obrigatórias

A interface implementará validações robustas em cada campo para assegurar a qualidade dos dados coletados. As regras de validação incluem:

* **Campos obrigatórios:** Os campos essenciais para classificação não podem ser deixados em branco. São eles: **Nome do Fornecedor**, **Responsável Interno**, **Descrição do Serviço**, **Volume de Dados**, **Sensibilidade dos Dados** e **Tipo de Contrato** (conforme identificado no código atual). Caso o usuário tente prosseguir sem preencher algum desses, o sistema deve impedir o avanço e exibir uma mensagem de erro clara apontando qual campo falta. Por exemplo, ao não preencher o Nome do Fornecedor e clicar "Próximo", poderia aparecer abaixo do campo ou em toast: "*Campo obrigatório: Nome do fornecedor*". No protótipo atual, essa lógica é realizada verificando cada campo e chamando `toast()` de erro se vazio. Em nossa implementação final, usaremos o **React Hook Form** integrado com um esquema **Zod** para definir essas regras de forma declarativa e realizar a validação automaticamente. Cada pergunta terá em seu schema a propriedade `required()` quando aplicável, e possivelmente uma mensagem de erro customizada.
* **Formato de CNPJ:** Embora o CNPJ não seja obrigatório, se fornecido deve estar no formato válido (14 dígitos com pontuação correta). Podemos aplicar uma máscara no campo para já formatar enquanto o usuário digita (ex.: utilizando uma biblioteca de máscaras ou componente controlado). Além disso, podemos validar o checksum do CNPJ (DV) para evitar números inválidos. Essa validação pode ser implementada via Zod refinements ou uma função utilitária chamada no onBlur do campo. Se o CNPJ for inválido, exibiremos um erro do tipo "*CNPJ inválido, verifique o número.*". No placeholder e tooltip do campo já há indicação do formato esperado.
* **Limites e padrões em outros campos:** Campos de texto como Nome do Fornecedor e Responsável Interno podem ter validações de formato simples – por exemplo, não aceitar strings vazias (já coberto por obrigatório) e possivelmente um tamanho mínimo de caracteres (> 2 caracteres) para evitar entradas muito curtas ou siglas sem sentido. O campo descrição pode ter um tamanho mínimo (por ex.: > 10 caracteres) para garantir que haja alguma explicação útil, e também podemos definir um tamanho máximo (ex.: 1000 caracteres) para evitar textos excessivamente longos. Tais regras seriam definidas no schema Zod (e o React Hook Form exibiria erros se violadas).
* **Validação imediata vs. no envio:** Com a abordagem de *uma pergunta por tela*, a validação tende a ocorrer **por etapa**. Ou seja, ao preencher uma pergunta e tentar avançar, valida-se aquele campo imediatamente. Isso é preferível a esperar até o final para listar múltiplos erros. Portanto, implementaremos a validação no momento em que o usuário sai de um campo ou clica "Próximo". Se o campo está válido, o wizard avança; se não, o usuário é avisado e permanece na pergunta atual. Para perguntas de múltipla escolha com auto-avanço, a seleção de uma opção já fornece a resposta – nesse caso, se a seleção é obrigatória, podemos inicialmente desabilitar o botão "Próximo" até que alguma opção seja escolhida. Contudo, como planejamos avançar automaticamente nessas, a regra é simples: enquanto nenhuma opção for marcada, não acontece nada; ao marcar, automaticamente consideramos válido e vamos em frente.
* **Validações em tempo real (real-time):** Além da validação ao tentar avançar, podemos fornecer *feedback* instantâneo enquanto o usuário digita. Por exemplo:

  * Se o usuário digitar um formato errado de CNPJ (ex.: letras ou dígitos a menos), poderíamos já mostrar um pequeno aviso ao lado do campo antes mesmo de ele sair do foco.
  * Podemos também trocar o estado visual do campo para "erro" (borda vermelha, por exemplo) assim que ele perde o foco sem valor quando obrigatório.
  * No caso de seleção de dados sensíveis, a interface imediatamente exibe o alerta de atenção assim que "Sensíveis" é selecionado, sem esperar o envio. Essa é uma forma de validação contextual: alertamos que essa escolha implica maior rigor no processo.
  * Para o campo de upload, a validação é no ato do envio do arquivo: tipos permitidos e tamanho máximo são checados. Se o usuário tentar anexar um tipo não suportado ou um arquivo maior que 10MB, por exemplo, o sistema recusará o arquivo e mostrará uma mensagem "*Formato de arquivo não suportado ou tamanho excede o limite.*".
* **Regras de dependência entre campos:** No questionário em si, poucas perguntas têm dependência direta. Uma possível regra é: *se* "Fornecedor de TI/SaaS" = Sim, então possivelmente exigir algum detalhe a mais ou documento a mais posteriormente. No contexto do formulário inicial, isso não muda as perguntas obrigatórias, apenas será usado depois para determinar documentos adicionais. Portanto, não há "skips" de perguntas baseados nisso na triagem inicial – todas as perguntas 1-8 sempre aparecem. Caso futuramente alguma lógica condicional seja adicionada (por exemplo, só perguntar algo específico se um campo X tiver determinado valor), isso deve vir acompanhado das validações correspondentes (campo condicional obrigatório apenas se a condição for verdadeira, etc.).

**Implementação das validações:** Conforme mencionado, a intenção é utilizar **React Hook Form** para gerenciar o formulário e **Zod** para o schema de validação. Assim, cada campo terá um registro no RHF (`{ register, formState: { errors } }`) e no schema Zod definiremos algo como:

```ts
import { z } from 'zod';

const TriagemSchema = z.object({
  supplierName: z.string().nonempty("Nome do fornecedor é obrigatório"),
  cnpj: z.string().optional().regex(CNPJ_REGEX, "Formato de CNPJ inválido"),
  internalResponsible: z.string().nonempty("Responsável interno é obrigatório"),
  serviceDescription: z.string().min(10, "Descreva melhor o serviço").nonempty("Descrição é obrigatória"),
  dataVolume: z.enum(["low", "medium", "high", "massive"], { errorMap: () => ({ message: "Selecione o volume de dados" }) }),
  dataSensitivity: z.enum(["non-sensitive", "regular", "sensitive"], { errorMap: () => ({ message: "Selecione a sensibilidade dos dados" }) }),
  contractType: z.enum(["punctual", "continuous"], { errorMap: () => ({ message: "Selecione o tipo de contrato" }) }),
  isTechnology: z.boolean().optional(),
});
```

Com esse schema, o RHF + Zod poderá validar automaticamente no *submit* e também podemos ativar validação *onChange* ou *onBlur* conforme desejado. Os campos obrigatórios já são garantidos pelo `.nonempty()` ou pelo `z.enum` (que não permite valor vazio).

No componente de pergunta, exibiremos mensagens de erro amigáveis próximas ao campo quando `errors[campo]` existir. Exemplo: abaixo de um input, `{errors.supplierName && <span className="text-red-600 text-sm">{errors.supplierName.message}</span>}`. Isso proporciona feedback imediato de validação ao usuário.

No código atual, a validação era imperativa (checando cada campo e chamando toast). Vamos aprimorar isso tornando-a declarativa com RHF/Zod, mas o resultado visual será similar: impedir ação incorreta e avisar o usuário prontamente.

**Resumo das regras obrigatórias:** Em termos práticos, o sistema **não permitirá avançar** da tela atual enquanto:

* Campos marcados com * não forem preenchidos.
* Uma seleção obrigatória não for escolhida.
* Qualquer dado estiver em formato inválido.

Assim garantimos que, ao chegar na etapa final de submissão, todos os dados necessários e consistentes já tenham sido coletados, reduzindo a chance de erros no backend ou necessidade de retrabalho.

## Animações e Microinterações

A adoção de animações sutis e microinterações visa tornar o uso da interface mais intuitivo e fornecer feedback contínuo ao usuário. Para isso, utilizaremos a biblioteca **Framer Motion** (já presente no projeto) para orquestrar as transições de tela e alguns elementos interativos.

**Transições entre perguntas:** Quando o usuário avança para a próxima pergunta, em vez de um corte brusco, será executada uma animação de transição. Podemos, por exemplo, fazer a pergunta atual deslizar para cima e desaparecer enquanto a próxima surge de baixo para o centro com um efeito de fade. No código, isso é conseguido envolvendo as perguntas em um componente `<AnimatePresence>` e definindo animações de entrada/saída em cada bloco de pergunta com `<motion.div>`. Por exemplo, configuramos `initial={{ opacity: 0, x: 20 }}` (inicia ligeiramente deslocado e invisível), `animate={{ opacity: 1, x: 0 }}` (move para posição e aparece) e `exit={{ opacity: 0, x: -20 }}` (ao sair, desaparece para a esquerda), com uma transição de duração ~0.3s. Essas transições dão uma sensação de continuidade e orientação espacial (entra pela direita, sai pela esquerda, indicando avanço e retrocesso, respectivamente).

**Progressão automática:** Nas perguntas de múltipla escolha (como Volume de Dados e Sensibilidade dos Dados), implementaremos **auto-avanço**: assim que o usuário selecionar uma opção, a interface aguardará talvez alguns milissegundos para o usuário ver a escolha marcada e então acionará automaticamente a transição para a próxima pergunta. Essa microinteração elimina a necessidade de um clique extra em "Próximo" e agiliza o fluxo. Podemos conseguir isso adicionando um handler no onChange/onSelect das opções que chama imediatamente a função `nextStep()`. Por exemplo, se implementarmos as opções como botões, ao clicar em uma opção chamamos `handleSelect(option)` que internamente faz: salva a resposta e invoca `goToNextQuestion()`. Daremos um exemplo de código no final deste documento.

**Feedback de seleção:** Para melhorar a percepção de que uma opção foi escolhida, podemos adicionar uma pequena animação de destaque no botão/ opção selecionada – por exemplo, mudar levemente a cor de fundo, ou aumentar de tamanho momentaneamente (um *pulse*). Com CSS ou Framer Motion isso é simples (alterar scale ou aplicar classe de ativo). Assim, mesmo que a tela mude logo em seguida, o usuário tem um indicativo visual do seu clique.

**Indicação de progresso:** Como a triagem envolve várias etapas, um indicador de progresso motiva o usuário a continuar e informa quantas etapas já foram concluídas. No topo da interface podemos manter um **progress bar** horizontal e/ou uma sequência de passos. No protótipo existente, há ambos: uma barra de progresso percentual e círculos numerados para cada etapa. Podemos continuar com esse padrão. Conforme o usuário responde cada pergunta, atualizamos a barra de progresso (por exemplo, se são 8 perguntas, cada uma vale 12.5%, então após 4 perguntas estaria ~50%). A mudança na largura da barra pode ser animada suavemente (transição CSS) para chamar atenção. Já os indicadores de etapa (círculos numerados) podem se preencher ou marcar check quando completos. No código atual, os passos anteriores ao atual ficam com um ícone de check e cor verde, o atual fica azul, e os próximos cinza. Essa mudança de estado pode ser animada (por exemplo, o ícone check dando um pequeno *pop* de escala quando aparece). Tais microinterações reforçam a sensação de avanço concluído a cada passo.

**Destaques e alertas contextuais:** Microinterações também incluem a aparição de elementos como o alerta de dados sensíveis. No nosso caso, quando `sensitiveFlagged` se torna true, o <div> amarelo de aviso é exibido. Podemos animar sua entrada (por exemplo, um fade-in ou slide-down) para chamar atenção de maneira elegante. Da mesma forma, mensagens de erro inline podem tremular (shake) ligeiramente para destacar onde há um problema, ou usar ícones animados.

**Estados de carregamento e sucesso:** Durante operações assíncronas como upload de arquivo ou submissão final, o usuário recebe feedback visual imediato:

* No upload de arquivo, enquanto o arquivo é enviado, mostramos um spinner animado (com CSS `animate-spin` ou via Framer Motion) e um texto "Enviando...". Esse spinner é um microindicador importante para o usuário não ficar sem reação do sistema. Quando conclui, substituímos pelo ícone de check verde e texto "Arquivo enviado com sucesso", podendo aparecer com um fade-in.
* No envio final da triagem, o botão de submit se transforma para indicar processamento: o texto muda para "Enviando..." e um spinner aparece ao lado ou no lugar do ícone. Isso é implementado condicionando o conteúdo do botão ao estado `isSubmitting`: se true, renderiza um spinner girando (usando classes Tailwind para animação) e o texto alternativo; o botão também fica desabilitado e semi-transparente. Uma vez concluído, se sucesso, podemos fazer o botão (ou a tela toda) se transformar na tela de sucesso com um efeito de transição. No protótipo, eles optaram por navegar para a tela de confirmação (SubmissionStatus) dentro do mesmo componente Wizard usando o estado `submissionComplete` e AnimatePresence. Assim, a transição de formulário para tela de sucesso também é animada.
* Na tela de confirmação de sucesso, há um ícone de círculo com check animado (poderíamos eventualmente animar o ícone ou usar um Lottie para checkmark *draw* efeito). Atualmente é estático, mas aparece dentro de um círculo verde claro, indicando sucesso claramente.

**Toasts e mensagens flutuantes:** Além das mudanças na própria interface, utilizaremos *toasts* para certos feedbacks. Por exemplo, ao salvar com sucesso, pode aparecer um toast "Avaliação enviada com sucesso!" por alguns segundos. Em caso de erro não-crítico (como falha no upload do arquivo mas a triagem foi salva), um toast de aviso informa o usuário do problema sem interromper o fluxo. Esses toasts aparecem com uma breve animação de fade/slide de acordo com a implementação do hook `useToast` existente.

**Consideração de desempenho:** As animações serão leves e de curta duração (0.2s a 0.5s geralmente) para não tornarem o fluxo lento ou frustrante. Além disso, respeitaremos a preferência do usuário do sistema por movimentos reduzidos (prefers-reduced-motion); ou seja, se o usuário definiu nas configurações do dispositivo para minimizar animações, podemos desabilitar as transições mais chamativas e usar mudanças instantâneas, garantindo acessibilidade (discutido mais abaixo).

Em resumo, as animações e microinterações servem para:

* **Guiar o usuário** (transições direcionais),
* **Recompensar ações** (checkmarks, highlights ao completar algo),
* **Comunicar estados** (loading spinners, mensagens de erro/sucesso),
* Sem jamais comprometer a usabilidade ou performance. Tudo isso contribuirá para uma experiência mais polida e moderna, digna de uma aplicação voltada a usuários empresariais.

## Tratamento de Erros e Estados de Submissão

É fundamental que a interface lide graçosamente com erros, tanto de validação do lado do cliente quanto eventuais falhas na comunicação com o backend, fornecendo feedback claro ao usuário e caminhos de correção. A seguir, detalhamos como serão tratados os principais cenários de erro e os estados durante a submissão:

**1. Erros de Validação (cliente):** Como mencionado na seção de validações, se o usuário não preencher um campo obrigatório ou violar alguma regra de formato, o sistema impedirá o avanço. Esse não é exatamente um "erro" no sentido do sistema, mas sim um erro do usuário ao preencher. Nesses casos, a interface destacará o campo problemático e exibirá uma mensagem de erro contextual. A mensagem pode ser exibida imediatamente abaixo do campo ou em um toast destrutivo no topo. No protótipo atual, optou-se por usar toast para erro de campo obrigatório, mas uma melhoria seria mostrar inline para o usuário não perder o contexto (ou fazer ambos: inline e um toast resumido). De qualquer forma, enquanto houver erros de validação pendentes, o usuário não pode prosseguir – a função `nextStep()` ou `submit()` retornará precocemente. Isso garante que somente dados válidos seguem adiante.

**2. Estado "Submetendo":** Quando o usuário clica no botão de submissão no final da triagem, o sistema entra em estado de envio. Nesta fase, desativamos as interações para prevenir cliques duplicados ou navegação enquanto aguardamos resposta. Especificamente, o botão de submit fica desabilitado e mostra um indicador de carregamento, conforme discutido. Podemos também bloquear temporariamente a navegação de passos (ex: o usuário não deve voltar etapas enquanto estamos tentando enviar os dados ao servidor). Se a operação de submissão demora mais que um segundo, é recomendável manter o usuário informado – o spinner e texto "Enviando..." cumprem esse papel. Se houvesse etapas muito lentas (como chamar uma API externa), poderíamos adicionar um indicador de progresso ou uma mensagem do tipo "Isso pode levar alguns segundos...". No entanto, a expectativa com Supabase é de resposta rápida para inserts, então possivelmente não necessário.

**3. Erros de Submissão (backend):** Caso ocorra alguma falha ao salvar os dados no Supabase (por exemplo, perda de conexão, erro na lógica de inserção, falha de RLS, etc.), o sistema precisa informar o usuário e permitir tentar novamente. No código atual, erros nesse estágio são capturados dentro de um bloco try/catch e armazenados em um estado `errorDetails`. A UI então verifica esse estado e, se presente, exibe um painel de erro com detalhes. Vamos seguir abordagem semelhante:

* Envolveremos a chamada de criação de fornecedor/avaliação em um bloco try/catch.
* Se houver exceção ou resposta de erro, definiremos um estado de erro com a mensagem apropriada.
* Na interface, em vez de mudar para tela de sucesso, permaneceremos na tela final do formulário e mostraremos um **banner de erro** destacado (por exemplo, fundo vermelho claro) contendo uma mensagem do tipo "Ocorreu um erro ao submeter a avaliação. Por favor tente novamente.". Podemos também exibir detalhes técnicos do erro para fins de suporte (como ID do erro, mensagem do servidor) – no protótipo eles incluem detalhes em texto monoespaçado dentro do banner. Isso pode ser útil para desenvolvedores, mas em produção talvez limitar a uma mensagem genérica ou log interno.
* Quando um erro acontece, reabilitamos o botão de submit (ou exibimos um botão "Tentar Novamente") para que o usuário possa acionar novamente após eventualmente corrigir algo (se o erro for devido a dados, embora nessa fase provavelmente seria erro do sistema). Se o erro for devido a dados inconsistentes (por exemplo, algum dado não esperado no backend), o usuário pode voltar etapas, ajustar respostas e tentar submeter de novo.
* Além do banner, um **toast** destrutivo também pode notificar o erro imediatamente, chamando atenção do usuário (ex: "Falha ao enviar. Verifique sua conexão e tente novamente.").

Exemplo: suponha que ao chamar `createSupplier` o Supabase retorne um erro de violação de unicidade (fornecedor já existente). Capturamos esse erro, `error.message` poderia ser "duplicate key value violates unique constraint ...". Em vez de mostrar isso cru, podemos mapear para "Já existe um fornecedor cadastrado com esse CNPJ." se conseguirmos identificar. Portanto, uma melhoria é tratar alguns erros comuns de forma amigável. Para fins de documentação técnica, basta dizer que exibiremos a mensagem de erro e lidaremos conforme o caso.

**4. Erro no Upload de Arquivo:** O upload de arquivo é uma operação separada que também pode falhar (rede instável, tamanho excede limite, etc.). No design atual, se o upload falha, isso **não impede** a criação do fornecedor, ele prossegue mas avisa o usuário. De fato, o código captura erro do upload e apenas emite um toast de aviso, continuando o fluxo de submissão normal. Manteremos essa filosofia: não queremos que um problema com o arquivo bloqueie todo o cadastro (afinal, o arquivo pode ser enviado posteriormente por outro canal, ou o usuário tentar de novo). Assim:

* Se o upload falhar, exibiremos um aviso (toast ou mensagem na UI) dizendo algo como "*O fornecedor foi criado, mas houve uma falha ao enviar o documento. Tente novamente mais tarde ou contate o suporte.*".
* Podemos também registrar essa falha (log) para acompanhamento.
* Na tela de confirmação, poderíamos indicar "documento: não anexado devido a erro" caso queiramos ser transparentes, mas isso pode confundir o usuário final. Talvez melhor incentivar reenvio manual: por exemplo, disponibilizar na tela de confirmação um botão "Enviar documento agora" caso queira tentar novamente (chamando novamente a rota de upload).
* Importante é que tal erro **não derruba todo o processo**. A triagem em si será marcada como submetida.

**5. Pós-submissão bem-sucedida:** Quando tudo ocorre bem, o sistema já redireciona para a tela de sucesso (ou a exibe via estado). Nesse estado "success", podemos ainda assim lidar com algumas coisas:

* O usuário pode querer salvar ou imprimir o comprovante. Podemos oferecer um botão "Imprimir" na tela de resumo, ou "Salvar PDF" caso faça sentido.
* Podemos também oferecer a possibilidade de iniciar uma nova triagem (se o usuário precisar cadastrar outro fornecedor logo em seguida) – um botão "Nova Triagem" que reseta o formulário e volta ao início.
* No fluxo multiusuário, talvez após sucesso o responsável interno simplesmente sai dali e o processo continua com o DPO. Então a tela de sucesso funciona como um ponto final para ele. É importante deixar claro que *não houve erro* e que agora é com outra pessoa. O texto "submetida para avaliação" já indica isso.

**6. Logs e Monitoramento:** Do ponto de vista do desenvolvedor, é útil logar eventos de erro para diagnóstico. No código, vê-se uso de `console.error` em vários catch. Em produção, integrar com um serviço de logging (Sentry, por ex.) seria ideal para capturar stack traces. Por ora, manteremos logs no console (úteis em desenvolvimento) e consideraremos adicionar logs backend (via função Supabase ou similar) se necessário para erros de banco.

**Estados de submissão intermediários:** Temos basicamente:

* `isSubmitting = false` (estado normal, edição habilitada);
* `isSubmitting = true` (enviando... UI bloqueada parcialmente);
* `submissionComplete = true` (submetido com sucesso, mostrando tela final);
* `errorDetails` preenchido (estado de erro após tentativa falha).

No protótipo, ao sucesso eles fazem `setSubmissionComplete(true)` e resetam `errorDetails` se estava setado. Seguiremos essa abordagem. Em caso de erro, não setamos `submissionComplete`, deixamos usuário na tela atual e populamos `errorDetails` para mostrar o banner. Em caso de sucesso, limpamos `errorDetails` (para esconder banners) e vamos para a tela de sucesso.

No front-end, o `AnimatedStepIndicator` e demais componentes podem ou não ser exibidos dependendo desses estados. Por exemplo, ocultamos o indicador de passos durante a tela de sucesso ou erro, para não confundir (no código original, eles usaram `!submissionComplete && <AnimatedStepIndicator ...>`).

**Experiência do usuário em caso de erro:** Garantiremos que as mensagens sejam escritas em linguagem clara e objetiva, evitando jargão técnico. Ex.: em vez de "*supabase insert failed: null value in column 'company_id'*", mostrar "*Falha ao salvar: empresa não identificada. Por favor, tente novamente mais tarde ou contate o suporte.*". A consistência nas mensagens (usando o mesmo componente de alerta visual, mesmas cores para erros) é importante.

Em suma, o sistema é desenvolvido para ser resiliente a erros: validando antecipadamente para preveni-los, mas também detectando e comunicando quaisquer problemas de forma transparente, dando ao usuário a chance de corrigir ou tentar novamente sem perda de dados. Os estados de envio e erro são refletidos claramente na UI para não deixá-lo em dúvida sobre o que está acontecendo.

## Preservação das Regras de Classificação Atuais

Embora a interface esteja sendo redesenhada, as **regras de negócio de classificação de fornecedores continuam as mesmas**. Isso significa que toda a lógica existente de cálculo de categoria de fornecedor e nível de risco será mantida intacta no novo fluxo. Os desenvolvedores devem reutilizar as funções utilitárias e garantir que o resultado da triagem seja **compatível com o sistema atual**, para não impactar relatórios, requisitos de documentação e processos subsequentes.

As principais regras a preservar são:

* **Matriz de Risco (calculateSupplierType):** A função `calculateSupplierType(dataVolume, dataSensitivity)` deverá ser invocada para determinar o tipo de fornecedor (código A, B, C ou D) com base nas respostas de **Volume de Dados** e **Sensibilidade dos Dados**. A matriz utilizada por essa função é fornecida pela área de Riscos/Conformidade e já está implementada no módulo de risco. Em resumo:

  * Se o volume de dados for baixo e os dados não são sensíveis ou regulares ⇒ Tipo D (Básico).
  * Volumes baixos com dados sensíveis ⇒ Tipo C (Moderado).
  * Volumes médios com dados não sensíveis ⇒ D; médios com regulares ⇒ C; médios com sensíveis ⇒ B (Significativo).
  * Volumes altos com não sensíveis ou regulares ⇒ C; altos com sensíveis ⇒ B.
  * Volume massivo (muito alto) com não sensíveis ⇒ C; massivo com regulares ⇒ B; massivo com sensíveis ⇒ A (Crítico).

  A tabela completa está definida no código e deve ser seguida rigorosamente. Nenhuma alteração deve ser feita nessa matriz sem aprovação da equipe de GRC. Portanto, o novo código chamará `calculateSupplierType(formData.dataVolume, formData.dataSensitivity)` assim que ambos valores estiverem disponíveis, seja no momento da submissão final ou para exibir a prévia da análise. O retorno dessa função fornece tanto o código (A/B/C/D) quanto a descrição textual do tipo (e.g., "CRÍTICO", "SIGNIFICATIVO") que usamos na interface.
* **Mapeamento para Nível de Risco:** Tradicionalmente, o sistema armazena também um campo `risk_level` ou similar, que representa de forma textual o nível de risco associado ao tipo de fornecedor. A correspondência é:

  * Tipo **A** ⇒ Nível de risco "critical" (Crítico)
  * Tipo **B** ⇒ Nível de risco "high" (Alto)
  * Tipo **C** ⇒ Nível de risco "medium" (Médio)
  * Tipo **D** ⇒ Nível de risco "low" (Baixo)

  Esse mapeamento é evidente no código de submissão. O novo fluxo continuará a atribuir `risk_level` dessa forma. No banco de dados, espera-se que essas strings ("critical", "high", etc.) sejam inseridas no campo correspondente do fornecedor para eventual uso em filtros ou destaque em UI (por exemplo, fornecedores críticos podem aparecer com ícone vermelho, etc.). Além disso, a interface de confirmação usa `riskLevelColor` associado ao código para exibir um bullet colorido – essas cores (vermelho para A, laranja para B, amarelo para C, verde para D) também permanecem as mesmas.
* **Documentos obrigatórios por tipo:** Como parte da regra de negócio, cada categoria A/B/C/D tem um conjunto de documentos exigidos para avaliação completa, e fornecedores de TI adicionam alguns extras. Essa lógica está implementada na função `getRequiredDocuments(supplierType, isTechnology)` e já foi utilizada na tela de *Próximas Etapas* da triagem. Continuaremos usando-a para orientar o que será pedido ao fornecedor após a triagem. Portanto, após calcular o tipo do fornecedor, o sistema pode já, por exemplo, preparar a lista de documentos a solicitar e apresentá-la ao usuário (ou ao DPO) conforme definido. *Exemplo:* Fornecedor classificado como A (Crítico) e marcado como TI deve apresentar todos os documentos de base A (política de privacidade, nomeação DPO, DPIA, etc.) **mais** os específicos de TI (controles de acesso, criptografia, logging). Nenhuma dessas exigências foi alterada – o novo frontend apenas assegura de informar corretamente.
* **Cálculo de prazo estimado:** Embora não seja exatamente uma "regra de classificação", no SubmissionStatus calcula-se um prazo em dias para concluir a avaliação, baseado no tipo. Isso é mais um detalhe de UI. Podemos manter esse cálculo simples (A: 10-15 dias, B: 5-10, C: 3-5, D: 1-3, por exemplo) conforme já usado, para comunicar ao usuário/demais partes interessadas uma expectativa de tempo. Qualquer fórmula ou constante nesse sentido permanece igual.
* **Campo sensível flag (sensitiveFlagged):** Internamente, quando o fornecedor tem dados sensíveis, já sinalizamos esse booleano. Isso pode ser útil para relatórios e para garantir que tipos C e acima sejam tratados com atenção. Manteremos o preenchimento desse campo (no formData e ao salvar no banco, possivelmente em `assessment.data_type` ou similar). No código atual, eles mapearam `dataSensitivity` para um campo `data_type` que assume valores "none", "common", "sensitive" na tabela. Isso é basicamente o mesmo dado em outra nomenclatura. Continuaremos seguindo essa convenção para não quebrar nada – ou seja, no momento de salvar, converter "non-sensitive" -> "none", "regular" -> "common", "sensitive" -> "sensitive" para preencher o campo de tipo de dado conforme o esperado pelo backend.
* **Statuses e fluxo geral:** Após submissão, o fornecedor fica com status "pending" até a avaliação final. Nenhuma alteração nesse comportamento – o front apenas indica ao usuário que a triagem foi enviada para avaliação externa, mas no banco continua o mesmo status. A avaliação criada fica como "draft" até o DPO terminar, etc. Esses status são importantes para não confundir o que foi finalizado ou não. Portanto, desenvolvedores backend e frontend devem garantir que, ao criar registros via Supabase, usem os mesmos valores de status que o sistema espera (ex.: `status: "pending"` na tabela de fornecedores na inserção inicial, etc., conforme implementado).

Em suma, **toda a camada de classificação e regras de negócio permanece inalterada**. O que muda é apenas a experiência de coleta desses dados. O front-end continuará chamando as funções utilitárias existentes (já testadas) para determinar o resultado da triagem. Isso facilita a implementação (reuso de código) e assegura consistência com a versão anterior. Deve-se tomar cuidado para não introduzir nenhuma divergência nesses cálculos. Por exemplo, não tentar recalcular de forma diferente no front – sempre usar `calculateSupplierType` do módulo de risco para evitar qualquer divergência ou duplicação de lógica. O mesmo vale para *risk level* e *required documents*: use as fontes únicas de verdade (código centralizado) em vez de replicar listas manualmente no componente.

Para verificar que tudo está correto, é válido após implementar, simular alguns cenários e comparar com a versão anterior da triagem. Exemplo: fornecedor com volume "massive" e dados "sensitive" deve dar tipo A crítico; fornecedor "low" + "non-sensitive" dá D básico. Podemos criar testes unitários para `calculateSupplierType` se já não existirem, ou pelo menos fazer console.log comparativos durante desenvolvimento.

Em resumo, o novo front-end **preserva integralmente a lógica de classificação A/B/C/D e níveis de risco**, garantindo que os outputs (tipo de fornecedor, nível de risco, documentos exigidos, etc.) sejam exatamente os mesmos de antes, apenas coletados e apresentados de maneira mais amigável.

## Regras de Responsividade e Acessibilidade

Desde o início, a interface deve ser construída com princípios de **responsividade** (layout adaptável a diferentes tamanhos de tela) e **acessibilidade** (usabilidade por pessoas com deficiências e conformidade com padrões web) em mente, garantindo que todos os usuários consigam realizar a triagem.

**Responsividade (Mobile-first):** A triagem de fornecedores será utilizada tanto em monitores desktop quanto possivelmente em tablets ou laptops e até smartphones (gestores podem precisar fazer triagem em campo). Portanto, adotaremos a estratégia *mobile-first*: os componentes e telas serão inicialmente concebidos para telas menores e se expandirão/aproveitarão espaço extra em telas maiores.

* **Layout fluido:** Utilizaremos unidades relativas (%) e max-width em contêineres para que a interface se ajuste à largura da tela. Por exemplo, o contêiner principal pode ter `max-w-4xl mx-auto` para limitar a largura em desktops e manter centralizado.
* **Grade responsiva:** Quando houver múltiplos campos em uma mesma tela (lembrando que nossa meta é um por vez, mas em casos como Nome + CNPJ que poderiam ficar juntos em telas grandes), faremos uso das utilidades responsivas do Tailwind. No código existente, por exemplo, eles definem `grid grid-cols-1 md:grid-cols-2 gap-4` para dispor dois campos lado a lado a partir de tamanho médio de tela, mas empilhados em uma coluna única em telas pequenas. Esse padrão será seguido para qualquer agrupamento de campos ou cartões. Assim, em um celular, os inputs aparecem em coluna (tela cheia, rolagem vertical mínima), enquanto em um desktop podem aparecer em duas colunas, aproveitando melhor o espaço e diminuindo a rolagem.
* **Elementos dimensionáveis:** Componentes como botões, textos e inputs utilizarão classes que os tornam adaptáveis. Por exemplo, usar `w-full` nos inputs para que ocupem 100% do contêiner disponível, evitando problemas de alinhamento em diferentes larguras. Imagens/ícones serão escaláveis ou trocados por equivalentes de acordo com a resolução (embora a interface seja majoritariamente form, com poucos gráficos).
* **Testes em múltiplos breakpoints:** Garantiremos que a interface funcione e se apresente bem em pelo menos: 360px (telefone pequeno), ~768px (tablet), ~1024px (notebook), 1440px+ (monitores grandes). Isso inclui verificar se textos não quebram ou overflowam, se componentes expansíveis (como modais de ajuda) cabem na tela, etc.

**Acessibilidade (a11y):** Vamos aderir às diretrizes WCAG sempre que possível e tornar a aplicação utilizável por navegadores assistivos.

* **Elementos semânticos e rótulos:** Todos os campos de formulário terão rótulos `<label>` associados corretamente via `for`/`id` ou envolvimento direto. No código atual, alguns inputs estavam associados implicitamente (label separado do input sem htmlFor), o que vamos corrigir adicionando `id` no input e `htmlFor` no label. Isso garante que leitores de tela anunciem o nome do campo junto com o valor/estado. Também utilizaremos roles apropriados para componentes não-semânticos se necessário (por exemplo, um div simulando modal deve ter role `dialog`, etc.).
* **Suporte a teclado:** A navegação pelo formulário deve ser possível apenas com teclado. A ordem de tabulação seguirá a ordem lógica das perguntas. O botão "Próximo" recebe foco natural após o campo. Além disso, implementaremos atalhos convenientes: por exemplo, pressionar Enter em uma pergunta de texto poderia acionar o "Próximo" automaticamente (desde que o campo seja válido), para não obrigar o usuário a tabular até o botão. Em perguntas de múltipla escolha, as setas do teclado devem navegar entre opções (se usarmos radios nativos isso já ocorre) e a tecla Espaço/Enter seleciona a opção. Quando uma opção é selecionada e temos auto-avanço, cuidaremos para mover o foco adequadamente para o próximo campo assim que ele surgir (podemos usar um ref no próximo input e chamar `.focus()` após avançar, ou usar atributos `autoFocus` quando o componente monta).
* **Componentes de ajuda acessíveis:** Os ícones de ajuda contextual terão suporte a leitor de tela. No código fornecido, eles usaram `aria-label="Ajuda"` e `aria-describedby="campo-help-id"` juntamente com um `<span className="sr-only">Texto da ajuda</span>`. Isso é uma boa prática: o sr-only fornece a dica textual, lida pelo leitor de tela quando o ícone é focado, sem poluir a interface visual. Manteremos esse padrão. Podemos aprimorar tornando o ícone clicável/tabelável que exibe uma *tooltip* visível também para usuários videntes. Se fizermos isso, precisamos assegurar que o conteúdo da tooltip também esteja no DOM para leitores de tela (pode ser o mesmo sr-only tornado visível).
* **Contraste de cores:** Usaremos o esquema de cores definido (Tailwind + shadcn UI) cuidando para que textos tenham contraste suficiente com o fundo. Por exemplo, texto azul sobre fundo azul-claro ou texto amarelo sobre fundo branco serão evitados se não passarem nas métricas de contraste. Pelas classes do código, nota-se uso de texto azul-800 sobre bg-blue-50 (o que deve ter contraste adequado), e texto amarelo-700 sobre bg-yellow-50, etc., geralmente tonalidades escuras sobre claras – isso é bom. Manter essa consistência e checar com ferramentas a11y.
* **Indicação não só por cor:** Qualquer informação comunicada por cor (ex: status do passo verde/vermelho) também deve ser comunicada por texto ou ícone para usuários daltônicos. No nosso caso, usamos ícones (check, alert) e textos junto com cores, então está coberto. Exemplo: o círculo verde com check indica completo (ícone e cor redundantes), o banner amarelo de sensível tem ícone de alerta e palavra "Atenção" dentro.
* **Leitura de progresso:** A barra de progresso e etapas devem ser acessíveis. No protótipo, implementaram uma descrição de progresso usando `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e um texto sr-only indicando "Progresso do formulário". Isso é excelente, pois leitores de tela podem anunciar "Progresso do formulário: 50% concluído" automaticamente. Manteremos esse elemento atualizado conforme as perguntas são respondidas.
* **Preferências do usuário:** Como citado, se o usuário ativou "reduced motion" nas preferências do sistema operacional, devemos desabilitar ou reduzir significativamente as animações. O Framer Motion pode respeitar automaticamente `prefers-reduced-motion` (há hooks para isso) ou podemos manualmente checar `window.matchMedia("(prefers-reduced-motion: reduce)")` e então condicionar as variantes de animação (por exemplo, não usar `x: 20` deslocamentos, apenas um simples fade ou até pular animações). Assim evitamos desconforto a usuários sensíveis a movimento.
* **Teste com leitor de tela:** Faremos testes usando NVDA/JAWS (Windows) ou VoiceOver (Mac) para garantir que a ordem de leitura faça sentido e que todos os controles estejam acessíveis. Por exemplo, verificar que ao entrar na página o leitor de tela anuncia o título da etapa e a pergunta, não lê conteúdo oculto de outras etapas (o AnimatePresence deve remover do DOM as perguntas não visíveis, o que já ajuda).
* **Foco visível:** Garantir que o estado de foco nos elementos interativos seja visível para usuários videntes navegando por teclado. Os estilos default do navegador ou Tailwind focus:ring devem ser mantidos ou customizados, mas não removidos. Isso é importante para o usuário saber em qual botão/field ele está quando usando Tab.
* **Acessibilidade em componentes dinâmicos:** Elementos como modais, tooltips, devem ser adicionados no DOM de forma a não bagunçar a navegação. Por exemplo, se implementarmos as perguntas como páginas distintas ou roteamento, o *focus* inicial deve ir para o cabeçalho ou primeiro campo da nova página. Se for um único componente que oculta/mostra perguntas, garantir que a mudança de pergunta também mova o foco adequadamente, como dito antes.

Para exemplificar, vemos no código existente:

* Uso correto de sr-only para informações auxiliares.
* Uso de aria-describedby para ligar ícones de info ao texto oculto.
* Role e aria attributes em barra de progresso.
  Isso mostra preocupação com acessibilidade e vamos continuar nesse caminho.

Por fim, **performance** também é uma faceta da acessibilidade – a interface deve carregar rápido e reagir rápido. Evitamos sobrecarregar com animações pesadas ou JavaScript desnecessário, garantindo que mesmo em dispositivos modestos a triagem funcione sem atrasos.

## Exemplo de Código: Pergunta de Múltipla Escolha com Auto-avanço

A seguir, apresentamos um exemplo simplificado de implementação de um componente para uma pergunta de múltipla escolha que avança automaticamente ao selecionar uma opção. Esse componente React demonstra como conectar a seleção de uma opção com a função de ir para a próxima pergunta:

```tsx
import React, { useState } from "react";

interface MultiChoiceQuestionProps {
  question: string;
  options: Array<{ value: string; label: string }>;
  onAnswer: (value: string) => void;   // função para salvar a resposta e avançar
}

const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({ question, options, onAnswer }) => {
  const [selected, setSelected] = useState<string | null>(null);

  // Handler de seleção
  const handleSelect = (value: string) => {
    setSelected(value);
    onAnswer(value); // salva resposta no estado global e avança para próxima pergunta
  };

  return (
    <div className="question-step">
      <h3 className="text-lg font-medium mb-4">{question}</h3>
      <div className="flex flex-col space-y-2">
        {options.map((opt) => (
          <label 
            key={opt.value} 
            className={`p-3 border rounded cursor-pointer 
                       ${selected === opt.value ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"}`}>
            <input 
              type="radio" 
              name="option" 
              value={opt.value} 
              className="sr-only"
              checked={selected === opt.value}
              onChange={() => handleSelect(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultiChoiceQuestion;
```

**Como esse componente funciona:**

* Ele recebe via props a pergunta (`question`), uma lista de opções (`options`) e a função `onAnswer` que vem do componente pai (provavelmente o controlador do wizard).
* Cada opção é renderizada como um `<label>` contendo um input de rádio invisível (`className="sr-only"` esconde o input padrão, pois estilizamos o label) e o texto da opção.
* Estilizamos o label para parecer um botão: uma borda, padding e mudança de cor quando selecionado. Note que usamos o estado local `selected` para realçar a opção escolhida (background azul claro e borda azul, por exemplo).
* Quando o usuário clica em uma opção, disparamos `onChange` do input, que chama `handleSelect(opt.value)`. Essa função atualiza o estado selecionado e então invoca `onAnswer(value)`.
* Pressionar diretamente no `<label>` também checa o rádio (comportamento nativo do label associado), então tanto cliques quanto navegação teclado + espaço funcionarão.
* A função `onAnswer` no componente pai deve armazenar o valor escolhido (por exemplo, no estado global do formulário) e então avançar a etapa atual, i.e., `setCurrentQuestion(currentQuestion + 1)`. Assim, logo após a seleção, o pai muda de pergunta.
* Graças a isso, o usuário não precisa clicar em um botão "Próximo" explicitamente; a seleção já confirma a resposta e prossegue. Caso ele queira mudar antes de avançar, pode clicar em outra opção rapidamente (mas como avançamos imediatamente, normalmente ele teria que voltar caso mude de ideia – isso é aceitável, já que as opções são geralmente únicas e facilmente corrigíveis retrocedendo).

**Uso do componente pai (pseudo-código):**

```tsx
const questions = [
  { 
    question: "Qual o volume de dados envolvido?", 
    field: "dataVolume",
    options: [
      { value: "low", label: "Baixo (menos de 100 indivíduos)" },
      { value: "medium", label: "Médio (100 a 1.000)" },
      { value: "high", label: "Alto (mais de 1.000)" },
      { value: "massive", label: "Massivo (muitos milhares ou mais)" }
    ]
  },
  // ... outras perguntas ...
];

const [currentIndex, setCurrentIndex] = useState(0);
const [formData, setFormData] = useState<FormData>(/* init state */);

const handleAnswer = (value: string) => {
  // salvar resposta da pergunta atual
  const field = questions[currentIndex].field;
  setFormData(prev => ({ ...prev, [field]: value }));
  // avançar para próxima pergunta
  setCurrentIndex(prev => prev + 1);
};

...
<MultiChoiceQuestion 
   question={questions[currentIndex].question}
   options={questions[currentIndex].options}
   onAnswer={handleAnswer}
/>
```

No exemplo acima, `handleAnswer` cuida de persistir a resposta atual no objeto `formData` e incrementar o índice da pergunta corrente. Assim que `currentIndex` muda, o componente `MultiChoiceQuestion` receberá uma nova pergunta via props e re-renderizará para a próxima pergunta (ou, usando AnimatePresence, transicionará).

**Validação no auto-avanço:** Dado que é uma escolha obrigatória, enquanto o usuário não selecionar nada, ele não sai da pergunta (não há avanço). Mas também não aparece um erro imediatamente porque ele ainda não tentou "submitar" aquela pergunta – ele está apenas olhando as opções. Esse é um caso onde a validação é intrínseca: não avançará sem escolher. Poderíamos ainda, por acessibilidade, colocar `aria-invalid` no grupo se fosse inválido, mas como é obrigatório e não selecionado, assim que ele tenta avançar (o que seria clicar numa opção) ele vai acabar escolhendo algo ou não vai acontecer nada. Então esse fluxo é simples.

**Acessibilidade do componente:** Usamos um `<label>` clicável envolvendo cada opção, e escondemos o input mas mantemos ele no DOM para acessibilidade (com `sr-only`). Isso permite que usuários de leitor de tela naveguem as opções e usem espaço/enter para selecionar, acionando o onChange. O foco visual poderia ser colocado no próprio label (via CSS :focus state) já que input está sr-only. Alternativamente, poderíamos usar roving tabindex ou algum componente de radio group acessível. Mas, para fins de simplicidade, o label->input invisível funciona.

**Framer Motion no auto-avanço:** No snippet acima não integramos animação, mas em nossa aplicação, esse componente seria usado dentro do contexto do wizard que já está animando transições de perguntas. Ou poderíamos envolver `<MultiChoiceQuestion>` em um `<motion.div>` similar aos outros passos. Não há conflito – o auto-avanço apenas dispara o estado que eventualmente desmonta este componente com animação de saída e monta o próximo com animação de entrada.

Este exemplo ilustra como implementar de forma simples e eficaz a auto-progressão em perguntas de múltipla escolha. A equipe deve seguir padrão semelhante para outras perguntas onde faça sentido (por exemplo, a pergunta binária "Fornecedor de TI/SaaS" também pode avançar ao marcar sim/não imediatamente, visto que é apenas um toggle).

---

**Conclusão:** Com este documento, os desenvolvedores front-end e back-end têm um guia completo para implementar a nova interface de triagem de fornecedores, assegurando que a experiência do usuário seja aprimorada sem comprometer as regras de negócio existentes. Seguindo as seções acima – entendimento do fluxo UX, arquitetura proposta, detalhamento de cada etapa, validações, animações, tratamento de erros, consistência nas regras de classificação e cuidados de responsividade/acessibilidade – esperamos obter uma implementação de alta qualidade, facilitando o processo de triagem e mantendo a confiabilidade do sistema. Cada parte do novo código deve ser revisada à luz dessas diretrizes, e os trechos de código fornecidos servem como referência inicial para acelerar o desenvolvimento. Boa implementação!