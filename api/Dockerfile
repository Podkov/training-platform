FROM node:20-bullseye-slim as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Debug: Sprawdź, czy schema.prisma istnieje
RUN echo "--- Checking for schema.prisma ---" && ls -la prisma/schema.prisma && cat prisma/schema.prisma

# Generujemy klienta Prisma
RUN npx prisma generate

# Budujemy TypeScript
RUN npm run build
RUN ls -la dist/

FROM node:20-bullseye-slim

WORKDIR /app

# Kopiujemy tylko niezbędne pliki
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Instalujemy curl dla healthchecka
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/app/prisma/dev.db

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]