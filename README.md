# 🔐 API Auth

API de autenticação desenvolvida com **Node.js, TypeScript, Express, Prisma e PostgreSQL**, seguindo princípios de organização em camadas, Programação Orientada a Objetos (POO) e boas práticas de desenvolvimento de APIs REST.

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
- autenticação;
- gerenciamento de sessões;
- controle de acesso;
- expiração de sessões;
- renovação de autenticação;
- tratamento padronizado de erros.

O objetivo desta API é centralizar essas responsabilidades em um serviço de autenticação que possa ser consumido por diferentes aplicações Frontend ou outros serviços.

Um cenário de uso poderia ser:

```text
Frontend React
      │
      │ HTTP
      ▼
   API Auth
      │
      ├── Usuários
      ├── Autenticação
      ├── Sessões
      └── Tokens
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
- **bcrypt** — hashing seguro de senhas

### Desenvolvimento e infraestrutura

- **Docker** — execução do PostgreSQL em ambiente isolado
- **Docker Compose** — gerenciamento do container do banco
- **pnpm** — gerenciamento de dependências
- **Git** — controle de versão
- **GitHub** — hospedagem do código e histórico do projeto

---

## 🧱 Arquitetura

O projeto utiliza uma organização baseada em responsabilidades bem definidas.

Atualmente, o fluxo principal de cadastro segue:

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
 Zod
   │
   ▼
 Service
   │
   ├── Regras de negócio
   ├── bcrypt
   │
   ▼
 Prisma
   │
   ▼
PostgreSQL
```

### Route

Responsável por definir os endpoints e direcionar as requisições para os Controllers.

Exemplo:

```text
POST /users
```

A camada de rotas não contém regras de negócio.

### Controller

Responsável por lidar com a comunicação HTTP.

Atualmente o Controller:

- recebe a requisição;
- valida os dados utilizando Zod;
- chama o Service;
- define o status HTTP;
- retorna a resposta.

### Service

Responsável pelas regras de negócio.

Por exemplo, durante o cadastro:

```text
1. Verificar se o e-mail já existe
2. Gerar o hash da senha
3. Criar o usuário
4. Remover informações sensíveis da resposta
```

### Prisma

Responsável pela comunicação entre a aplicação e o PostgreSQL.

### AppError

O projeto possui uma classe própria para representar erros esperados da aplicação:

```text
AppError
   │
   ├── message
   └── statusCode
```

Isso permite diferenciar erros conhecidos de erros inesperados.

### Error Handler

Um middleware global transforma erros da aplicação em respostas HTTP padronizadas.

Exemplo:

```json
{
  "message": "E-mail já cadastrado"
}
```

com:

```text
HTTP 409 Conflict
```

---

## 🔐 Segurança

Mesmo sendo um projeto em desenvolvimento, algumas práticas de segurança já estão sendo aplicadas.

### Senhas nunca são armazenadas em texto puro

Durante o cadastro, a senha passa pelo bcrypt:

```text
Senha informada
      │
      ▼
 bcrypt.hash()
      │
      ▼
Password Hash
      │
      ▼
PostgreSQL
```

A API não retorna o `passwordHash` na resposta do cadastro.

### Validação de entrada

Os dados recebidos pela API são validados utilizando **Zod** antes de serem processados.

Exemplo:

```json
{
  "name": "Ivan",
  "email": "ivan@example.com",
  "password": "123"
}
```

Uma senha com menos de 8 caracteres é rejeitada pela API.

### Variáveis de ambiente

As informações de conexão com o banco são mantidas através de variáveis de ambiente, evitando colocar credenciais diretamente no código-fonte.

---

## 📡 Endpoints atuais

### Criar usuário

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

### Possíveis respostas

#### Dados inválidos

```http
400 Bad Request
```

```json
{
  "message": "Dados inválidos",
  "errors": []
}
```

#### E-mail já cadastrado

```http
409 Conflict
```

```json
{
  "message": "E-mail já cadastrado"
}
```

#### Erro inesperado

```http
500 Internal Server Error
```

```json
{
  "message": "Erro interno do servidor."
}
```

---

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** executado através do Docker.

Atualmente o modelo possui as entidades:

```text
User
 │
 └── Session
```

### User

Responsável pelos dados do usuário:

- `id`
- `name`
- `email`
- `passwordHash`
- `createdAt`

### Session

Estrutura preparada para o gerenciamento de sessões de autenticação:

- `id`
- `userId`
- `refreshTokenHash`
- `expiresAt`
- `createdAt`

A relação permite que um usuário possua múltiplas sessões.

Isso possibilita futuramente trabalhar com cenários como:

```text
Usuário
 ├── Computador
 ├── Celular
 └── Tablet
```

Cada dispositivo poderá possuir uma sessão independente.

---

## 🐳 Docker

O PostgreSQL é executado através de um container Docker.

Banco utilizado:

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
docker ps
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

Criar um arquivo:

```text
.env
```

Com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_api"
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

O projeto utiliza TypeScript para verificar problemas durante o desenvolvimento.

Para executar a verificação:

```bash
pnpm exec tsc --noEmit
```

Também estão planejados testes automatizados para os principais fluxos da aplicação.

---

## 📋 Roadmap

O projeto ainda está em desenvolvimento.

### ✅ Concluído

- [x] Configuração do Node.js
- [x] TypeScript
- [x] Express
- [x] PostgreSQL
- [x] Docker
- [x] Prisma
- [x] Configuração de migrations
- [x] Arquitetura Route / Controller / Service
- [x] Programação Orientada a Objetos
- [x] Cadastro de usuários
- [x] Validação com Zod
- [x] Hash de senhas com bcrypt
- [x] Verificação de e-mail duplicado
- [x] AppError
- [x] Middleware global de erros
- [x] Respostas HTTP padronizadas

### 🚧 Em desenvolvimento

- [ ] Login
- [ ] Autenticação com JWT
- [ ] Access Token
- [ ] Refresh Token
- [ ] Gerenciamento de sessões
- [ ] Logout
- [ ] Endpoint `/me`
- [ ] Proteção de rotas
- [ ] Middleware de autenticação
- [ ] Testes automatizados
- [ ] Tratamento de casos de autenticação
- [ ] Melhorias de segurança
- [ ] Documentação da API

---

## 📚 Práticas utilizadas

Durante o desenvolvimento estão sendo aplicados conceitos e práticas como:

- **POO (Programação Orientada a Objetos)**
- separação de responsabilidades;
- princípios de arquitetura em camadas;
- Dependency Injection;
- validação de dados;
- tratamento centralizado de erros;
- hashing de senhas;
- HTTP status codes;
- API REST;
- migrations;
- variáveis de ambiente;
- controle de versão com Git;
- desenvolvimento incremental;
- preocupação com segurança desde o início do projeto.

---

## 💡 Objetivo profissional

Além de funcionar como uma API de autenticação, este projeto está sendo desenvolvido como um projeto prático para aprofundar conhecimentos em **Backend e Full Stack Development**.

A proposta é construir o sistema gradualmente, adicionando funcionalidades e boas práticas encontradas em aplicações reais, em vez de implementar apenas um CRUD simples.

---

## 📌 Status

**🚧 Em desenvolvimento**

Novas funcionalidades serão adicionadas progressivamente conforme a evolução do projeto.
