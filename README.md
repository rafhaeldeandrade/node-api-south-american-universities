# South American Universities API

API Node.js com Express e MongoDB

## Índice

- [Sobre](#sobre)
- [Recursos](#recursos)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Utilização](#utilização)
- [Testes](#testes)
- [Documentação](#documentação)

## Sobre

A South American Universities API uma interface de programação de aplicativos que permite visualizar, criar, editar e excluir informações sobre universidades em todo o mundo. Com essa API, os desenvolvedores podem obter acesso a um extenso conjunto de dados sobre instituições de ensino superior globalmente, permitindo a criação de aplicativos, sites e serviços relacionados a universidades.

## Recursos

- Visualização de informações detalhadas sobre universidades, como nome, país, domínios e mais.
- Possibilidade de criar novos registros de universidades no banco de dados.
- Edição dos dados existentes para manter as informações atualizadas.
- Exclusão de universidades caso não sejam mais relevantes.

## Requisitos

Antes de iniciar a instalação e configuração da API, certifique-se de atender aos seguintes requisitos:

- Docker
- Docker Compose (ou Docker-Compose)

## Instalação

Siga as etapas abaixo para instalar e configurar o projeto:

1. Clone o repositório do GitHub:
  ```markdown
    git clone git@github.com:rafhaeldeandrade/node-api-south-american-universities.git
  ```
2. Navegue até o diretório raiz do projeto:
  ```markdown
    cd node-api-south-american-universities
  ```
3. Renomeie o arquivo .env.example para .env.
4. Edite o arquivo .env e atualize as variáveis de ambiente conforme necessário:
  ```markdown
    PORT=4000
    MONGO_URL=URL_do_banco_de_dados
    MONGO_DB_NAME=nome_do_banco_de_dados
  ```

5. Caso tenha iniciado o projeto com `make dev`, altere a propriedade MONGO_URL para `mongodb://mongodb`

6. Execute o seguinte comando para iniciar o projeto em ambiente de desenvolvimento:
  ```
    make dev
  ```

## Utilização

A API  oferece os seguintes endpoints:
- GET /universities: Retorna a lista de todas as universidades cadastradas.
- GET /universities/{id}: Retorna os detalhes de uma universidade específica com base no ID fornecido.
- POST /universities: Cria uma nova universidade com base nos dados enviados no corpo da requisição.
- PUT /universities/{id}: Atualiza os dados de uma universidade específica com base no ID fornecido.
- DELETE /universities/{id}: Remove uma universidade específica com base no ID fornecido.

## Testes

Para executar os testes automatizados, siga as etapas abaixo:

1. No terminal, execute o seguinte comando:
  ```
    make test
  ```
2. Aguarde a finalização dos testes e verifique se todos os casos foram executados com êxito.

## Documentação

Acesse a documentação online do projeto: [Link](https://rafhael.docs.apiary.io/#)
