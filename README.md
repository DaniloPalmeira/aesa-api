# API de Abstração - Carteirinha AESA/CESA

Esta API atua como uma camada de abstração (um *wrapper*) sobre o portal da carteirinha de estudante da [Autarquia de Ensino Superior de Arcoverde (AESA/CESA)](https://aesa-cesa.br/). O objetivo é simplificar o processo de login e extração de dados, fornecendo as informações do estudante em um formato JSON limpo e fácil de consumir.

## Funcionalidades

  - Recebe credenciais de estudante (matrícula e senha/CPF) via JSON.
  - Realiza o processo de autenticação de forma automatizada no portal oficial.
  - Gerencia os cookies de sessão necessários para acessar páginas protegidas.
  - Extrai (faz *scraping*) das informações da página da carteirinha, como nome, foto, curso, matrícula e validade.
  - Retorna todos os dados extraídos em uma única resposta JSON estruturada.

## Tecnologias Utilizadas

  - **Backend:** Node.js
  - **Linguagem:** TypeScript
  - **Framework:** Express.js
  - **Requisições HTTP:** Axios
  - **HTML Parsing/Scraping:** Cheerio

## Pré-requisitos

Antes de começar, você vai precisar ter as seguintes ferramentas instaladas em sua máquina:

  - [Node.js](https://nodejs.org/en/) (v18.x ou superior)
  - [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js) ou [Yarn](https://yarnpkg.com/)

## Instalação

Siga os passos abaixo para configurar o projeto em seu ambiente local:

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/DaniloPalmeira/aesa-api.git
    ```

2.  **Navegue até a pasta do projeto:**

    ```bash
    cd aesa-api
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

## Executando a API

Você pode executar o servidor de duas formas: em modo de desenvolvimento ou produção.

### Modo de Desenvolvimento

Neste modo, o servidor reiniciará automaticamente a cada alteração no código-fonte (`.ts`).

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

### Modo de Produção

Este comando irá primeiro compilar o código TypeScript para JavaScript (na pasta `dist/`) e depois iniciar o servidor a partir dos arquivos compilados, o que é mais performático.

```bash
# 1. Compilar o projeto
npm run build

# 2. Iniciar o servidor
npm start
```

## Documentação da API

A API possui um único endpoint para realizar todo o processo.

### Endpoint

#### `POST /api/login`

Autentica o usuário no portal da AESA com as credenciais fornecidas e retorna os dados da carteirinha de estudante.

**Corpo da Requisição (Request Body)**

O corpo da requisição deve ser um JSON com os seguintes campos:

  - `user` (string): O número de matrícula do estudante.
  - `password` (string): A senha do estudante (geralmente o CPF sem pontos ou traços).

<!-- end list -->

```json
{
    "user": "NNNNNNNNNN",
    "password": "NNNNNNNNNNN"
}
```

**Exemplo de Uso com cURL**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user": "SUA_MATRICULA", "password": "SUA_SENHA"}' \
  http://localhost:3000/api/login
```

-----

### Respostas (Responses)

#### Sucesso (`200 OK`)

Se as credenciais forem válidas, a API retornará um objeto JSON com os dados do estudante.

```json
{
    "nome": "DANILO PALMEIRA",
    "fotoUrl": "https://aesa-cesa.br/carteirinha/public/images/perfil/{hash}.jpg",
    "curso": "ANÁLISE E DESENVOLVIMENTO DE SISTEMAS",
    "vinculo": "ALUNO",
    "matricula": "NNNNNNNNNN",
    "validade": "07/2025",
}
```

#### Erros

  - **`400 Bad Request`**: Ocorre se os campos `user` ou `password` não forem enviados na requisição.

    ```json
    {
        "error": "Usuário e senha são obrigatórios."
    }
    ```

  - **`401 Unauthorized`**: Ocorre se as credenciais (matrícula ou senha) estiverem incorretas.

    ```json
    {
        "error": "Login falhou. Usuário ou senha inválidos."
    }
    ```

  - **`500 Internal Server Error`**: Ocorre se houver um problema inesperado no servidor, como falha ao se conectar ao site da AESA ou erro ao extrair os dados.

    ```json
    {
        "error": "Ocorreu um erro interno ao processar a solicitação."
    }
    ```

## Licença

Este projeto está licenciado sob a Licença MIT.