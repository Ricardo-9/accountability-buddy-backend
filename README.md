#  My Accountability Buddy - Estrutura do Backend
A arquitetura do backend foi estruturada com foco em *modularização por domínio, **separação explícita de responsabilidades (SRP)* e *escalabilidade horizontal por modules/features*.  

A organização segue um padrão de camadas (Controller → Service → Repository), mantendo o domínio isolado da infraestrutura sempre que possível.

---

##  Estrutura de Diretórios



├── 📁 DB-docs
|   ├── 📄 erd.png
|   └── 📝 DB_README.md
├── 📁 generated
├── 📁 prisma
│   └── 📄 schema.prisma
├── 📁 src
│   ├── 📁 config
│   │   └── 📄 env.ts
│   ├── 📁 core
│   │   ├── 📁 errors
│   │   └── 📁 http
│   ├── 📁 lib
│   │   └── 📄 prisma.ts
│   ├── 📁 middlewares
│   ├── 📁 modules
│   │   ├── 📁 finance
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 repositories
│   │   │   ├── 📁 schemas
│   │   │   ├── 📁 services
│   │   │   ├── 📄 routes.ts
│   │   │   └── 📄 types.ts
│   │   ├── 📁 gym
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 repositories
│   │   │   ├── 📁 schemas
│   │   │   ├── 📁 services
│   │   │   ├── 📄 routes.ts
│   │   │   └── 📄 types.ts
│   │   ├── 📁 nutrition
│   │   │   ├── 📁 controllers
│   │   │   ├── 📁 repositories
│   │   │   ├── 📁 schemas
│   │   │   ├── 📁 services
│   │   │   ├── 📄 routes.ts
│   │   │   └── 📄 types.ts
│   │   └── 📁 productivity
│   │       ├── 📁 controllers
│   │       ├── 📁 repositories
│   │       ├── 📁 schemas
│   │       ├── 📁 services
│   │       ├── 📄 routes.ts
│   │       └── 📄 types.ts
│   ├── 📁 shared
│   │   ├── 📁 types
│   │   └── 📁 utils
│   ├── 📄 app.ts
│   └── 📄 server.ts
├── 📁 tests
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 prisma.config.ts
└── ⚙️ tsconfig.json


---

---

#  Princípios Arquiteturais

##  Modularização por Domínio (Feature-based Structure)

Cada domínio de negócio (finance, gym, nutrition, productivity) é isolado dentro de src/modules.

Essa abordagem:

- Reduz acoplamento entre features
- Facilita manutenção e refatoração
- Permite evolução independente por domínio
- Escala melhor que estruturas baseadas apenas em camadas globais

Cada módulo contém *tudo que pertence àquela feature*, evitando dispersão de código pelo projeto.

---

##  Arquitetura em Camadas (Layered Architecture)

Dentro de cada domínio:

### *Controllers*
Responsáveis por:
- Receber requisições HTTP
- Validar entrada (via schemas)
- Delegar execução para services
- Retornar respostas padronizadas

> Não contém regra de negócio.

---

### *Services*
Camada de aplicação.
Responsável por:
- Orquestrar regras de negócio
- Coordenar múltiplos repositórios
- Aplicar validações de domínio
- Garantir consistência transacional

> Aqui vive a lógica do sistema.

---

### *Repositories*
Camada de acesso a dados.
Responsável por:
- Interação com o banco via Prisma
- Queries, persistência e leitura
- Abstração da camada de infraestrutura

> Não deve conter regra de negócio.

---

### *Schemas*
- Validação de dados de entrada
- Normalização de payload
- Segurança contra dados inválidos

---

### *Routes*
- Mapeamento de endpoints
- Associação entre rota e controller
- Definição de prefixos por domínio

---

### *Types*
- Interfaces e tipos específicos do módulo
- DTOs
- Tipagem de contratos internos

---

#  Estrutura Global (src)

## config/
Centraliza configurações da aplicação:
- Variáveis de ambiente
- Validação de env vars
- Configurações globais (ex: porta, URLs externas)

---

## core/
Componentes estruturais reutilizáveis:

- errors/ → classes de erro customizadas e padronização de exceptions
- http/ → abstrações ou utilitários HTTP

Representa a base técnica compartilhada da aplicação.

---

## lib/
Integrações com bibliotecas externas.

Exemplo:
- prisma.ts → instanciação única do Prisma Client (Singleton pattern)

Evita múltiplas conexões e centraliza dependências externas.

---

## middlewares/
Middlewares globais:
- Autenticação
- Logging
- Tratamento de erro
- Rate limiting
- Segurança

Separam preocupações transversais.

---

## shared/
Código compartilhado entre domínios:

- types/ → Tipos globais
- utils/ → Funções utilitárias reutilizáveis

Reduz duplicação e melhora consistência.

---

#  Banco de Dados e Prisma

## prisma/
Contém:
- schema.prisma
- Definição do modelo de dados
- Mapeamento ORM

Responsável por gerar o client utilizado nos repositórios.

---

## generated/
Arquivos gerados automaticamente pelo Prisma.
Não devem ser editados manualmente.

---

## DB-docs/
Documentação estrutural do banco:
- erd.png → Diagrama Entidade-Relacionamento
- Documentação complementar em DB_README.md

Separação clara entre código e documentação de modelagem.

---

#  Testes

## tests/
Conterá toda a suíte de testes da aplicação:
- Testes unitários
- Testes de integração
- Mocks e factories (quando aplicável)

Mantidos fora de src para preservar clareza estrutural.

---

#  Bootstrap da Aplicação

## app.ts
- Configuração do Express
- Registro de middlewares
- Registro de rotas
- Setup global da aplicação

---

## server.ts
- Responsável exclusivamente por iniciar o servidor
- Executa app.listen
- Separa configuração da aplicação da inicialização do processo

---

#  Objetivo da Estrutura

Essa organização foi projetada para:

- Facilitar manutenção de médio e longo prazo
- Permitir escalabilidade por domínio
- Reduzir acoplamento estrutural
- Tornar o projeto mais próximo de padrões utilizados em ambientes profissionais
- Melhorar legibilidade e navegabilidade do código

---