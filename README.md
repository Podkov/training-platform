# Training Platform

## 📋 Opis projektu
Training Platform to nowoczesna platforma szkoleniowa umożliwiająca zarządzanie kursami, zapisami uczestników oraz kontrolę dostępu opartą na rolach. System został zaprojektowany z myślą o skalowalności, bezpieczeństwie i wygodzie użytkowania.

## 🏗 Struktura projektu
```
training-platform/
├── api/                # Backend (Express.js + TypeScript)
│   ├── prisma/         # Schemat bazy danych i migracje
│   ├── src/            # Kod źródłowy
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entities/       # Encje domenowe
│   │   ├── exceptions/     # Wyjątki HTTP
│   │   ├── repositories/   # Warstwa dostępu do danych
│   │   ├── services/       # Logika biznesowa
│   │   ├── controllers/    # Kontrolery HTTP
│   │   ├── routes/         # Definicje endpointów
│   │   ├── middlewares/    # Middleware (auth, walidacja)
│   │   ├── utils/          # Narzędzia pomocnicze
│   │   └── index.ts        # Konfiguracja aplikacji
│   └── Dockerfile      # Konfiguracja kontenera API
├── web/               # Frontend (React + TypeScript)
│   ├── src/           # Kod źródłowy
│   │   ├── components/    # Komponenty React
│   │   ├── contexts/      # Konteksty React
│   │   ├── hooks/         # Hooki React
│   │   ├── services/      # Serwisy API
│   │   ├── pages/         # Strony aplikacji
│   │   ├── utils/         # Narzędzia pomocnicze
│   │   └── routes.tsx     # Konfiguracja routingu
│   └── Dockerfile     # Konfiguracja kontenera web
├── data/              # Dane (baza SQLite)
│   └── dev.db        # Plik bazy danych SQLite
└── docker-compose.yml # Orchestracja kontenerów
```

## 🛠 Stack technologiczny

### Backend
- **Bun 1.0.25** - Szybki runtime JavaScript/TypeScript z wbudowanym package managerem
- **TypeScript** - Typowanie statyczne dla lepszej jakości kodu
- **Express 5** - Lekki i elastyczny framework webowy
- **Prisma ORM** - Nowoczesny ORM z type-safety i migracjami
- **SQLite** - Lekka baza danych idealna dla MVP
- **JWT** - Bezpieczna autoryzacja oparta na tokenach
- **Zod** - Walidacja danych z type inference
- **Bcrypt** - Bezpieczne hashowanie haseł

### Frontend
- **React 18** - Biblioteka UI z nowymi funkcjami jak Suspense
- **TypeScript** - Typowanie statyczne dla komponentów
- **Vite** - Szybki bundler z HMR
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Routing z nowymi funkcjami
- **React Hook Form** - Zarządzanie formularzami
- **Zod** - Walidacja formularzy
- **Axios** - HTTP client z interceptors

### DevTools
- **ESLint + Prettier** - Formatowanie i linting kodu
- **TypeScript strict mode** - Maksymalne bezpieczeństwo typów
- **Git hooks (husky)** - Automatyzacja przed commit

### Infrastruktura
- **Docker & Docker Compose** - Konteneryzacja i orchestracja
- **Nginx** - Reverse proxy i serwowanie statycznych plików

## 🚀 Uruchomienie

### Development Mode

#### Backend (API)
```bash
cd api
bun install
bun run dev
# API dostępne na: http://localhost:4000
```

#### Frontend (Web)
```bash
cd web
bun install
bun run dev
# App dostępna na: http://localhost:3000
```

### Production Mode

#### Przygotowanie
1. Upewnij się, że masz zainstalowane:
   - Docker
   - Docker Compose
   - Git

2. Sklonuj repozytorium:
```bash
git clone <repo-url>
cd training-platform
```

3. Skonfiguruj zmienne środowiskowe:

Przykładowa zawartość pliku api/.env
# Ścieżka do bazy danych SQLite
DATABASE_URL="file:../../data/dev.db"

# Klucz do podpisywania JWT (wygeneruj nowy!)
JWT_SECRET="twoj-tajny-klucz-min-32-znaki-32"


#### Uruchomienie
```bash
# Zbuduj i uruchom wszystkie kontenery
docker-compose up --build

# Lub w trybie detached (w tle)
docker-compose up -d --build
```

#### Dostęp do aplikacji
- Frontend: http://localhost
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health
#### Przydatne komendy Docker
```bash
# Zatrzymanie kontenerów
docker-compose down

# Przeglądanie logów
docker-compose logs -f api    # logi API
docker-compose logs -f web    # logi frontendu

1. **Problem z CORS**
   - Sprawdź czy w pliku `api/.env` masz poprawnie ustawioną zmienną `CORS_ORIGIN`
   - Dla development: `CORS_ORIGIN="http://localhost,http://localhost:3000"`
   - Dla production: `CORS_ORIGIN="http://localhost"`

2. **Problem z bazą danych**
   - Sprawdź czy plik `data/dev.db` istnieje
   - Wykonaj ponownie migracje: `bunx prisma migrate reset`
   - Sprawdź uprawnienia do pliku bazy danych

3. **Problem z portami**
   - Sprawdź czy porty 80 (frontend) i 4000 (backend) są wolne
   - Możesz zmienić porty w `docker-compose.yml`

4. **Problem z Docker**
   - Wyczyść cache: `docker-compose build --no-cache`
   - Usuń wszystkie kontenery: `docker-compose down -v`
   - Sprawdź logi: `docker-compose logs -f`

## ✨ Główne funkcjonalności

### 🧭 Navigation & Layout
- Top Navigation Bar z logo i menu
- Breadcrumbs dla nawigacji
- Responsywny design dla mobile
- Dark mode support

### 🔐 Autoryzacja & Bezpieczeństwo
- Role-Based Access Control (ADMIN/TRAINER/PARTICIPANT)
- JWT Authentication
- Protected Routes
- Form Validation

### 📚 Zarządzanie Kursami
- CRUD dla kursów
- System zapisów
- Filtrowanie i wyszukiwanie
- Zarządzanie uczestnikami

### 👥 User Management
- Profile użytkowników
- Dashboard
- Historia aktywności
- Zarządzanie rolami

## API Documentation

### Autoryzacja
- `POST /auth/register` - rejestracja użytkownika
  - Body: `{ "email": string, "password": string, "role"?: "ADMIN" | "TRAINER" | "PARTICIPANT" }`
  - Response: `{ "token": string }`
- `POST /auth/login` - logowanie
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "token": string }`

### Użytkownicy
- `GET /users/me` - mój profil
  - Response: `UserResponseDto`
- `GET /users/:id` - profil użytkownika (ADMIN/TRAINER lub własny)
  - Response: `UserResponseDto`
- `PUT /users/:id` - aktualizacja profilu (ADMIN lub własny)
  - Body: `UpdateUserDto`
  - Response: `UserResponseDto`
- `PUT /users/me/password` - zmiana hasła
  - Body: `{ "currentPassword": string, "newPassword": string }`
  - Response: `204 No Content`
- `DELETE /users/:id` - usunięcie konta (ADMIN lub własne)
  - Response: `204 No Content`
- `GET /users/:id/can-delete` - sprawdzenie czy użytkownik może być usunięty (ADMIN)
  - Response: `{ "canDelete": boolean, "reason"?: string }`

### Kursy
- `GET /courses` - lista kursów z filtrowaniem
  - Query: `?status=active|finished&page=1&limit=10&myCourses=true`
  - Response: `Course[]`
- `GET /courses/:id` - szczegóły kursu
  - Response: `CourseResponseDto`
- `POST /courses` - utworzenie kursu (ADMIN/TRAINER)
  - Body: `CreateCourseDto`
  - Response: `CourseResponseDto`
- `PUT /courses/:id` - aktualizacja kursu (ADMIN/TRAINER)
  - Body: `UpdateCourseDto`
  - Response: `CourseResponseDto`
- `DELETE /courses/:id` - usunięcie kursu (ADMIN/TRAINER)
  - Response: `204 No Content`

### Zapisy na kursy (Enrollments)
- `POST /enrollments/courses/:id/enroll` - zapis na kurs (PARTICIPANT)
  - Response: `EnrollmentResponseDto`
- `DELETE /enrollments/courses/:id/enroll` - anulowanie zapisu (PARTICIPANT)
  - Response: `204 No Content`
- `GET /enrollments` - wszystkie zapisy (ADMIN/TRAINER)
  - Response: `EnrollmentResponseDto[]`
- `GET /enrollments/courses/:courseId` - uczestnicy kursu (ADMIN/TRAINER)
  - Response: `EnrollmentResponseDto[]`

### Panel administratora
- `GET /admin/users` - lista użytkowników (ADMIN)
  - Query: `?page=1&limit=10`
  - Response: `UserResponseDto[]`
- `POST /admin/users` - utworzenie użytkownika (ADMIN)
  - Body: `CreateUserDto`
  - Response: `UserResponseDto`
- `PUT /admin/users/:id/role` - zmiana roli użytkownika (ADMIN)
  - Body: `{ "role": "ADMIN" | "TRAINER" | "PARTICIPANT" }`
  - Response: `UserResponseDto`
- `GET /admin/stats` - statystyki platformy (ADMIN)
  - Response: `AdminStatsDto`
- `POST /admin/users/:id/force-delete` - wymuszenie usunięcia użytkownika (ADMIN)
  - Response: `204 No Content`
- `POST /admin/courses/:id/force-delete` - wymuszenie usunięcia kursu (ADMIN)
  - Response: `204 No Content`

### Health Check
- `GET /health` - sprawdzenie stanu API
  - Response: `{ "status": "ok", "timestamp": string, "uptime": number }`

## Database Schema

### Modele
```prisma
model User {
  id           Int    @id @default(autoincrement())
  email        String @unique
  passwordHash String @map("password_hash")
  role         String // "ADMIN" | "TRAINER" | "PARTICIPANT"
  enrollments  Enrollment[]
  systemEvents SystemEvent[] @relation("UserEvents")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at")
}

model Course {
  id          Int          @id @default(autoincrement())
  title       String
  description String
  status      String       @default("active")
  enrollments Enrollment[]
  systemEvents SystemEvent[] @relation("CourseEvents")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @default(now()) @updatedAt @map("updated_at")
}

model Enrollment {
  id        Int      @id @default(autoincrement())
  userId    Int
  courseId  Int
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])
  systemEvents SystemEvent[] @relation("EnrollmentEvents")
}

model SystemEvent {
  id                  Int      @id @default(autoincrement())
  eventType           String   @map("event_type") // np. USER_CREATED, COURSE_CREATED, USER_ENROLLED
  message             String
  relatedUserId       Int?     @map("related_user_id")
  relatedCourseId     Int?     @map("related_course_id")
  relatedEnrollmentId Int?     @map("related_enrollment_id")
  createdAt           DateTime @default(now()) @map("created_at")

  User          User?    @relation("UserEvents", fields: [relatedUserId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  Course        Course?  @relation("CourseEvents", fields: [relatedCourseId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  Enrollment    Enrollment? @relation("EnrollmentEvents", fields: [relatedEnrollmentId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([relatedUserId])
  @@index([relatedCourseId])
  @@index([relatedEnrollmentId])
}
```

### Relacje i indeksy

#### User
- Jeden do wielu z Enrollment (jeden użytkownik może mieć wiele zapisów)
- Jeden do wielu z SystemEvent (jeden użytkownik może mieć wiele zdarzeń)
- Unikalny indeks na email
- Timestamps (createdAt, updatedAt)

#### Course
- Jeden do wielu z Enrollment (jeden kurs może mieć wiele zapisów)
- Jeden do wielu z SystemEvent (jeden kurs może mieć wiele zdarzeń)
- Timestamps (createdAt, updatedAt)

#### Enrollment
- Relacja wiele do jednego z User (jeden użytkownik może mieć wiele zapisów)
- Relacja wiele do jednego z Course (jeden kurs może mieć wiele zapisów)
- Jeden do wielu z SystemEvent (jeden zapis może mieć wiele zdarzeń)
- Timestamps (createdAt, updatedAt)

#### SystemEvent
- Relacja wiele do jednego z User (opcjonalna)
- Relacja wiele do jednego z Course (opcjonalna)
- Relacja wiele do jednego z Enrollment (opcjonalna)
- Indeksy na polach relacji dla optymalizacji zapytań
- Timestamps (createdAt)

### Uwaga dotycząca SystemEvent
Model `SystemEvent` został dodany do schematu bazy danych, ale obecnie nie jest wykorzystywany w aplikacji. Plan zakładał implementację systemu logowania zdarzeń (audit log) dla:
- Tworzenia i modyfikacji użytkowników
- Tworzenia i modyfikacji kursów
- Zapisywania i anulowania zapisów na kursy

System miał służyć do śledzenia historii zmian i aktywności w aplikacji, co mogłoby być przydatne w przyszłości do:
- Debugowania problemów
- Analizy aktywności użytkowników
- Generowania raportów
- Zapewnienia transparentności działań administratorów

## Frontend Architecture

### Struktura projektu
```
web/src/
├── assets/           # Statyczne zasoby (obrazy, ikony)
├── components/       # Komponenty React
│   ├── admin/       # Komponenty panelu admina
│   ├── auth/        # Komponenty autoryzacji
│   ├── common/      # Wspólne komponenty UI
│   ├── courses/     # Komponenty kursów
│   └── layout/      # Komponenty układu strony
├── contexts/        # Konteksty React (AuthContext)
├── hooks/           # Custom hooks
├── pages/           # Strony aplikacji
├── services/        # Serwisy API
├── styles/          # Style CSS/SCSS
├── utils/           # Narzędzia pomocnicze
├── App.tsx          # Główny komponent aplikacji
├── main.tsx         # Punkt wejścia
└── routes.tsx       # Konfiguracja routingu
```

### Architektura komponentów

#### Layout System
- **AppLayout**: Główny układ aplikacji
  - Navbar z nawigacją
  - Breadcrumbs dla ścieżki
  - Container dla treści
  - Footer z informacjami

#### Komponenty
- **Auth**
  - LoginForm - formularz logowania
  - RegisterForm - formularz rejestracji
  - ProtectedRoute - ochrona routingu

- **Courses**
  - CourseCard - karta kursu
  - CourseList - lista kursów
  - CourseModal - modal tworzenia/edycji
  - CourseDetails - szczegóły kursu

- **Admin**
  - UserList - lista użytkowników
  - UserModal - zarządzanie użytkownikami
  - StatsPanel - panel statystyk

- **Common**
  - Button - przycisk z wariantami
  - Input - pole formularza
  - Modal - modal z backdrop
  - Table - tabela danych

### State Management
- **AuthContext**: Globalny stan autoryzacji
  - Token JWT
  - Dane użytkownika
  - Role i uprawnienia

- **Local State**: Stan komponentów
  - useState dla prostego stanu
  - useReducer dla złożonej logiki
  - Custom hooks dla logiki biznesowej

### Routing
- **Protected Routes**: Ochrona ścieżek
  - Sprawdzanie autoryzacji
  - Przekierowania
  - Role-based access

- **Route Structure**
  - /auth - logowanie/rejestracja
  - /dashboard - panel główny
  - /courses - lista kursów
  - /courses/:id - szczegóły kursu
  - /admin - panel administratora
  - /profile - profil użytkownika

### API Integration
- **Services Layer**
  - auth.service - autoryzacja
  - course.service - zarządzanie kursami
  - user.service - zarządzanie użytkownikami

- **Axios Configuration**
  - Interceptors dla tokenów
  - Error handling
  - Request/response transformacje

### Styling
- **Tailwind CSS**
  - Utility-first approach
  - Custom components
  - Responsive design
  - Dark mode support

### Performance
- **Code Splitting**
  - Lazy loading komponentów
  - Route-based splitting
  - Dynamic imports

- **Optimization**
  - Memoization (useMemo, useCallback)
  - Virtual scrolling dla list
  - Image optimization
  - Bundle size monitoring







