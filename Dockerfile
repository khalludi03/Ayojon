# Stage 1: Build everything
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy manifests first for layer caching
COPY bun.lock package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/storage/package.json ./packages/storage/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

# Copy all source
COPY . .

# Build the Vite frontend
RUN bun run --filter web build

# Stage 2: Production runtime
FROM oven/bun:1-slim AS runtime
WORKDIR /app

# Root node_modules (contains workspace symlinks + hoisted deps)
COPY --from=builder /app/node_modules ./node_modules

# Workspace packages — source + each package's own node_modules
COPY --from=builder /app/packages ./packages

# Server source
COPY --from=builder /app/apps/server ./apps/server

# TanStack Start build output (client assets + SSR server)
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Root package.json needed for workspace resolution
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "apps/server/src/index.ts"]
