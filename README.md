# Clinica Yance - Backend

## PayPal OAuth (Sandbox)

1. Crie um app REST no PayPal Developer Dashboard (conta Business, ambiente Sandbox).
2. Copie o `Client ID` e o `Secret` e preencha no `.env`:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_REDIRECT_URI` (mesmo valor registrado nas Redirect URLs do app)
   - `PAYPAL_SCOPES` (inclua `offline_access` e `https://uri.paypal.com/services/reporting` para leitura de transacoes e refresh token).
3. Gere/atualize o schema com Prisma:
   ```bash
   npm run prisma:migrate:dev
   npm run prisma:generate
   ```
4. Fluxo de conexao:
   - `POST /integrations/paypal/oauth/state` -> retorna `authorizeUrl` e `state`.
   - Usuario faz login no PayPal e o provider chama `/integrations/paypal/oauth/callback`.
   - Depois da conexao, use `GET /integrations/paypal/oauth/status` para conferir se ha conta vinculada e `POST /integrations/paypal/oauth/token` (opcional `{"forceRefresh":true}`) para recuperar o access token.
5. Consulta de transacoes diretas: `GET /integrations/paypal/transactions?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z&page=1&pageSize=100`. A resposta inclui um resumo de paginacao e os detalhes normalizados de cada transacao (id, status, valores, payer).

## PayPal OAuth (Live)

1. No PayPal Developer Dashboard, abra a aba **Live** e crie um novo REST app (uma conta Sandbox não é promovida; são credenciais diferentes).
2. Solicite ao suporte PayPal a ativação do escopo `https://uri.paypal.com/services/reporting` e demais permissões que precisar (Transaction Search, dados do pagador, etc.). Esse passo pode exigir a aprovação do time PayPal.
3. Copie o `Client ID` e o `Secret` **Live** e substitua no `.env`:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_REDIRECT_URI` apontando para o domínio público de produção (ex.: `https://api.seudominio.com/api/paypal/oauth/callback`) e cadastre exatamente o mesmo valor nas Redirect URLs do app Live.
   - Opcionalmente ajuste:
     - `PAYPAL_BASE_URL=https://api-m.paypal.com`
     - `PAYPAL_AUTH_BASE_URL=https://www.paypal.com`
4. Reinicie o backend com o novo `.env`, execute `npm run build` (ou o processo de deploy) e refaça o fluxo de conexão no ambiente Live para validar.
5. Atualize o n8n (ou qualquer job agendado) para apontar para o domínio público/produção e confirme que o sync (`POST /payments/paypal/sync`) está usando as credenciais Live.

## Sincronizacao automatica (n8n)

1. Agende o n8n para chamar `POST /payments/paypal/sync` (com autenticacao). Exemplo de payload:
   ```json
   {
     "startDate": "2025-01-01T00:00:00Z",
     "endDate": "2025-01-31T23:59:59Z",
     "transactionStatus": "S",
     "pageSize": 100,
     "maxPages": 5
   }
   ```
   O backend obtem o token PayPal do usuario, consulta a API de Transaction Search pagina a pagina e persiste cada registro em `PaypalTransaction`. O campo `lastSyncedAt` da `PaypalAccount` eh atualizado ao final.
2. O frontend pode consumir os dados cacheados via `GET /payments/paypal/transactions` aplicando filtros (`startDate`, `endDate`, `payerEmail`, `status`, `page`, `pageSize`). Para detalhes use `GET /payments/paypal/transactions/:id`.
3. Opcional: o n8n pode disparar o sync varias vezes ao dia (por exemplo a cada hora) com janelas menores.

> Para receber transacoes eh necessario que o app tenha acesso ao escopo `https://uri.paypal.com/services/reporting`. Caso o consentimento retorne "escopo invalido", solicite a habilitacao do Transaction Search no suporte PayPal ou utilize apenas `openid profile email offline_access` ate a aprovacao.

ATENCAO: Tokens e refresh tokens sao persistidos na base; considere criptografia em repouso e mantenha o `.env` seguro.

## Calendario de disponibilidade

O backend agora expõe um CRUD em `/calendar` para registrar os horarios de atendimento e deslocamentos internacionais que o agente de IA deve consultar antes de sugerir agendamentos.

- Tipos aceitos (`type`): `AVAILABLE`, `TRAVEL`, `BLOCKED`.
- Campos principais: `title`, `description`, `start`, `end`, `allDay`, `timezone`, `country`, `city`, `location`, `notes` e `metadata`.
- Listagem suporta filtros por `start`, `end`, `type`, `country`, `onlyFuture`, `page`, `limit` e `search` (busca em titulo/localizacao/notas).

Exemplo de criacao:

```http
POST /calendar
{
  "title": "Atendimentos em Lisboa",
  "type": "AVAILABLE",
  "start": "2026-02-10T09:00:00+00:00",
  "end": "2026-02-10T16:00:00+00:00",
  "timezone": "Europe/Lisbon",
  "country": "Portugal",
  "notes": "Consultas presenciais durante viagem"
}
```

Use `PATCH /calendar/:id` para atualizar qualquer campo e `DELETE /calendar/:id` para remover faixas que nao se aplicam mais.

## Tabela de servicos e precos

O endpoint `/services` disponibiliza um CRUD para cadastrar os procedimentos oferecidos, com valores por pais/moeda. Este recurso deve ser usado pelo agente de IA para validar orcamentos.

- Campos: `name`, `description`, `category`, `country`, `currency`, `price`, `durationMinutes`, `notes`, `active`.
- Filtros: `country`, `category`, `onlyActive`, `minPrice`, `maxPrice`, alem de `page`, `limit` e `search`.

Exemplo:

```http
POST /services
{
  "name": "Aplicacao de Botox Premium",
  "category": "Estetica",
  "country": "Brasil",
  "currency": "BRL",
  "price": 1800,
  "durationMinutes": 90,
  "notes": "Inclui revisao em 15 dias"
}
```

## Base de conhecimento (RAG)

- CRUD protegido em `/knowledge` para cadastrar textos, resumos, tags, idioma, prioridade e status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- O n8n (ou outro job) consulta o material consolidado via `GET /ai/knowledge/context`, enviando o header `x-integration-key: $INTEGRATIONS_API_KEY`. Os filtros aceitam `tags`, `language`, `category`, `audience`, `limit` e `search`.
- Para preencher filtros do CRM dinamicamente, use `GET /knowledge/filters`, que devolve os conjuntos distintos de `tags`, `categories`, `audiences` e `languages` cadastrados.
- A resposta possui `entries` (lista de registros publicados ou rascunhos, se `includeDrafts=true`) e `combinedText`, string pronta para servir de contexto no prompt do agente.
- Ajuste `maxCharacters` na query para limitar o tamanho concatenado quando for alimentar modelos com janelas menores.
