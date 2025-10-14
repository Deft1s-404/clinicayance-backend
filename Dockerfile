# Etapa 1: Base
FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Instala dependências básicas (certificados e utilitários)
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Etapa 2: Dependências
FROM base AS deps
ENV NODE_ENV=development

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Etapa 3: Build
FROM deps AS builder

# Copia os arquivos de configuração e código-fonte
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# ⚠️ Garante que o Prisma Client será gerado
RUN npx prisma generate

# Compila o projeto NestJS (gera /dist)
RUN npm run build

# Etapa 4: Execução
FROM base AS runner
WORKDIR /app

COPY package*.json ./

# Copia dependências e build final
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Define permissões corretas para o usuário 'node'
RUN chown -R node:node /app
USER node

# Porta de execução do app
EXPOSE 3000

# ⚙️ Rodar migrações automáticas e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
