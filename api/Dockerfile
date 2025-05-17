FROM oven/bun:1.0.25 as builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .
# Najpierw generujemy Prismę
RUN bunx prisma generate
# Potem budujemy TypeScript
RUN bun run build
# Debugowanie
RUN ls -la dist/

FROM oven/bun:1.0.25-slim

WORKDIR /app

# Kopiujemy tylko niezbędne pliki
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Instalujemy tylko zależności produkcyjne
RUN bun install --no-dev

# Instalujemy curl dla healthchecka
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/app/prisma/dev.db

EXPOSE 4000

# Zmieniamy healthcheck na prostszy
HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Debugowanie
RUN ls -la

# Inicjalizacja bazy danych i uruchomienie aplikacji
CMD echo "Starting API..." && bunx prisma migrate deploy && echo "Database migrated" && bun run start 