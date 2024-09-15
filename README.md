# Node.js Express Project

## Descrição
Este é um projeto Node.js utilizando o framework Express.

## Requisitos
- [Node.js](https://nodejs.org) (você pode usar o [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Instalação

1. Instale as dependências:
    ```bash
    npm install
    ```

2. Copie o arquivo `.env.example` para criar um `.env` com as variáveis de ambiente:
    ```bash
    cp .env.example .env
    ```

## Executando o projeto

1. Para rodar o servidor em modo de desenvolvimento:
    ```bash
    npm run dev
    ```

2. Para rodar em modo de produção:
    ```bash
    npm start
    ```

O servidor estará rodando por padrão em `http://localhost:3000`.

## Scripts disponíveis

- `npm run dev`: Inicia o servidor com `nodemon` para recarregar automaticamente em caso de mudanças.
- `npm start`: Inicia o servidor em modo de produção.
