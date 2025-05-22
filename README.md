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
├── data/              # Dane (baza SQLite)
│   └── dev.db        # Plik bazy danych SQLite
└── docker-compose.yml # Orchestracja kontenerów
```

## Technologie
- **Backend:**
  - Bun 1.0.25
  - TypeScript
  - Express 5
  - Prisma ORM
  - SQLite
- **Frontend:**
  - React 18
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
- Bun 1.0.25+

## Konfiguracja
1. Utwórz plik `.env` w katalogu `api/`:
```env
DATABASE_URL="file:../../data/dev.db"
JWT_SECRET="twoj-tajny-klucz-min-32-znaki"
```

2. Wykonaj migrację bazy danych:
```bash
cd api
bunx prisma migrate dev --name init
```

## Uruchomienie

### 1. Tryb development (lokalnie)
1. Sklonuj repozytorium
2. Backend:
   ```bash
   cd api
   bun install
   bun run dev
   ```
   Aplikacja API: http://localhost:4000
3. Frontend:
   ```bash
   cd web
   bun install
   bun run dev
   ```
   Aplikacja webowa: http://localhost:3000

### 2. Tryb produkcyjny (Docker Compose)
1. Upewnij się, że masz Docker i Docker Compose
2. W katalogu głównym:
   ```bash
   docker-compose up --build
   ```
3. API: http://localhost:4000
4. Frontend: http://localhost:80

## Endpointy API

### Autoryzacja
- `POST /auth/register` - rejestracja użytkownika
  - Body: `{ "email": string, "password": string, "role": "ADMIN" | "TRAINER" | "PARTICIPANT" }`
  - Zwraca: `{ token: string }`
- `POST /auth/login` - logowanie
  - Body: `{ "email": string, "password": string }`
  - Zwraca: `{ token: string }`

### Health Check
- `GET /health` - sprawdzenie stanu API
  - Zwraca: `{ status: "ok", timestamp: string, uptime: number }`

## Baza danych
- SQLite
- Lokalizacja: `./data/dev.db`
- Migracje: automatyczne przy starcie kontenera
- Schemat: User, Course, Enrollment

## Autoryzacja
- JWT (JSON Web Token)
- Token w headerze: `Authorization: Bearer <token>`
- Role: ADMIN, TRAINER, PARTICIPANT
- Czas ważności tokena: 2 godziny

## Healthcheck
- API sprawdza stan aplikacji co 30 sekund
- Endpoint: `http://localhost:4000/health`
- Status 200 oznacza, że aplikacja działa poprawnie 

## Nowości w frontendzie
- Użycie `AuthProvider` (React Context) w `web/src/contexts/AuthContext.tsx` do centralnego zarządzania stanem autoryzacji.
- Hook `useAuth()` aliasujący `useAuthContext()` dla wygodnego importu w komponentach.
- Komponent `ProtectedRoute` w `web/src/components/ProtectedRoute.tsx` do ochrony tras wymagających zalogowania.
- Formularze logowania i rejestracji w `web/src/components/auth/` z walidacją Zod i React Hook Form.
- Po rejestracji przekierowanie na `/login` z komunikatem o sukcesie, po zalogowaniu przekierowanie na `/dashboard`.
- Widok Dashboard pokazuje informacje o rolach i emailu użytkownika oraz przycisk wylogowania.
