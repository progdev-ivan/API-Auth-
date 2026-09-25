# 🔐 API Auth

API de autenticação desenvolvida com **Node.js, TypeScript, Express, Prisma e PostgreSQL**, seguindo princípios de organização em camadas, Programação Orientada a Objetos (POO) e boas práticas de desenvolvimento de APIs REST com autenticação via JWT e gerenciamento de sessões seguras com Refresh Token Rotation.

> 🚧 **Projeto em desenvolvimento**
>
> Esta API está sendo construída gradualmente, com foco em práticas utilizadas em aplicações reais de autenticação e gerenciamento de usuários.

---

## 📌 Sobre o projeto

O **API Auth** tem como objetivo fornecer uma base de autenticação reutilizável para aplicações web e sistemas que precisam controlar usuários, sessões e acesso a recursos protegidos.

A ideia é construir uma API próxima de um cenário real, evitando concentrar toda a lógica em uma única camada e aplicando uma arquitetura que facilite:

- manutenção;
- testes;
- evolução do sistema;
- reutilização de código;
- tratamento de erros;
- segurança;
- separação de responsabilidades.

O projeto também serve como estudo prático de desenvolvimento **Backend com Node.js e TypeScript**.

---

## 🎯 O que o projeto resolve?

Sistemas que possuem usuários normalmente precisam lidar com problemas como:

- cadastro de usuários;
- validação de dados;
- armazenamento seguro de senhas;
- autenticação e emissão de tokens;
- gerenciamento de sessões ativas;
- controle de expiração e renovação de acesso;
- tratamento padronizado de erros.

O objetivo desta API é centralizar essas responsabilidades em um serviço de autenticação que possa ser consumido por diferentes aplicações Frontend ou outros serviços.

Um cenário de uso:

```text
Frontend React
      │
      │ HTTP
      ▼
   API Auth
      │
      ├── Usuários (Cadastro e validação)
      ├── Autenticação (Login e verificação de credenciais)
      ├── Sessões (Controle de dispositivos e expiração)
      └── Tokens (Access Token JWT + Refresh Token Rotation)
             │
             ▼
        PostgreSQL
```

---

## 🛠️ Tecnologias

### Backend

- **Node.js** — ambiente de execução JavaScript
- **TypeScript** — tipagem estática e maior segurança durante o desenvolvimento
- **Express** — criação da API HTTP
- **Prisma ORM** — acesso e gerenciamento dos dados
- **PostgreSQL** — banco de dados relacional
- **Zod** — validação dos dados recebidos pela API
- **bcrypt** — hashing seguro de senhas e segredos de refresh token
- **jsonwebtoken (JWT)** — geração e assinatura de tokens de acesso stateless
- **crypto** — geração de identificadores e segredos criptograficamente seguros

### Desenvolvimento e infraestrutura

- **Docker** — execução do PostgreSQL em ambiente isolado
- **Docker Compose** — gerenciamento do container do banco
- **pnpm** — gerenciamento de dependências
- **Git** — controle de versão
- **GitHub** — hospedagem do código e histórico do projeto

---

## 🧱 Arquitetura

O projeto utiliza uma organização baseada em responsabilidades bem definidas (Controllers, Services, Schemas e Middlewares).

### Fluxo de Cadastro e Autenticação

```text
Request
   │
   ▼
 Route
   │
   ▼
Controller
   │
   ▼
 Zod (Validação dos dados)
   │
   ▼
 Service
   ├── Regras de negócio
   ├── bcrypt (Hash e verificação de senha/token)
   ├── TokenService (Geração de Access Token JWT)
   └── RefreshTokenService (Geração de segredo seguro)
   │
   ▼
Prisma ORM (User / Session)
   │
   ▼
PostgreSQL
```

### Route

Responsável por definir os endpoints e direcionar as requisições para os Controllers correspondentes:

- `POST /users` — Cadastro de usuário
- `POST /sessions` — Autenticação de usuário (Login)
- `POST /sessions/refresh` — Renovação de tokens (Refresh Token)

A camada de rotas não contém regras de negócio.

### Controller

Responsável por lidar com a comunicação HTTP:

- recebe a requisição;
- valida a estrutura dos dados com Zod;
- delega a execução para o Service correspondente;
- define o status HTTP apropriado;
- retorna a resposta padronizada.

### Service

Responsável pela lógica e regras de negócio da aplicação:

- **CreateUserService**: verifica duplicidade de e-mail, gera hash da senha e persiste o usuário;
- **LoginService**: valida credenciais, emite o Access Token (JWT), gera o Refresh Token e registra a sessão no banco;
- **RefreshTokenService**: valida o formato e o segredo do Refresh Token, verifica a expiração, executa a rotação do segredo e emite novos tokens;
- **TokenService**: assina e configura os parâmetros do Access Token JWT;
- **SessionService**: gerencia a criação e atualização de hashes de sessões no banco de dados.

### AppError

Classe personalizada para representar erros esperados da aplicação:

```text
AppError
   │
   ├── message
   └── statusCode
```

Isso permite diferenciar falhas de negócio (como credenciais inválidas ou e-mail já em uso) de falhas inesperadas do servidor.

### Error Handler

Middleware global que intercepta erros da aplicação e retorna respostas HTTP estruturadas.

---

## 🔐 Segurança

### Armazenamento seguro de senhas

As senhas nunca são salvas em texto puro. Durante o cadastro e verificação, passam pelo **bcrypt** com fator de custo (*salt rounds*) 12. O hash da senha nunca é exposto nas respostas da API.

### Access Token de curta duração (JWT)

A autenticação utiliza tokens JWT com validade curta (**15 minutos**), reduzindo a janela de impacto em caso de interceptação. O payload do token contém o identificador do usuário (`sub: userId`) e é assinado com chave secreta mantida no servidor via variável de ambiente.

### Refresh Token com Rotação (Refresh Token Rotation)

Para manter sessões persistentes com alto nível de segurança, foi adotada a estratégia de **Refresh Token Rotation**:

1. O Refresh Token é emitido no formato opaco: `sessionId.secret`.
2. O segredo (`secret`) é gerado com alta entropia (`crypto.randomBytes(64)`).
3. No banco de dados, apenas o hash bcrypt desse segredo é armazenado (`refreshTokenHash`), garantindo que um vazamento da base não comprometa tokens ativos.
4. Cada sessão tem prazo de validade de **15 dias**.
5. Ao solicitar a renovação (`POST /sessions/refresh`), um **novo segredo é gerado** e atualizado no banco, invalidando imediatamente o Refresh Token anterior e prevenindo ataques de repetição (*replay attacks*).

### Validação de entrada com Zod

Todos os dados recebidos nas requisições passam por validação estrita antes do processamento.

---

## 📡 Endpoints atuais

### 1. Criar usuário

```http
POST /users
```

Request:

```json
{
  "name": "Ivan",
  "email": "ivan@example.com",
  "password": "12345678"
}
```

Resposta de sucesso:

```http
201 Created
```

```json
{
  "id": "uuid",
  "name": "Ivan",
  "email": "ivan@example.com",
  "createdAt": "2026-09-15T16:53:47.136Z"
}
```

---

### 2. Autenticar usuário (Login)

```http
POST /sessions
```

Request:

```json
{
  "email": "ivan@example.com",
  "password": "12345678"
}
```

Resposta de sucesso:

```http
200 OK
```

```json
{
  "user": {
    "id": "uuid",
    "name": "Ivan",
    "email": "ivan@example.com",
    "createdAt": "2026-09-15T16:53:47.136Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "70d24c01-7fa1-4da2-83b6-17b8f9e67a78.8f4b..."
}
```

---

### 3. Renovar autenticação (Refresh Token)

```http
POST /sessions/refresh
```

Request:

```json
{
  "refreshToken": "70d24c01-7fa1-4da2-83b6-17b8f9e67a78.8f4b..."
}
```

Resposta de sucesso:

```http
200 OK
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "70d24c01-7fa1-4da2-83b6-17b8f9e67a78.9c2e..."
}
```

---

### Possíveis respostas de erro

#### Dados inválidos (400 Bad Request)

```json
{
  "message": "Dados inválidos",
  "errors": []
}
```

#### E-mail já cadastrado (409 Conflict)

```json
{
  "message": "Email já cadastrado"
}
```

#### Credenciais inválidas (401 Unauthorized)

```json
{
  "message": "E-mail ou senha inválidos"
}
```

#### Refresh Token inválido ou expirado (401 Unauthorized)

```json
{
  "message": "Refresh token inválido"
}
```

```json
{
  "message": "Refresh token expirado"
}
```

#### Erro interno do servidor (500 Internal Server Error)

```json
{
  "message": "Erro interno do servidor."
}
```

---

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** executado através do Docker.

O modelo de dados possui as entidades:

```text
User
 │
 └── Session (1:N)
```

### User

Responsável pelos dados de conta do usuário:

- `id` (UUID)
- `name`
- `email` (único)
- `passwordHash`
- `createdAt`

### Session

Responsável pelo controle das sessões e renovações de token:

- `id` (UUID)
- `userId` (referência ao usuário com deleção em cascata)
- `refreshTokenHash` (hash seguro do segredo do refresh token)
- `expiresAt` (data de expiração da sessão — 15 dias)
- `createdAt`

A relação permite que um mesmo usuário mantenha múltiplas sessões ativas (por exemplo, em computadores e celulares distintos) de forma isolada.

---

## 🐳 Docker

O PostgreSQL é executado através de um container Docker.

```text
Database: auth_api
User: postgres
Port: 5432
```

Para iniciar o banco:

```bash
docker compose up -d
```

Para verificar os containers:

```bash
docker compose ps
```

Para parar os containers:

```bash
docker compose down
```

---

## 🚀 Executando o projeto

### 1. Clonar o repositório

```bash
git clone git@github.com:progdev-ivan/API-Auth-.git
```

### 2. Entrar no projeto

```bash
cd API-Auth-
```

### 3. Instalar dependências

```bash
pnpm install
```

### 4. Configurar as variáveis de ambiente

Criar o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_api"
JWT_SECRET="seu_segredo_jwt_super_seguro_aqui"
```

### 5. Iniciar o PostgreSQL

```bash
docker compose up -d
```

### 6. Executar as migrations

```bash
pnpm prisma migrate dev
```

### 7. Gerar o Prisma Client

```bash
pnpm prisma generate
```

### 8. Iniciar a API

```bash
pnpm dev
```

A API ficará disponível em:

```text
http://localhost:3333
```

---

## 🧪 Validação

Para executar a verificação estática de tipos com o TypeScript:

```bash
pnpm exec tsc --noEmit
```

---

## 📋 Roadmap

### ✅ Concluído

- [x] Configuração do Node.js, TypeScript e Express
- [x] PostgreSQL com Docker Compose
- [x] Prisma ORM e migrations
- [x] Arquitetura em camadas (Routes / Controllers / Services)
- [x] Cadastro de usuários com validação Zod
- [x] Hash seguro de senhas com bcrypt
- [x] Verificação de e-mail duplicado
- [x] Tratamento centralizado de erros com AppError e Middleware global
- [x] Autenticação / Login (`POST /sessions`)
- [x] Emissão de Access Token (JWT) com expiração de 15 minutos
- [x] Emissão de Refresh Token opaco (`sessionId.secret`)
- [x] Persistência e gerenciamento de sessões no banco de dados
- [x] Renovação de tokens com Rotação de Refresh Token (`POST /sessions/refresh`)

### 🚧 Próximos passos

- [ ] Middleware de autenticação (validação do header `Authorization: Bearer <token>`)
- [ ] Proteção de rotas autenticadas
- [ ] Endpoint `/me` (obtenção dos dados do usuário logado)
- [ ] Logout (invalidação de sessão)
- [ ] Revogação de todas as sessões ativas do usuário
- [ ] Testes automatizados (unitários e de integração)
- [ ] Rate limiting para proteção contra brute force
- [ ] Documentação interativa da API (Swagger / OpenAPI)

---

## 📚 Práticas utilizadas

- **POO (Programação Orientada a Objetos)**
- Separação de responsabilidades e camadas bem delimitadas
- Injeção de dependências nos Services e Controllers
- Estratégia moderna de autenticação: **Stateless Access Token (JWT)** + **Stateful Session / Refresh Token Rotation**
- Hashing criptográfico de dados sensíveis (senhas e segredos de token)
- Validação estrita de schemas com Zod
- Tratamento centralizado de exceções
- Migrations declarativas com Prisma ORM
- Gerenciamento de segredos com variáveis de ambiente

---

## 📌 Status

**🚧 Em desenvolvimento**

Novas funcionalidades (como proteção de rotas e logout) serão adicionadas progressivamente conforme a evolução do projeto.
