# HB Construtora — imagem para Coolify (Astro SSR, adapter Node standalone)
# Build em 2 estágios: compila e depois roda só o necessário.

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# As PUBLIC_* são embutidas no bundle pelo Astro no BUILD → precisam existir aqui.
# No Coolify, cadastrar como "Build Variable". Não são segredo (a anon key é pública).
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
    PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 4321
# SUPABASE_SERVICE_ROLE_KEY entra como env de RUNTIME no Coolify (é segredo).
CMD ["node", "./dist/server/entry.mjs"]
