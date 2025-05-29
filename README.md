# Training Platform Monorepo

## Opis projektu
Training Platform to monorepo zawierające aplikację webową (frontend) i API (backend) do zarządzania platformą szkoleniową.

## Struktura projektu
```
training-platform/
├── api/                # Backend (Express.js + TypeScript)
│   ├── prisma/         # Schemat bazy danych i migracje
│   ├── src/            # Kod źródłowy
│   │   ├── dto/            # obiekty DTO (course-dto.ts, enrollment-dto.ts)
│   │   ├── entities/       # encje domenowe (course-entity.ts, enrollment-entity.ts)
│   │   ├── exceptions/     # wyjątki HTTP (bad-request-exception.ts, ...)
│   │   ├── repositories/    # dostęp do bazy (course-repository.ts, ...)
│   │   ├── services/       # logika biznesowa (course-service.ts, ...)
│   │   ├── controllers/    # mapowanie HTTP → serwisy
│   │   ├── routes/         # definicje Express.Router
│   │   ├── middlewares/    # middleware (auth, walidatory)
│   │   ├── utils/          # narzędzia (logger, jwt.utils)
│   │   ├── index.ts        # konfiguracja aplikacji
│   │   └── server.ts       # uruchomienie serwera
│   └── Dockerfile     # Konfiguracja kontenera API
├── web/               # Frontend (React + TypeScript)
│   ├── src/           # Kod źródłowy
│   │   ├── components/    # komponenty React
│   │   │   ├── auth/      # komponenty autoryzacji
│   │   │   └── courses/   # komponenty kursów
│   │   ├── contexts/      # konteksty React (AuthContext)
│   │   ├── hooks/         # hooki React (useAuth)
│   │   ├── services/      # serwisy API
│   │   └── pages/         # strony aplikacji
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
  - JWT dla autoryzacji
  - Zod dla walidacji
- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - React Router
  - React Hook Form
  - Zod dla walidacji formularzy
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

### Kursy
- `GET /courses` - lista kursów (z paginacją i filtrowaniem)
  - Query: `?status=active|finished&page=1&limit=10`
- `GET /courses/:id` - szczegóły kursu
- `POST /courses` - utworzenie kursu (ADMIN/TRAINER)
  - Body: `{ "title": string, "description": string, "status": "active"|"finished" }`
- `PUT /courses/:id` - aktualizacja kursu (ADMIN/TRAINER)
- `DELETE /courses/:id` - usunięcie kursu (ADMIN/TRAINER)

### Zapisy na kursy
- `POST /enrollments/courses/:id/enroll` - zapis na kurs (PARTICIPANT)
- `DELETE /enrollments/courses/:id/enroll` - anulowanie zapisu (PARTICIPANT)
- `GET /enrollments/users/me/courses` - lista moich kursów

### Panel administratora
- `GET /admin/users` - lista użytkowników (ADMIN)
- `PUT /admin/users/:id/role` - zmiana roli użytkownika (ADMIN)
- `GET /admin/stats` - statystyki platformy (ADMIN)

### Profil użytkownika
- `GET /users/me` - mój profil
- `PUT /users/me` - aktualizacja profilu
- `PUT /users/me/password` - zmiana hasła

### Health Check
- `GET /health` - sprawdzenie stanu API
  - Zwraca: `{ status: "ok", timestamp: string, uptime: number }`

## Baza danych
- SQLite
- Lokalizacja: `./data/dev.db`
- Migracje: automatyczne przy starcie kontenera
- Schemat:
  - User (id, email, passwordHash, role)
  - Course (id, title, description, status)
  - Enrollment (id, userId, courseId, status)
- Relacje:
  - User 1:N Enrollment
  - Course 1:N Enrollment
- Enumy:
  - CourseStatus: active, finished
  - EnrollmentStatus: active, cancelled
  - UserRole: ADMIN, TRAINER, PARTICIPANT

## Autoryzacja
- JWT (JSON Web Token)
- Token w headerze: `Authorization: Bearer <token>`
- Role: ADMIN, TRAINER, PARTICIPANT
- Czas ważności tokena: 2 godziny
- Middleware do weryfikacji uprawnień
- Zabezpieczenia przed nieautoryzowanym dostępem

## Healthcheck
- API sprawdza stan aplikacji co 30 sekund
- Endpoint: `http://localhost:4000/health`
- Status 200 oznacza, że aplikacja działa poprawnie 

## Recent Changes

### Architektura
- Wprowadzono wzorzec Repository Pattern dla operacji na bazie danych
- Dodano warstwę Service Layer z logiką biznesową
- Zaimplementowano Domain-Driven Design (DDD) z encjami domenowymi
- Wprowadzono DTO (Data Transfer Objects) dla walidacji danych
- Dodano custom exceptions dla lepszej obsługi błędów

### Backend
- Dodano pełną implementację CRUD dla kursów
- Zaimplementowano system zapisów na kursy
- Dodano walidację biznesową w encjach domenowych
- Wprowadzono transakcje dla operacji wieloetapowych
- Dodano paginację i filtrowanie dla list kursów

### Frontend
- Użycie `AuthProvider` (React Context) w `web/src/contexts/AuthContext.tsx` do centralnego zarządzania stanem autoryzacji
- Hook `useAuth()` aliasujący `useAuthContext()` dla wygodnego importu w komponentach
- Komponent `ProtectedRoute` w `web/src/components/ProtectedRoute.tsx` do ochrony tras wymagających zalogowania
- Formularze logowania i rejestracji w `web/src/components/auth/` z walidacją Zod i React Hook Form
- Po rejestracji przekierowanie na `/login` z komunikatem o sukcesie, po zalogowaniu przekierowanie na `/dashboard`
- Widok Dashboard pokazuje informacje o rolach i emailu użytkownika oraz przycisk wylogowania

### Baza danych
- Zaktualizowano schemat Prisma o nowe modele i relacje
- Dodano enumy dla statusów kursów i zapisów
- Wprowadzono soft delete dla kursów z aktywnymi zapisami
- Dodano indeksy dla optymalizacji zapytań

### Bezpieczeństwo
- Wprowadzono role użytkowników (ADMIN, TRAINER, PARTICIPANT)
- Dodano middleware do weryfikacji uprawnień
- Zaimplementowano walidację JWT tokenów
- Dodano zabezpieczenia przed nieautoryzowanym dostępem