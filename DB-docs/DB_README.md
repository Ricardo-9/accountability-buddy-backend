#  My Accountability Buddy — Banco de Dados

##  Visão Geral

Este documento descreve o schema do banco de dados do projeto **My Accountability Buddy**, incluindo decisões de modelagem, relacionamentos, padrões adotados e justificativas técnicas.

- **Banco de dados:** PostgreSQL  
- **Gerenciamento:** Prisma ORM  
- **Autenticação:** Delegada ao Supabase (UUID do usuário como referência)

###  Objetivos do Schema

- Clareza estrutural  
- Separação de estado atual vs histórico  
- Integridade referencial consistente  
- Escalabilidade sem complexidade desnecessária  

---

##  Arquitetura Geral

O banco está dividido em quatro domínios principais, todos vinculados ao `userId` fornecido pelo Supabase:

-  **Finance**  
-  **Nutrition**  
-  **Fitness**  
-  **Productivity**

Além desses, existem modelos auxiliares que armazenam dados complementares do perfil do usuário e suas áreas de interesse.

---

###  Diagrama Entidade-Relacionamento (ERD)

O diagrama completo, utilizado como base para a modelagem no Prisma, está disponível em:  
📁 `DB/erd.png`

> Em ambiente real, a entidade de usuário é mantida apenas no Supabase. O modelo `UserProfile` no schema representa dados adicionais do perfil, não a autenticação em si.

---

##  Estrutura por Domínio

### 0. Perfil e Áreas do Usuário

#### `UserProfile`
Armazena informações complementares do usuário autenticado via Supabase.

| Campo       | Tipo      | Descrição                          |
|-------------|-----------|------------------------------------|
| `id`        | String    | Mesmo ID do Supabase Auth (PK)     |
| `fullName`  | String    | Nome completo                      |
| `birthDate` | DateTime  | Data de nascimento (Date)          |
| `phone`     | String?   | Telefone para contato              |
| `createdAt` | DateTime  | Data de criação                    |
| `updatedAt` | DateTime  | Última atualização                 |

---

#### `UserArea`
Associa o usuário a uma ou mais áreas de accountability, permitindo personalização do app.

| Campo       | Tipo                     | Descrição                                      |
|-------------|--------------------------|------------------------------------------------|
| `id`        | String                   | PK (UUID)                                      |
| `userId`    | String                   | FK implícita para Supabase                     |
| `area`      | Enum `AccountabilityArea`| Área de interesse (`GYM`, `NUTRITION`, `FINANCES`, `PRODUCTIVITY`) |
| `createdAt` | DateTime                 |                                                |
| `updatedAt` | DateTime                 |                                                |

> **Constraint:** `@@unique([userId, area])` – cada área pode ser associada apenas uma vez por usuário.

---

### 1.  Finance

#### `FinanceAccount`
Armazena o saldo atual consolidado do usuário.

| Campo       | Tipo      | Descrição                          |
|-------------|-----------|------------------------------------|
| `id`        | String    | PK (UUID)                          |
| `userId`    | String    | Único por usuário                  |
| `balance`   | Decimal   | Saldo atual                        |
| `createdAt` | DateTime  |                                    |
| `updatedAt` | DateTime  |                                    |

> **Justificativa:** Manter o estado atual separado do histórico otimiza consultas em dashboards. O histórico de evolução do saldo é armazenado em `FinanceBalanceHistory`.

---

#### `FinanceBalanceHistory`
Registra snapshots do saldo ao longo do tempo.

| Campo       | Tipo      | Descrição                     |
|-------------|-----------|-------------------------------|
| `id`        | String    | PK (UUID)                     |
| `userId`    | String    |                               |
| `balance`   | Decimal   | Saldo na data do snapshot     |
| `createdAt` | DateTime  | Data do registro              |

> **Índices:** `[userId, createdAt]` para consultas temporais eficientes.

---

#### `FinancialCategory`
Categorias personalizadas para despesas e metas financeiras.

| Campo       | Tipo      | Descrição                       |
|-------------|-----------|---------------------------------|
| `id`        | String    | PK (UUID)                       |
| `userId`    | String    |                                 |
| `name`      | String    | Nome da categoria               |
| `createdAt` | DateTime  |                                 |
| `updatedAt` | DateTime  |                                 |

> **Constraint:** `@@unique([userId, name])` – evita duplicidade lógica por usuário.

---

#### `FixedExpense`
Despesas fixas mensais, opcionalmente categorizadas.

| Campo           | Tipo      | Descrição                         |
|-----------------|-----------|-----------------------------------|
| `id`            | String    | PK (UUID)                         |
| `userId`        | String    |                                   |
| `categoryId`    | String?   | FK para `FinancialCategory` (SetNull) |
| `name`          | String    | Nome da despesa                   |
| `monthlyAmount` | Decimal   | Valor mensal fixo                 |
| `createdAt`     | DateTime  |                                   |
| `updatedAt`     | DateTime  |                                   |

> **Índices:** `userId` e `categoryId`.

---

#### `VariableExpense`
Despesas variáveis, registradas individualmente, com categoria opcional.

| Campo         | Tipo      | Descrição                         |
|---------------|-----------|-----------------------------------|
| `id`          | String    | PK (UUID)                         |
| `userId`      | String    |                                   |
| `categoryId`  | String?   | FK para `FinancialCategory` (SetNull) |
| `name`        | String    | Nome da despesa                   |
| `amount`      | Decimal   | Valor                             |
| `expenseDate` | DateTime  | Data da despesa (Date)            |
| `createdAt`   | DateTime  |                                   |
| `updatedAt`   | DateTime  |                                   |

> **Índices:** `[userId, expenseDate]` e `categoryId`.

---

#### `FinancialGoal`
Metas financeiras, com prazo e perfil de investimento, podendo ser categorizadas.

| Campo           | Tipo               | Descrição                         |
|-----------------|--------------------|-----------------------------------|
| `id`            | String             | PK (UUID)                         |
| `userId`        | String             |                                   |
| `categoryId`    | String?            | FK para `FinancialCategory` (SetNull) |
| `name`          | String             | Nome da meta                      |
| `target`        | Decimal            | Valor que deve ser obtido         |
| `durationValue` | Int                | Prazo numérico                    |
| `durationUnit`  | Enum `DurationUnit`| Unidade (`WEEKS`, `MONTHS`)       |
| `style`         | Enum `InvestorStyle`| Perfil (`LOW`, `MEDIUM`, `HIGH`) |
| `initialAmount` | Decimal            | Valor inicial                     |
| `createdAt`     | DateTime           |                                   |
| `updatedAt`     | DateTime           |                                   |

> **Índices:** `userId` e `categoryId`.

---

#### `GoalDeposit`
Registros de depósitos realizados para uma meta (relacionamento 1:N com `FinancialGoal`).

| Campo         | Tipo      | Descrição                       |
|---------------|-----------|---------------------------------|
| `id`          | String    | PK (UUID)                       |
| `goalId`      | String    | FK para `FinancialGoal` (Cascade) |
| `amount`      | Decimal   | Valor depositado                |
| `depositDate` | DateTime  | Data do depósito (Date)         |
| `createdAt`   | DateTime  |                                 |

---

> **Índices:** `[goalId, depositDate]`.

#### `Income`
Ganhos fixos mensais categorizados pela origem (salário, freelancer, etc).

| Campo         | Tipo      | Descrição                       |
|---------------|-----------|---------------------------------|
| `id`          | String    | PK (UUID)                       |
| `userId`      | String    |                                 |
| `amount`      | Decimal   | Valor mensal fixo               |
| `source`      | String    | Origem da receita mensal        |
| `createdAt`   | DateTime  |                                 |
| `updatedAt`   | DateTime  |                                 |

---

#### `GoalProgressSnapshot`
Registra snapshots do progresso do usuário ao longo do tempo.

| Campo            | Tipo      | Descrição                       |
|------------------|-----------|---------------------------------|
| `id`             | String    | PK (UUID)                       |
| `goalId`         | String    | FK para `FinancialGoal` (Cascade) |
| `totalDeposited` | Decimal   | Total depositado na "poupança" de uma meta |
| `createdAt`      | DateTime  |                                 |

> **Índices:** `[userId, createdAt]`.
---

### 2.  Nutrition

#### `NutritionProfile`
Perfil nutricional do usuário, com dados básicos e preferências.

| Campo              | Tipo      | Descrição                               |
|--------------------|-----------|-----------------------------------------|
| `id`               | String    | PK (UUID)                               |
| `userId`           | String    | Único por usuário                       |
| `goal`             | String?   | Objetivo (ex.: emagrecer, ganhar massa) |
| `heightCm`         | Int?      | Altura em cm                            |
| `weightKg`         | Decimal?  | Peso atual                              |
| `preference`       | String?   | Preferências alimentares                |
| `allergies`        | String?   | Restrições/alergias                     |
| `waterGoalLiters`  | Decimal?  | Meta diária de água em litros           |
| `createdAt`        | DateTime  |                                         |
| `updatedAt`        | DateTime  |                                         |

---

#### `Diet`
Armazenamento flexível de dietas em formato **JSON** para o MVP. Futuramente pode ser normalizado.

| Campo       | Tipo      | Descrição                              |
|-------------|-----------|----------------------------------------|
| `id`        | String    | PK (UUID)                              |
| `userId`    | String    |                                        |
| `name`      | String    | Nome da dieta                          |
| `structure` | Json      | Estrutura da dieta (refeições, alimentos, etc.) |
| `createdAt` | DateTime  |                                        |
| `updatedAt` | DateTime  |                                        |

> **Índices:** `userId`.

---

#### `Ingredient`
Ingredientes cadastrados pelo usuário, reutilizáveis em receitas.

| Campo       | Tipo      | Descrição                    |
|-------------|-----------|------------------------------|
| `id`        | String    | PK (UUID)                    |
| `userId`    | String    |                              |
| `name`      | String    | Nome do ingrediente          |
| `createdAt` | DateTime  |                              |
| `updatedAt` | DateTime  |                              |

> **Constraint:** `@@unique([userId, name])` – garante consistência.  
> **Índices:** `userId`.

---

#### `Recipe`
Receitas do usuário, que podem ser criadas manualmente ou via IA.

| Campo           | Tipo               | Descrição                          |
|-----------------|--------------------|------------------------------------|
| `id`            | String             | PK (UUID)                          |
| `userId`        | String             |                                    |
| `name`          | String             | Nome da receita                    |
| `ingredients`   | String             | Descrição textual dos ingredientes |
| `preparation`   | String             | Modo de preparo                    |
| `notes`         | String?            | Observações adicionais             |
| `source`        | Enum `RecipeSource`| Origem (`AI` ou `USER`)            |
| `editedByUser`  | Boolean            | Se foi editada manualmente         |
| `createdAt`     | DateTime           |                                    |
| `updatedAt`     | DateTime           |                                    |

> **Relacionamento:** Uma receita pode ter vários `RecipeIngredient` (ingredientes estruturados).  
> **Índices:** `userId`.

---

#### `RecipeIngredient`
Tabela pivô que associa ingredientes a receitas com quantidade em gramas (relacionamento N:N).

| Campo           | Tipo      | Descrição                               |
|-----------------|-----------|-----------------------------------------|
| `id`            | String    | PK (UUID)                               |
| `recipeId`      | String    | FK para `Recipe` (Cascade)              |
| `ingredientId`  | String    | FK para `Ingredient` (Restrict)         |
| `quantityGrams` | Decimal   | Quantidade do ingrediente em gramas     |
| `createdAt`     | DateTime  |                                         |

> **Constraint:** `@@unique([recipeId, ingredientId])` – evita duplicidade na mesma receita.  
> **Índices:** `recipeId`.

---

#### `WaterLog`
Registro de consumo de água.

| Campo       | Tipo      | Descrição                        |
|-------------|-----------|----------------------------------|
| `id`        | String    | PK (UUID)                        |
| `userId`    | String    |                                  |
| `amountMl`  | Int       | Quantidade em mililitros         |
| `loggedAt`  | DateTime  | Data/hora do registro            |

> **Índices:** `[userId, loggedAt]`.

---

### 3.  Fitness

#### `FitnessProfile`
Perfil físico e objetivos do usuário.

| Campo       | Tipo                  | Descrição                               |
|-------------|-----------------------|-----------------------------------------|
| `id`        | String                | PK (UUID)                               |
| `userId`    | String                | Único por usuário                       |
| `goal`      | String?               | Objetivo (ex.: hipertrofia, emagrecimento) |
| `heightCm`  | Int?                  | Altura em cm                            |
| `weightKg`  | Decimal?              | Peso atual                              |
| `injuries`  | String?               | Lesões ou limitações                    |
| `level`     | Enum `FitnessLevel`?  | Nível (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`) |
| `createdAt` | DateTime              |                                         |
| `updatedAt` | DateTime              |                                         |

---

#### `WorkoutPlan`
Cabeçalho de um plano de treino.

| Campo       | Tipo      | Descrição          |
|-------------|-----------|--------------------|
| `id`        | String    | PK (UUID)          |
| `userId`    | String    |                    |
| `name`      | String    | Nome do plano      |
| `createdAt` | DateTime  |                    |
| `updatedAt` | DateTime  |                    |

> **Índices:** `userId`.

---

#### `WorkoutPlanDay`
Dias que compõem um plano de treino.

| Campo            | Tipo           | Descrição                       |
|------------------|----------------|---------------------------------|
| `id`             | String         | PK (UUID)                       |
| `workoutPlanId`  | String         | FK para `WorkoutPlan` (Cascade) |
| `weekDay`        | Enum `WeekDay` | Dia da semana                   |

> **Constraint:** `@@unique([workoutPlanId, weekDay])` – garante um único dia por plano.  
> **Índices:** `workoutPlanId`.

---

#### `WorkoutExercise`
Exercícios de um dia específico do plano.

| Campo               | Tipo      | Descrição                          |
|---------------------|-----------|------------------------------------|
| `id`                | String    | PK (UUID)                          |
| `workoutPlanDayId`  | String    | FK para `WorkoutPlanDay` (Cascade) |
| `name`              | String    | Nome do exercício                  |
| `sets`              | Int       | Número de séries previstas         |
| `repsMin`           | Int       | Repetições mínimas                 |
| `repsMax`           | Int       | Repetições máximas                 |
| `restSeconds`       | Int       | Descanso em segundos               |
| `notes`             | String?   | Observações                        |

> **Índices:** `workoutPlanDayId`.

---

#### `WorkoutTracking`
Registro de um treino efetivamente realizado em um determinado dia.

| Campo               | Tipo      | Descrição                          |
|---------------------|-----------|------------------------------------|
| `id`                | String    | PK (UUID)                          |
| `workoutPlanDayId`  | String    | FK para `WorkoutPlanDay` (Cascade) |
| `createdAt`         | DateTime  | Data/hora do registro              |

> **Índices:** `[workoutPlanDayId, createdAt]`.

---

#### `WorkoutTrackingExercise`
Detalhes de cada exercício executado no treino registrado.

| Campo                 | Tipo      | Descrição                          |
|-----------------------|-----------|------------------------------------|
| `id`                  | String    | PK (UUID)                          |
| `workoutTrackingId`   | String    | FK para `WorkoutTracking` (Cascade)|
| `name`                | String    | Nome do exercício                  |
| `maxWeight`           | Decimal?  | Carga máxima utilizada (kg)        |
| `maxSets`             | Int?      | Número de séries realizadas        |
| `maxReps`             | Int?      | Repetições máximas alcançadas      |
| `restSeconds`         | Int?      | Descanso praticado (segundos)      |
| `notes`               | String?   | Observações                        |

> **Índices:** `workoutTrackingId`.

---

#### `WeightLog`
Histórico temporal de peso.

| Campo       | Tipo      | Descrição                    |
|-------------|-----------|------------------------------|
| `id`        | String    | PK (UUID)                    |
| `userId`    | String    |                              |
| `weightKg`  | Decimal   | Peso em kg                   |
| `loggedAt`  | DateTime  | Data/hora do registro        |

> **Índices:** `[userId, loggedAt]`.

---

### 4.  Productivity

#### `Task`
Tarefas com classificação por domínio e status.

| Campo           | Tipo               | Descrição                                   |
|-----------------|--------------------|---------------------------------------------|
| `id`            | String             | PK (UUID)                                   |
| `userId`        | String             |                                             |
| `title`         | String             | Título da tarefa                            |
| `domain`        | Enum `Domain`      | Domínio relacionado (`WORK`, `HOBBIES`, `SLEEP`, `LEISURE`) |
| `scheduledDate` | DateTime           | Data programada (Date)                      |
| `status`        | Enum `TaskStatus`  | Situação (`PENDING`, `PARTIAL`, `COMPLETED`, `SKIPPED`) |
| `createdAt`     | DateTime           |                                             |
| `updatedAt`     | DateTime           |                                             |

> **Índices:** `[userId, scheduledDate]` – otimiza consultas por período.

---

### 5.  Reports

#### `GeneratedReport`
Registra os relatórios associados a um usuário

| Campo        | Tipo                       | Descrição                    |
|--------------|----------------------------|------------------------------|
| `id`         | String                     | PK (UUID)                    |
| `userId`     | String                     |                              |
| `domain`     | Enum `AccountabilityArea`  | Area do relatório (`GYM`, `NUTRITION`, `FINANCES`, `PRODUCTIVITY`) |
| `type`       | Enum `ReportType`          | Escopo do relatório (semanal ou mensal) |
| `periodStart`| DateTime                   | Início do período avaliado (YYYY-MM-DD) |
| `periodEnd`  | DateTime                   | Fim do período avaliado (YYYY-MM-DD) |
| `metricsJson`| Json                       | Métricas consideradas no relatório |
| `aiSummary`  | String                     | Texto gerado pela IA         |
| `createdAt`  | DateTime                   |                              |

> **Constraint:** `@@unique([userId, domain, type, periodStart, periodEnd])` – garante que não existam dois relatórios de uma mesma área em um mesmo intervalo de tempo
> **Índices:** `[userId, domain, type]`, `[userId, periodStart]`

---

##  Padrões de Modelagem Aplicados

### 🔹 Estado vs Histórico
Sempre que há evolução temporal relevante, adotamos:

- Tabela de **estado atual** (ex.: `FinanceAccount`, `FitnessProfile`, `NutritionProfile`)
- Tabelas de **histórico** correspondentes (ex.: `FinanceBalanceHistory`, `GoalDeposit`, `WorkoutTracking`, `WeightLog`)

---

### 🔹 Integridade Referencial
- **Cascade** em entidades fortemente dependentes (ex.: `WorkoutExercise` em relação a `WorkoutPlanDay`, `GoalDeposit` em relação a `FinancialGoal`)
- **Restrict** onde exclusão acidental causaria inconsistência (ex.: `RecipeIngredient` em relação a `Ingredient`)
- **SetNull** para relações opcionais (ex.: `FixedExpense` em relação a `FinancialCategory`)

---

### 🔹 Indexação Estratégica
Índices compostos criados principalmente em:
- `userId` + coluna de data (`createdAt`, `expenseDate`, `scheduledDate`, `loggedAt`)
- Chaves estrangeiras para consultas por relacionamento

Objetivo: acelerar consultas por período e dashboards.

---

### 🔹 Normalização Gradual
Alguns modelos foram mantidos simples no MVP (ex.: `Diet` com JSON) para agilizar o desenvolvimento, mas com estrutura para evolução futura (ex.: `Ingredient` e `RecipeIngredient` já normalizados).

---

##  Estrutura da Aplicação Relacionada

A arquitetura reflete os domínios do banco:

# File Tree: (apenas os arquivos relevantes para o banco de dados estão listados)


```
├── 📁 DB-docs
│   ├── 📄 erd.png
│   └── 📝 DB_README.md
├── 📁 generated
├── 📁 prisma
│   ├── 📁 migrations
│   │   ├── 📁 20260228180831_init_base
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260228235424_refactor_auth_alignment
│   │   │   └── 📄 migration.sql
│   │   ├── 📁 20260301113844_domain_models
│   │   │   └── 📄 migration.sql
│   │   └── ⚙️ migration_lock.toml
│   └── 📄 schema.prisma
├── 📁 src
│   
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📝 DB_README.md
├── 📝 README.md
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 prisma.config.ts
└── ⚙️ tsconfig.json
```

---


##  Identidade e Autenticação
O banco não possui tabela própria de usuários para autenticação.
O userId presente em todos os modelos corresponde ao UUID do usuário autenticado via Supabase Auth.
O modelo UserProfile existe apenas para armazenar dados complementares do perfil (nome, data de nascimento, etc.), mantendo a identidade estritamente no Supabase.

---

### Vantagens:

- Evita duplicação de identidade

- Simplifica sincronização

- Mantém autenticação desacoplada do domínio

---

## Decisões Arquiteturais Importantes
- UUID como chave primária (escalabilidade e segurança)

- Separação clara de domínios

- Normalização moderada: algumas entidades são mantidas simples (ex.: Diet com JSON) para agilizar o MVP, enquanto outras já estão normalizadas (ex.: Ingredient e RecipeIngredient)

- Histórico explícito para entidades críticas (metas, saldos, treinos executados, peso)

- Enumerações para campos controlados (status, domínios, níveis, dias da semana)

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