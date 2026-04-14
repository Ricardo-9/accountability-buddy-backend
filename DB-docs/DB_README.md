# My Accountability Buddy — Banco de Dados

## Visão Geral

Este documento descreve o schema do banco de dados do projeto **My Accountability Buddy**, incluindo decisões de modelagem, relacionamentos, padrões adotados e justificativas técnicas.

- **Banco de dados:** PostgreSQL
- **Gerenciamento:** Prisma ORM
- **Autenticação:** Delegada ao Supabase (UUID do usuário como referência)

### Objetivos do Schema

- Clareza estrutural
- Separação de estado atual vs histórico
- Integridade referencial consistente
- Escalabilidade sem complexidade desnecessária

---

## Arquitetura Geral

O banco está dividido em quatro domínios principais, todos vinculados ao `userId` fornecido pelo Supabase:

- **Finance**
- **Nutrition**
- **Fitness**
- **Productivity**

Além desses, existem modelos auxiliares que armazenam dados complementares do perfil do usuário e suas áreas de interesse.

---

### Diagrama Entidade-Relacionamento (ERD)

O diagrama completo, utilizado como base para a modelagem no Prisma, está disponível em:

📁 `DB-docs/erd.png`

---

## Estrutura por Domínio

### 0. Perfil e Áreas do Usuário

#### `UserProfile`

Armazena informações complementares do usuário autenticado via Supabase e centraliza as referências de todas as outras tabelas por meio do `userId`. Ao utilizar o mesmo UUID do Supabase Auth, garantimos integridade e evitamos duplicação de identidade.

| Campo       | Tipo                 | Descrição                             |
| ----------- | -------------------- | ------------------------------------- |
| `id`        | String               | Mesmo ID do Supabase Auth (PK)        |
| `fullName`  | String?              | Nome completo                         |
| `birthDate` | DateTime?            | Data de nascimento (Date)             |
| `phone`     | String?              | Telefone para contato                 |
| `status`    | Enum `ProfileStatus` | Status da conta (`ACTIVE`, `DELETED`) |
| `createdAt` | DateTime             | Data de criação                       |
| `updatedAt` | DateTime             | Última atualização                    |
| `deletedAt` | DateTime?            | Data de exclusão lógica (soft delete) |

---

#### `UserArea`

Associa o usuário a uma ou mais áreas de accountability, permitindo personalização do app.

| Campo       | Tipo                      | Descrição                                                          |
| ----------- | ------------------------- | ------------------------------------------------------------------ |
| `id`        | String                    | PK (UUID)                                                          |
| `userId`    | String                    | FK para `UserProfile`                                              |
| `area`      | Enum `AccountabilityArea` | Área de interesse (`GYM`, `NUTRITION`, `FINANCES`, `PRODUCTIVITY`) |
| `createdAt` | DateTime                  |                                                                    |
| `updatedAt` | DateTime                  |                                                                    |

> **Constraint:** `@@unique([userId, area])` — cada área pode ser associada apenas uma vez por usuário.

---

### 1. Finance

#### `FinanceAccount`

Armazena o saldo atual consolidado do usuário.

| Campo       | Tipo     | Descrição         |
| ----------- | -------- | ----------------- |
| `id`        | String   | PK (UUID)         |
| `userId`    | String   | Único por usuário |
| `balance`   | Decimal  | Saldo atual       |
| `createdAt` | DateTime |                   |
| `updatedAt` | DateTime |                   |

> **Justificativa:** Manter o estado atual separado do histórico otimiza consultas em dashboards. O histórico de evolução do saldo é armazenado em `FinanceBalanceHistory`.

---

#### `FinanceBalanceHistory`

Registra snapshots do saldo e variações ao longo do tempo.

| Campo       | Tipo                     | Descrição                                                                                                                 |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `id`        | String                   | PK (UUID)                                                                                                                 |
| `userId`    | String                   |                                                                                                                           |
| `balance`   | Decimal                  | Saldo na data do snapshot                                                                                                 |
| `change`    | Decimal                  | Variação do saldo (positiva ou negativa)                                                                                  |
| `type`      | Enum `BalanceChangeType` | Origem da variação (`INITIAL_BALANCE`, `INCOME`, `EXPENSE`, `GOAL_CREATE`, `GOAL_UPDATE`, `GOAL_DEPOSIT`, `GOAL_DELETED`) |
| `createdAt` | DateTime                 | Data do registro                                                                                                          |

> **Índices:** `[userId, createdAt]` para consultas temporais eficientes.

---

#### `FinancialCategory`

Categorias personalizadas para despesas, transações recorrentes e metas financeiras. Suporta soft delete.

| Campo       | Tipo      | Descrição                             |
| ----------- | --------- | ------------------------------------- |
| `id`        | String    | PK (UUID)                             |
| `userId`    | String    |                                       |
| `name`      | String    | Nome da categoria                     |
| `isDefault` | Boolean   | Se é uma categoria padrão do sistema  |
| `createdAt` | DateTime  |                                       |
| `updatedAt` | DateTime  |                                       |
| `deletedAt` | DateTime? | Data de exclusão lógica (soft delete) |

> **Constraint:** `@@unique([userId, name, deletedAt])` — permite reutilizar o mesmo nome após exclusão lógica.

---

#### `VariableExpense`

Despesas variáveis não periódicas, registradas individualmente e descontadas diretamente do saldo da conta financeira.

| Campo         | Tipo      | Descrição                             |
| ------------- | --------- | ------------------------------------- |
| `id`          | String    | PK (UUID)                             |
| `userId`      | String    |                                       |
| `categoryId`  | String?   | FK para `FinancialCategory` (SetNull) |
| `name`        | String    | Nome da despesa                       |
| `amount`      | Decimal   | Valor                                 |
| `expenseDate` | DateTime  | Data da despesa (Date)                |
| `createdAt`   | DateTime  |                                       |
| `updatedAt`   | DateTime  |                                       |
| `deletedAt`   | DateTime? | Data de exclusão lógica (soft delete) |

> **Índices:** `[userId, expenseDate]` e `categoryId`.

---

#### `RecurringTransaction`

Transações recorrentes (receitas ou despesas), com controle de periodicidade e próxima execução.

| Campo             | Tipo                   | Descrição                             |
| ----------------- | ---------------------- | ------------------------------------- |
| `id`              | String                 | PK (UUID)                             |
| `userId`          | String                 |                                       |
| `categoryId`      | String?                | FK para `FinancialCategory` (SetNull) |
| `type`            | Enum `TransactionType` | Tipo (`INCOME`, `EXPENSE`)            |
| `name`            | String                 | Nome da transação                     |
| `amount`          | Decimal                | Valor                                 |
| `recurrenceValue` | Int                    | Valor numérico da recorrência         |
| `recurrenceUnit`  | Enum `RecurrenceUnit`  | Unidade (`DAY`, `WEEK`, `MONTH`)      |
| `dayOfMonth`      | Int?                   | Dia do mês de execução (opcional)     |
| `nextOccurrence`  | DateTime               | Próxima data de execução              |
| `lastExecutedAt`  | DateTime?              | Última vez que foi executada          |
| `createdAt`       | DateTime               |                                       |
| `updatedAt`       | DateTime               |                                       |

> **Índices:** `userId` e `nextOccurrence` (para jobs de execução automática).

---

#### `RecurringTransactionExecution`

Histórico de execuções de cada transação recorrente.

| Campo           | Tipo     | Descrição                                |
| --------------- | -------- | ---------------------------------------- |
| `id`            | String   | PK (UUID)                                |
| `transactionId` | String   | FK para `RecurringTransaction` (Cascade) |
| `amount`        | Decimal  | Valor executado                          |
| `executedAt`    | DateTime | Data/hora da execução                    |
| `balanceBefore` | Decimal  | Saldo antes da execução                  |
| `balanceAfter`  | Decimal  | Saldo após a execução                    |

> **Índices:** `[transactionId, executedAt]`.

---

#### `FinancialGoal`

Metas financeiras com prazo e perfil de investimento. Suporta soft delete.

| Campo           | Tipo                 | Descrição                             |
| --------------- | -------------------- | ------------------------------------- |
| `id`            | String               | PK (UUID)                             |
| `userId`        | String               |                                       |
| `categoryId`    | String?              | FK para `FinancialCategory` (SetNull) |
| `name`          | String               | Nome da meta                          |
| `target`        | Decimal              | Valor alvo                            |
| `initialAmount` | Decimal              | Valor inicial aportado                |
| `durationValue` | Int                  | Prazo numérico                        |
| `durationUnit`  | Enum `DurationUnit`  | Unidade (`WEEKS`, `MONTHS`)           |
| `style`         | Enum `InvestorStyle` | Perfil (`LOW`, `MEDIUM`, `HIGH`)      |
| `createdAt`     | DateTime             |                                       |
| `updatedAt`     | DateTime             |                                       |
| `deletedAt`     | DateTime?            | Data de exclusão lógica (soft delete) |

> **Índices:** `userId` e `categoryId`.

---

#### `GoalDeposit`

Registros de depósitos realizados para uma meta (1:N com `FinancialGoal`).

| Campo       | Tipo     | Descrição                         |
| ----------- | -------- | --------------------------------- |
| `id`        | String   | PK (UUID)                         |
| `goalId`    | String   | FK para `FinancialGoal` (Cascade) |
| `amount`    | Decimal  | Valor depositado                  |
| `createdAt` | DateTime |                                   |

> **Índices:** `goalId`.

---

#### `GoalProgressSnapshot`

Registra snapshots do progresso total depositado em uma meta ao longo do tempo.

| Campo            | Tipo     | Descrição                         |
| ---------------- | -------- | --------------------------------- |
| `id`             | String   | PK (UUID)                         |
| `goalId`         | String   | FK para `FinancialGoal` (Cascade) |
| `totalDeposited` | Decimal  | Total acumulado na meta           |
| `createdAt`      | DateTime |                                   |

> **Índices:** `[goalId, createdAt]`.

---

### 2. Nutrition

#### `NutritionProfile`

Perfil nutricional do usuário, com dados básicos e preferências.

| Campo             | Tipo     | Descrição                               |
| ----------------- | -------- | --------------------------------------- |
| `id`              | String   | PK (UUID)                               |
| `userId`          | String   | Único por usuário                       |
| `goal`            | String?  | Objetivo (ex.: emagrecer, ganhar massa) |
| `heightCm`        | Int?     | Altura em cm                            |
| `weightKg`        | Decimal? | Peso atual                              |
| `preference`      | String?  | Preferências alimentares                |
| `allergies`       | String?  | Restrições/alergias                     |
| `waterGoalLiters` | Decimal? | Meta diária de água em litros           |
| `createdAt`       | DateTime |                                         |
| `updatedAt`       | DateTime |                                         |

---

#### `Diet`

Armazenamento flexível de dietas em formato **JSON** para o MVP. Futuramente pode ser normalizado.

| Campo       | Tipo     | Descrição                                       |
| ----------- | -------- | ----------------------------------------------- |
| `id`        | String   | PK (UUID)                                       |
| `userId`    | String   |                                                 |
| `name`      | String   | Nome da dieta                                   |
| `structure` | Json     | Estrutura da dieta (refeições, alimentos, etc.) |
| `createdAt` | DateTime |                                                 |
| `updatedAt` | DateTime |                                                 |

> **Índices:** `userId`.

---

#### `Ingredient`

Ingredientes cadastrados pelo usuário, reutilizáveis em receitas.

| Campo       | Tipo     | Descrição           |
| ----------- | -------- | ------------------- |
| `id`        | String   | PK (UUID)           |
| `userId`    | String   |                     |
| `name`      | String   | Nome do ingrediente |
| `createdAt` | DateTime |                     |
| `updatedAt` | DateTime |                     |

> **Constraint:** `@@unique([userId, name])`.
> **Índices:** `userId`.

---

#### `Recipe`

Receitas do usuário, criadas manualmente ou via IA. Os ingredientes são associados via `RecipeIngredient`.

| Campo          | Tipo                | Descrição                  |
| -------------- | ------------------- | -------------------------- |
| `id`           | String              | PK (UUID)                  |
| `userId`       | String              |                            |
| `name`         | String              | Nome da receita            |
| `preparation`  | String              | Modo de preparo            |
| `notes`        | String?             | Observações adicionais     |
| `source`       | Enum `RecipeSource` | Origem (`AI`, `USER`)      |
| `editedByUser` | Boolean             | Se foi editada manualmente |
| `createdAt`    | DateTime            |                            |
| `updatedAt`    | DateTime            |                            |

> **Índices:** `userId`.

---

#### `RecipeIngredient`

Tabela pivô que associa ingredientes a receitas com quantidade em gramas (N:N).

| Campo           | Tipo     | Descrição                           |
| --------------- | -------- | ----------------------------------- |
| `id`            | String   | PK (UUID)                           |
| `recipeId`      | String   | FK para `Recipe` (Cascade)          |
| `ingredientId`  | String   | FK para `Ingredient` (Restrict)     |
| `quantityGrams` | Decimal  | Quantidade do ingrediente em gramas |
| `createdAt`     | DateTime |                                     |

> **Constraint:** `@@unique([recipeId, ingredientId])`.
> **Índices:** `recipeId`.

---

#### `WaterLog`

Registro de consumo de água.

| Campo      | Tipo     | Descrição                |
| ---------- | -------- | ------------------------ |
| `id`       | String   | PK (UUID)                |
| `userId`   | String   |                          |
| `amountMl` | Int      | Quantidade em mililitros |
| `loggedAt` | DateTime | Data/hora do registro    |

> **Índices:** `[userId, loggedAt]`.

---

### 3. Fitness

#### `FitnessProfile`

Perfil físico e objetivos do usuário.

| Campo       | Tipo                 | Descrição                                      |
| ----------- | -------------------- | ---------------------------------------------- |
| `id`        | String               | PK (UUID)                                      |
| `userId`    | String               | Único por usuário                              |
| `goal`      | String?              | Objetivo (ex.: hipertrofia, emagrecimento)     |
| `heightCm`  | Int?                 | Altura em cm                                   |
| `weightKg`  | Decimal?             | Peso atual                                     |
| `injuries`  | String?              | Lesões ou limitações                           |
| `level`     | Enum `FitnessLevel`? | Nível (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`) |
| `createdAt` | DateTime             |                                                |
| `updatedAt` | DateTime             |                                                |

---

#### `WorkoutPlan`

Cabeçalho de um plano de treino.

| Campo       | Tipo     | Descrição     |
| ----------- | -------- | ------------- |
| `id`        | String   | PK (UUID)     |
| `userId`    | String   |               |
| `name`      | String   | Nome do plano |
| `createdAt` | DateTime |               |
| `updatedAt` | DateTime |               |

> **Índices:** `userId`.

---

#### `WorkoutPlanDay`

Dias que compõem um plano de treino.

| Campo           | Tipo           | Descrição                       |
| --------------- | -------------- | ------------------------------- |
| `id`            | String         | PK (UUID)                       |
| `workoutPlanId` | String         | FK para `WorkoutPlan` (Cascade) |
| `weekDay`       | Enum `WeekDay` | Dia da semana                   |

> **Constraint:** `@@unique([workoutPlanId, weekDay])`.
> **Índices:** `workoutPlanId`.

---

#### `WorkoutExercise`

Exercícios de um dia específico do plano.

| Campo              | Tipo    | Descrição                          |
| ------------------ | ------- | ---------------------------------- |
| `id`               | String  | PK (UUID)                          |
| `workoutPlanDayId` | String  | FK para `WorkoutPlanDay` (Cascade) |
| `name`             | String  | Nome do exercício                  |
| `sets`             | Int     | Número de séries previstas         |
| `repsMin`          | Int     | Repetições mínimas                 |
| `repsMax`          | Int     | Repetições máximas                 |
| `restSeconds`      | Int     | Descanso em segundos               |
| `notes`            | String? | Observações                        |

> **Índices:** `workoutPlanDayId`.

---

#### `WorkoutTracking`

Registro de um treino efetivamente realizado.

| Campo              | Tipo     | Descrição                          |
| ------------------ | -------- | ---------------------------------- |
| `id`               | String   | PK (UUID)                          |
| `workoutPlanDayId` | String   | FK para `WorkoutPlanDay` (Cascade) |
| `createdAt`        | DateTime | Data/hora do registro              |

> **Índices:** `[workoutPlanDayId, createdAt]`.

---

#### `WorkoutTrackingExercise`

Detalhes de cada exercício executado no treino registrado.

| Campo               | Tipo     | Descrição                           |
| ------------------- | -------- | ----------------------------------- |
| `id`                | String   | PK (UUID)                           |
| `workoutTrackingId` | String   | FK para `WorkoutTracking` (Cascade) |
| `name`              | String   | Nome do exercício                   |
| `maxWeight`         | Decimal? | Carga máxima utilizada (kg)         |
| `maxSets`           | Int?     | Número de séries realizadas         |
| `maxReps`           | Int?     | Repetições máximas alcançadas       |
| `restSeconds`       | Int?     | Descanso praticado (segundos)       |
| `notes`             | String?  | Observações                         |

> **Índices:** `workoutTrackingId`.

---

#### `WeightLog`

Histórico temporal de peso.

| Campo      | Tipo     | Descrição             |
| ---------- | -------- | --------------------- |
| `id`       | String   | PK (UUID)             |
| `userId`   | String   |                       |
| `weightKg` | Decimal  | Peso em kg            |
| `loggedAt` | DateTime | Data/hora do registro |

> **Índices:** `[userId, loggedAt]`.

---

### 4. Productivity

#### `Task`

Tarefas com classificação por domínio e status.

| Campo           | Tipo              | Descrição                                                   |
| --------------- | ----------------- | ----------------------------------------------------------- |
| `id`            | String            | PK (UUID)                                                   |
| `userId`        | String            |                                                             |
| `title`         | String            | Título da tarefa                                            |
| `domain`        | Enum `Domain`     | Domínio relacionado (`WORK`, `HOBBIES`, `SLEEP`, `LEISURE`) |
| `scheduledDate` | DateTime          | Data programada (Date)                                      |
| `status`        | Enum `TaskStatus` | Situação (`PENDING`, `PARTIAL`, `COMPLETED`, `SKIPPED`)     |
| `createdAt`     | DateTime          |                                                             |
| `updatedAt`     | DateTime          |                                                             |

> **Índices:** `[userId, scheduledDate]` — otimiza consultas por período.

---

### 5. Reports

#### `GeneratedReport`

Registra relatórios gerados por IA associados a um usuário e domínio.

| Campo         | Tipo                      | Descrição                          |
| ------------- | ------------------------- | ---------------------------------- |
| `id`          | String                    | PK (UUID)                          |
| `userId`      | String                    |                                    |
| `domain`      | Enum `AccountabilityArea` | Área do relatório                  |
| `type`        | Enum `ReportType`         | Escopo (`WEEKLY`, `MONTHLY`)       |
| `periodStart` | DateTime                  | Início do período avaliado         |
| `periodEnd`   | DateTime                  | Fim do período avaliado            |
| `metricsJson` | Json                      | Métricas consideradas no relatório |
| `aiSummary`   | String                    | Texto gerado pela IA               |
| `createdAt`   | DateTime                  |                                    |

> **Constraint:** `@@unique([userId, domain, type, periodStart, periodEnd])`.
> **Índices:** `[userId, domain, type]` e `[userId, periodStart]`.

---

## Padrões de Modelagem Aplicados

### 🔹 Estado vs Histórico

Sempre que há evolução temporal relevante, adotamos:

- Tabela de **estado atual** (ex.: `FinanceAccount`, `FitnessProfile`, `NutritionProfile`)
- Tabelas de **histórico** correspondentes (ex.: `FinanceBalanceHistory`, `GoalDeposit`, `WorkoutTracking`, `WeightLog`, `RecurringTransactionExecution`)

---

### 🔹 Soft Delete

Modelos que exigem rastreabilidade ou que possuem constraints de unicidade que precisam ser reutilizadas após exclusão adotam soft delete via `deletedAt`:

- `UserProfile`, `FinancialGoal`, `FinancialCategory`, `VariableExpense`

> **Exemplo prático:** `FinancialCategory` usa `@@unique([userId, name, deletedAt])`, permitindo que um usuário recrie uma categoria com o mesmo nome após excluí-la logicamente.

---

### 🔹 Integridade Referencial

- **Cascade** em entidades fortemente dependentes (ex.: `GoalDeposit` → `FinancialGoal`, `WorkoutExercise` → `WorkoutPlanDay`)
- **Restrict** onde exclusão acidental causaria inconsistência (ex.: `RecipeIngredient` → `Ingredient`)
- **SetNull** para relações opcionais (ex.: `VariableExpense` → `FinancialCategory`)

---

### 🔹 Indexação Estratégica

Índices compostos criados principalmente em:

- `userId` + coluna de data (`createdAt`, `expenseDate`, `scheduledDate`, `loggedAt`, `nextOccurrence`)
- Chaves estrangeiras para consultas por relacionamento

Objetivo: acelerar consultas por período e dashboards.

---

### 🔹 Normalização Gradual

Alguns modelos foram mantidos simples no MVP (ex.: `Diet` com JSON) para agilizar o desenvolvimento, mas com estrutura para evolução futura (ex.: `Ingredient` e `RecipeIngredient` já normalizados).

---

## Estrutura da Aplicação (Contexto do Banco de Dados)

```
accountability-backend/
├── DB-docs/
│   ├── DB_README.md
│   └── erd.png
├── prisma/
│   ├── migrations/
│   │   ├── 20260228180831_init_base/
│   │   ├── 20260228235424_refactor_auth_alignment/
│   │   ├── 20260301113844_domain_models/
│   │   ├── 20260305133516_report/
│   │   ├── 20260310174413_userprofile_nullable/
│   │   ├── 20260310174516_userprofile_trigger/
│   │   ├── 20260310193226_add_foreign_keys/
│   │   ├── 20260319161142_refactor_transactions/
│   │   ├── 20260321174811_statement/
│   │   ├── 20260322184331_atribute_default_category/
│   │   ├── 20260326161336_alter_balance_change_type_enum/
│   │   ├── 20260330162557_reason_enum/
│   │   ├── 20260331093736_update_balance_change_type/
│   │   ├── 20260331120511_remove_deposit_date/
│   │   ├── 20260331153256_goal_soft_delete/
│   │   ├── 20260331155756_reason_enum_soft_delete/
│   │   ├── 20260401142831_deleted_at_expense/
│   │   ├── 20260401173629_soft_delete_for_financial_categories/
│   │   └── 20260401173831_alter_index_financial_category/
│   └── schema.prisma
├── src/
│   ├── @types/
│   │   └── express.d.ts
│   ├── config/
│   │   └── env.ts
│   ├── core/
│   ├── docs/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── supabase.ts
│   ├── middlewares/
│   ├── modules/
│   │   ├── finance/
│   │   ├── gym/
│   │   ├── nutrition/
│   │   ├── productivity/
│   │   └── user/
│   │
│   ├── shared/
│   ├── app.ts
│   ├── server.ts
│   └── swagger.ts
├── tests/
│   ├── integration/
│   └── unit/
│
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

---

## Identidade e Autenticação

O banco não possui tabela própria de usuários para autenticação. Mas sim, um modelo `UserProfile` que armazena dados complementares do perfil do usuário autenticado via Supabase.

O `userId` presente em todos os modelos corresponde ao id do user profile que é associado ao id do usuário autenticado no Supabase Auth. Ao gerar um registro na tabela users do Supabase, um trigger é acionado para criar automaticamente um `UserProfile` correspondente no banco, utilizando o mesmo UUID. Isso garante que todas as referências de usuário nas tabelas do domínio estejam alinhadas com a autenticação do Supabase, evitando inconsistências e simplificando a gestão de identidade.

### Vantagens

- Evita duplicação de identidade
- Simplifica sincronização
- Mantém autenticação desacoplada do domínio

---

## Decisões Arquiteturais Importantes

- UUID como chave primária (escalabilidade e segurança)
- Separação clara de domínios
- Normalização moderada: algumas entidades são mantidas simples (ex.: `Diet` com JSON) para agilizar o MVP, enquanto outras já estão normalizadas (ex.: `Ingredient` e `RecipeIngredient`)
- Soft delete para entidades críticas (`UserProfile`, `FinancialGoal`, `FinancialCategory`, `VariableExpense`)
- Histórico explícito para entidades críticas (saldos, execuções de transações recorrentes, depósitos em metas, treinos executados, peso)
- Enumerações para campos controlados (status, domínios, níveis, dias da semana, tipos de transação)
- Prisma como camada de persistência

---

## Considerações Finais

A modelagem do banco foi guiada por:

- Clareza estrutural
- Evolução controlada
- Integridade dos dados
- Separação entre estado e histórico
- Simplicidade suficiente para MVP, mas base sólida para escalar e evoluir com novas features e complexidades futuras.

---
