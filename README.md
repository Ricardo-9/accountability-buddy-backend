# My Accountability Buddy — Backend

> API REST para uma plataforma de accountability cobrindo finanças, fitness, nutrição e produtividade.

---

## Sobre

**My Accountability Buddy** é uma API backend construída como projeto de trabalho e portfólio, desenvolvida durante estágio na Lua Soft. O objetivo é ajudar usuários a acompanhar e manter accountability em quatro domínios da vida — Finanças, Fitness, Nutrição e Produtividade — por meio de dados estruturados, acompanhamento de metas e relatórios gerados por IA (implementação futura).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Linguagem | TypeScript |
| Framework | Express |
| ORM | Prisma |
| Banco de dados | PostgreSQL (Supabase) |
| Autenticação | Supabase Auth (JWT via JWKS / `jose`) |
| Validação | Zod |
| Documentação | Swagger / OpenAPI (JSDoc) |
| Testes | Vitest + Supertest |

---

## Arquitetura

O projeto segue uma **arquitetura em camadas** estrita com separação clara de responsabilidades:
```
Request → Router → Middleware → Controller → Service → Repository → Database
```

- **Router** — define os endpoints e aplica as cadeias de middleware
- **Middleware** — autenticação, controle de acesso por área, validação de requisições, rate limiting e tratamento de erros
- **Controller** — trata o request/response HTTP e delega a lógica para os services
- **Service** — lógica de negócio, tratamento de erros e orquestração
- **Repository** — acesso ao banco via Prisma, com transações atômicas onde necessário

Todos os módulos em `src/modules/` seguem esse padrão.

---

## Estrutura do Projeto
```
src/
├── @types/            # Extensões de tipo do Express (req.user)
├── config/            # Variáveis de ambiente
├── core/              # AppError, rota de health check
├── docs/              # Anotações JSDoc do Swagger por módulo
├── lib/               # Clientes Prisma e Supabase
├── middlewares/       # Auth, validateRequest, requireArea, errorHandler, rateLimit
├── modules/
│   ├── finance/       # Domínio financeiro (Em implementação)
│   ├── user/          # Auth, perfil, áreas
│   ├── gym/           # Apenas scaffold
│   ├── nutrition/     # Apenas scaffold
│   └── productivity/  # Apenas scaffold
├── shared/utils/      # Helper apiResponse
├── app.ts
├── server.ts
└── swagger.ts
```

---

## Autenticação e Autorização

- A autenticação é totalmente delegada ao **Supabase Auth**
- Toda requisição é validada via JWT usando `jose` + endpoint JWKS do Supabase
- O middleware `authenticate` extrai o ID do usuário do token e o anexa ao `req.user`
- O middleware `requireArea` verifica se o usuário possui acesso registrado ao domínio relevante (ex.: `FINANCES`) antes de atingir o controller

## Detalhes Técnicos Relevantes

### Transações Atômicas

Todas as operações sensíveis ao saldo rodam em uma única `prisma.$transaction`, garantindo que o registro da despesa/meta e a atualização do saldo sejam realizados juntos ou nenhum dos dois. Isso é gerenciado pelo helper `adjustBalanceWithTx`, reutilizado nos fluxos de criação, atualização e exclusão.

### Lógica de Saldo em Despesas Variáveis

Ao atualizar o valor de uma despesa, o service calcula a **diferença** entre o valor antigo e o novo, ajustando o saldo apenas pela diferença — não pelo novo valor completo. Exemplo: despesa era R$50, atualizada para R$80 → saldo é decrementado em R$30.

### Zod 

Schemas de atualização parcial utilizam `Object.assign` na camada de repository para montar o payload de update dinamicamente, evitando erros do TypeScript causados por campos `undefined` sendo passados ao Prisma.

### Soft Delete

`FinancialGoal`, `FinancialCategory` e `VariableExpense` utilizam soft delete via `deletedAt`. A constraint de unicidade de `FinancialCategory` inclui `deletedAt` — `@@unique([userId, name, deletedAt])` — permitindo que o mesmo nome de categoria seja recriado após exclusão lógica.

### Middleware — validateRequest

Um único middleware genérico trata a validação Zod para `body`, `params` e `query`. Utiliza `Object.defineProperty` para reatribuir `req.params` e `req.query`, que são somente leitura no Express, após a validação.

---

## Testes

O projeto possui duas camadas de testes:

**Testes unitários** (Vitest) cobrem todos os métodos de service com repositories mockados, incluindo happy paths, erros de not found, violações de constraints do Prisma e rethrow de erros desconhecidos.

**Testes de integração** (Vitest + Supertest) testam todos os endpoints de ponta a ponta com services e middlewares mockados, cobrindo status codes, formato das respostas, erros de validação, falhas de autenticação, erros de permissão por área e cenários de falha no banco de dados.
```
tests/
├── unit/services/
│   ├── finance/
│   │   ├── financial-categories/
│   │   ├── financial-core/
│   │   ├── financial-goals/
│   │   └── financial-variable-expenses/
│   └── user/
└── integration/routes/
    ├── finance/
    │   ├── financial-categories/
    │   ├── financial-core/
    │   ├── financial-goals/
    │   └── financial-variable-expenses/
    └── user/
```

---

## Variáveis de Ambiente
```bash
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=
```

Consulte o `.env.example` como referência.

---

## Rodando Localmente
```bash
# Instalar dependências
npm install

# Executar migrations
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev

# Executar testes
npm run test
```

A documentação da API está disponível em `/api-docs` após iniciar o servidor.

---

## Status

O **domínio de Finanças** é o domínio principal a ser implementado, incluindo gerenciamento de conta, histórico de saldo, categorias financeiras, despesas variáveis e metas financeiras com depósitos. Os demais domínios (Gym, Nutrição, Produtividade) possuem seus modelos de banco de dados e scaffold de rotas estruturados, prontos para implementação das features.

---

## Desenvolvedores

**Ricardo Rocha Alves e Kaiky Rodrigues de Oliveira** — Estagiários na Lua Soft | Estudantes de Engenharia de Software na UFCA (Universidade Federal do Cariri) 