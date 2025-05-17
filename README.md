# Training Platform Monorepo

## Opis projektu
Training Platform to monorepo zawierające aplikację webową (frontend) i API (backend) do zarządzania platformą szkoleniową.

## Struktura projektu
```
training-platform/
├── api/                # Backend (Express.js + TypeScript)
│   ├── src/           # Kod źródłowy
│   ├── prisma/        # Schemat bazy danych i migracje
│   └── Dockerfile     # Konfiguracja kontenera API
├── web/               # Frontend (React + TypeScript)
│   ├── src/           # Kod źródłowy
│   └── Dockerfile     # Konfiguracja kontenera web
├── data/              # Dane (np. baza SQLite)
└── docker-compose.yml # Orchestracja kontenerów
```

## Technologie
- **Backend:**
  - Node.js + Express
  - TypeScript
  - Prisma ORM
  - SQLite
  - Bun (runtime)
- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
- **Infrastruktura:**
  - Docker
  - Docker Compose
  - Nginx (reverse proxy)

## Wymagania
- Docker
- Docker Compose

## Uruchomienie
1. Sklonuj repozytorium
2. Uruchom kontenery:
```bash
docker-compose up --build
```
3. API będzie dostępne pod adresem: http://localhost:4000
4. Frontend będzie dostępny pod adresem: http://localhost:80

## Endpointy API
- `GET /health` - sprawdzenie stanu API
  - Zwraca: `{ status: "ok", timestamp: string, uptime: number }`

## Baza danych
- SQLite
- Lokalizacja: `./data/dev.db`
- Migracje: automatyczne przy starcie kontenera

## Healthcheck
- API sprawdza stan aplikacji co 30 sekund
- Endpoint: `http://localhost:4000/health`
- Status 200 oznacza, że aplikacja działa poprawnie 
