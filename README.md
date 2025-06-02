# Training Platform Monorepo

## Opis projektu
Training Platform to monorepo zawierające aplikację webową (frontend) i API (backend) do zarządzania platformą szkoleniową. System umożliwia zarządzanie kursami, zapisami uczestników oraz role-based access control z nowoczesnym interfejsem użytkownika.

### ✨ Stan aktualny (v1.0)
- **🎨 Nowoczesny UI/UX**: Complete design system z TrainingHub branding
- **🧭 Smart Navigation**: Top navbar, breadcrumbs, responsive mobile menu
- **📚 Full Course Management**: CRUD operations, enrollment system, participant tracking
- **🔐 Role-Based Security**: ADMIN/TRAINER/PARTICIPANT z granular permissions  
- **📱 Mobile-First Design**: Responsive layout dla wszystkich urządzeń
- **⚡ Real-Time Updates**: Live enrollment status, dynamic content
- **🛡️ Type-Safe Architecture**: Full TypeScript implementation z proper validation

Aplikacja jest gotowa do użycia i zawiera wszystkie podstawowe funkcjonalności platformy edukacyjnej.

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
│   │   │   ├── auth/           # komponenty autoryzacji (LoginForm, RegisterForm)
│   │   │   ├── courses/        # komponenty kursów (CourseCard, CourseModal, CourseList)
│   │   │   ├── layout/         # komponenty layoutu (Navbar, Breadcrumbs, AppLayout, ProtectedLayout)
│   │   │   └── common/         # wspólne komponenty (Button)
│   │   ├── contexts/      # konteksty React (AuthContext)
│   │   ├── hooks/         # hooki React (useAuth)
│   │   ├── services/      # serwisy API (auth.service, course.service)
│   │   ├── pages/         # strony aplikacji
│   │   │   ├── auth/           # strony autoryzacji (LoginPage, RegisterPage)
│   │   │   ├── dashboard/      # dashboard główny
│   │   │   ├── courses/        # strony kursów (CourseListPage, CourseDetailsPage)
│   │   │   └── profile/        # profil użytkownika
│   │   └── routes.tsx     # konfiguracja React Router
│   └── Dockerfile     # Konfiguracja kontenera web
├── data/              # Dane (baza SQLite)
│   └── dev.db        # Plik bazy danych SQLite
└── docker-compose.yml # Orchestracja kontenerów
```

## Technologie
- **Backend:**
  - Bun 1.0.25 (runtime i package manager)
  - TypeScript (strong typing)
  - Express 5 (web framework)
  - Prisma ORM (database ORM)
  - SQLite (baza danych)
  - JWT dla autoryzacji
  - Zod dla walidacji
  - Bcrypt dla hashowania haseł
- **Frontend:**
  - React 18 (UI framework)
  - TypeScript (strong typing)
  - Vite (build tool)
  - Tailwind CSS (utility-first CSS framework)
  - React Router v6 (routing)
  - React Hook Form (forms management)
  - Zod dla walidacji formularzy
  - Axios (HTTP client)
- **DevTools:**
  - ESLint + Prettier (code formatting)
  - TypeScript strict mode
  - Git hooks (husky)
- **Infrastruktura:**
  - Docker & Docker Compose
  - Nginx (reverse proxy)

## Funkcjonalności

### 🧭 Navigation & Layout
- **Top Navigation Bar**: Logo TrainingHub, główne menu, user dropdown
- **Breadcrumbs**: Automatyczna nawigacja ścieżkowa (Home > Kursy > Szczegóły)
- **User Menu**: Avatar, profil, wylogowanie z dropdown

### 🔐 Autoryzacja & Bezpieczeństwo
- **Role-Based Access Control**: ADMIN, TRAINER, PARTICIPANT
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Automatyczne przekierowania i kontrola dostępu
- **Session Management**: Auto-logout, token refresh
- **Form Validation**: Real-time validation z Zod schemas

### 📚 Zarządzanie Kursami
- **Course CRUD**: Pełne zarządzanie kursami (tworzenie, edycja, usuwanie)
- **Course Details**: Szczegółowe widoki z opisem, statusem, uczestnikami
- **Enrollment System**: Zapisy/wypisy uczestników z real-time updates
- **Filtering & Search**: Filtrowanie kursów według statusu
- **Participant Management**: Lista uczestników dla admin/trainer

### 👥 User Management
- **User Profiles**: Zarządzanie profilem użytkownika
- **Dashboard**: Personalized welcome screen z quick actions
- **Activity Tracking**: Historia zapisów na kursy
- **Role Display**: Czytelne wyświetlanie ról i uprawnień

## Wymagania
- **Development:**
  - Node.js 18+ lub Bun 1.0.25+
  - Git
- **Production:**
  - Docker
  - Docker Compose

## Konfiguracja

### 1. Environment Variables
Utwórz plik `.env` w katalogu `api/`:
```env
DATABASE_URL="file:../../data/dev.db"
JWT_SECRET="twoj-tajny-klucz-min-32-znaki-dla-bezpieczenstwa"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost,http://localhost:3000"
```

### 2. Database Setup
```bash
# W katalogu głównym projektu
cd api
bunx prisma migrate dev --name init
bunx prisma generate
```

### 3. Seed Data (opcjonalnie)
```bash
cd api
bunx prisma db seed
```

## Uruchomienie

### 1. Development Mode (Recommended)

#### Backend (API)
```bash
# W katalogu api/
cd api
bun install
bun run dev
# API dostępne na: http://localhost:4000
```

#### Frontend (Web)
```bash
# W katalogu web/
cd web
bun install
bun run dev
# App dostępna na: http://localhost:3000
```

### 2. Production Mode (Docker)

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
```bash
# Skopiuj przykładowy plik .env
cp api/.env.example api/.env
# Edytuj plik .env i ustaw odpowiednie wartości
```

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

# Restart pojedynczego serwisu
docker-compose restart api
docker-compose restart web

# Sprawdzenie statusu kontenerów
docker-compose ps
```

### 3. Troubleshooting

#### Częste problemy i rozwiązania

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

## API Documentation

### Autoryzacja
- `POST /auth/register` - rejestracja użytkownika
  - Body: `{ "email": string, "password": string, "role"?: "ADMIN" | "TRAINER" | "PARTICIPANT" }`
  - Response: `{ "token": string }`
- `POST /auth/login` - logowanie
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "token": string }`

### Kursy
- `GET /courses` - lista kursów z filtrowaniem
  - Query: `?status=active|finished&page=1&limit=10`
  - Response: `Course[]`
- `GET /courses/:id` - szczegóły kursu z liczbą uczestników
  - Response: `CourseResponseDto`
- `POST /courses` - utworzenie kursu (ADMIN/TRAINER)
  - Body: `CreateCourseDto`
  - Response: `CourseResponseDto`
- `PUT /courses/:id` - aktualizacja kursu (ADMIN/TRAINER)
  - Body: `UpdateCourseDto`
  - Response: `CourseResponseDto`
- `DELETE /courses/:id?force=true` - usunięcie kursu (ADMIN/TRAINER)
  - Query: `force=true` - force delete z aktywnymi zapisami
  - Response: `204 No Content`

### Zapisy na kursy (Enrollments)
- `POST /enrollments/courses/:id/enroll` - zapis na kurs (PARTICIPANT)
  - Response: `EnrollmentResponseDto`
- `DELETE /enrollments/courses/:id/enroll` - anulowanie zapisu (PARTICIPANT)
  - Response: `204 No Content`
- `GET /enrollments/users/me/courses` - lista moich kursów
  - Response: `UserCoursesResponseDto`
- `GET /enrollments/courses/:courseId` - uczestnicy kursu (ADMIN/TRAINER)
  - Response: `EnrollmentResponseDto[]`
- `GET /enrollments` - wszystkie zapisy (ADMIN/TRAINER)
  - Response: `EnrollmentResponseDto[]`

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
  - Response: `{ "status": "ok", "timestamp": string, "uptime": number }`

## Database Schema

### Modele
```prisma
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  passwordHash String        @map("password_hash")
  role         UserRole      @default(PARTICIPANT)
  enrollments  Enrollment[]
}

model Course {
  id          Int             @id @default(autoincrement())
  title       String
  description String
  status      CourseStatus    @default(active)
  enrollments Enrollment[]
}

model Enrollment {
  id        Int              @id @default(autoincrement())
  userId    Int
  courseId  Int
  status    EnrollmentStatus @default(active)
  user      User             @relation(fields: [userId], references: [id])
  course    Course           @relation(fields: [courseId], references: [id])
}
```

### Enumy
```prisma
enum UserRole {
  ADMIN
  TRAINER  
  PARTICIPANT
}

enum CourseStatus {
  active
  finished
}

enum EnrollmentStatus {
  active
  cancelled
}
```

## Frontend Architecture

### Layout System
- **AppLayout**: Base layout z navbar, breadcrumbs, footer
- **ProtectedLayout**: Layout z autoryzacją i role checking
- **Navbar**: Top navigation z logo, menu, user dropdown
- **Breadcrumbs**: Auto-generated navigation path

### Component Structure
```
components/
├── layout/
│   ├── Navbar.tsx          # Top navigation bar
│   ├── Breadcrumbs.tsx     # Navigation breadcrumbs
│   ├── AppLayout.tsx       # Base app layout
│   └── ProtectedLayout.tsx # Auth-protected layout
├── common/
│   └── Button/             # Reusable button component
├── auth/
│   ├── LoginForm.tsx       # Login form with validation
│   └── RegisterForm.tsx    # Registration form
└── courses/
    ├── CourseCard.tsx      # Course display card
    ├── CourseModal.tsx     # Course create/edit modal
    └── CourseList.tsx      # Course listing component
```

### Pages Structure
```
pages/
├── auth/
│   ├── LoginPage.tsx       # Login page
│   └── RegisterPage.tsx    # Registration page
├── dashboard/
│   └── DashboardPage.tsx   # Main dashboard
├── courses/
│   ├── CourseListPage.tsx  # Course listing with filters
│   └── CourseDetailsPage.tsx # Course details with enrollment
└── profile/
    └── ProfilePage.tsx     # User profile management
```

### State Management
- **AuthContext**: Global authentication state
- **Local State**: Component-level state z useState/useEffect
- **API Integration**: Axios z interceptors dla token management

## Recent Updates & Features

### 🚀 Latest Implementation (Current Release)
- **CourseDetailsPage**: Kompletna strona szczegółów kursu z:
  - Wyświetlaniem pełnych informacji o kursie (tytuł, opis, status, liczba uczestników)
  - Real-time enrollment system dla uczestników (zapisy/wypisy)
  - Lista uczestników dla administratorów i trenerów z danymi użytkowników
  - Inline editing via CourseModal integration
  - Force delete functionality dla administratorów
  - Dynamic breadcrumbs z tytułem kursu
  - Role-based action buttons dostosowane do uprawnień użytkownika

### 🎨 Modern UI/UX Implementation
- **Complete Design System**: Implemented consistent visual language
- **Navigation Overhaul**: Added top navbar, breadcrumbs, user menu
- **TrainingHub Branding**: Professional logo z emoji 🎓 i consistent styling
- **Responsive Layout**: Mobile-first design z hamburger menu
- **Dark Mode**: Full dark mode support across all components
- **Loading States**: Elegant loading animations i error handling
- **Empty States**: Meaningful placeholders z actionable suggestions

### 🧭 Advanced Navigation System
- **Top Navigation Bar**: 
  - Logo "TrainingHub" z link do dashboard
  - Main menu (Dashboard, Kursy) z active states
  - User avatar dropdown z email, role, actions
  - Responsive hamburger menu dla mobile
- **Smart Breadcrumbs**: 
  - Auto-generated navigation path z route mapping
  - Custom breadcrumbs override support
  - Clickable path navigation z icons
  - Dynamic course titles w breadcrumbs
- **Protected Routing**: Role-based access control z automatic redirects
- **Layout Architecture**: Hierarchical layout system (AppLayout > ProtectedLayout)
- **Mobile Navigation**: Responsive hamburger menu z smooth animations

### 📚 Enhanced Course Management
- **CourseListPage**: 
  - Advanced filtering system (active/finished/all)
  - Empty states z call-to-action buttons
  - Role-based create course functionality
  - Real-time enrollment counts
- **CourseDetailsPage**: 
  - Comprehensive course view z enrollment management
  - Participant management dla admin/trainer
  - Live enrollment status checking
  - Contextual action buttons
- **CourseCard & CourseModal**: 
  - Reusable course components
  - Form validation z React Hook Form + Zod
  - Real-time status updates
- **Real-time Updates**: Live enrollment counts i status updates
- **CRUD Operations**: Complete course lifecycle management

### 👤 User Experience Enhancements
- **Dashboard Redesign**:
  - Personalized welcome screen z user avatar
  - Quick action cards z navigation
  - Role-appropriate content display
- **Profile Management**:
  - User profile page z comprehensive information
  - Settings placeholders dla future features
  - Role display z proper translations
- **Authentication Flow**:
  - Success messaging system
  - Proper redirects post-registration/login
  - Error handling z user-friendly messages

### 🔧 Technical Architecture Improvements
- **Layout System Architecture**:
  ```
  AppLayout (base wrapper)
  ├─ Navbar (top navigation)
  ├─ Breadcrumbs (path navigation)  
  ├─ Page Header (title + actions)
  ├─ Main Content (page content)
  └─ Footer (app information)
  ```
- **ProtectedLayout**: Auth wrapper z automatic redirects
- **Component Architecture**: Modular, reusable components z TypeScript
- **API Integration**: Unified service layer z proper error handling
- **Form Management**: React Hook Form + Zod validation
- **Code Organization**: Clear separation of concerns (layout/pages/components)
- **Performance**: Lazy loading, optimized re-renders, efficient updates

### 🎯 User Interface Patterns
- **Consistent Color Scheme**: Blue primary colors z proper contrast
- **Typography Hierarchy**: Proper heading scales i text sizes
- **Spacing System**: Consistent margins, padding, gaps
- **Icon Usage**: Meaningful icons throughout interface
- **Button States**: Loading, disabled, hover states
- **Form Validation**: Real-time feedback z error styling
- **Modal System**: Centered modals z backdrop handling
- **Table Design**: Responsive tables z proper headers

### 🛡️ Security & Authorization
- **JWT Implementation**: Secure token-based authentication
- **Role-Based Access**: Granular permissions per user role
- **Protected Routes**: Automatic auth checks z redirects
- **Token Management**: Auto-refresh i secure storage
- **Input Validation**: Server i client-side validation z Zod

### 📱 Responsive Design Features
- **Mobile-First**: Design starts z mobile i scales up
- **Breakpoint System**: sm/md/lg/xl responsive breakpoints
- **Touch-Friendly**: Proper touch targets i spacing
- **Hamburger Navigation**: Collapsible mobile menu
- **Adaptive Content**: Content adapts to screen sizes
- **Performance**: Optimized dla mobile networks

### 🚀 Developer Experience
- **TypeScript Everywhere**: Full type safety w całej aplikacji
- **Component Exports**: Centralized exports z index files
- **Prop Interfaces**: Well-defined component interfaces
- **Reusable Patterns**: Layout, Button, Form patterns
- **Error Boundaries**: Graceful error handling
- **Development Tools**: Hot reload, TypeScript checking

## Jak używać aplikacji

### 🧭 Navigation Guide
1. **Główna nawigacja**: 
   - Kliknij logo "TrainingHub" aby wrócić do Dashboard
   - Użyj menu "Dashboard" i "Kursy" w top navbar
   - Na mobile: hamburger menu (☰) w prawym górnym rogu

2. **Breadcrumbs Navigation**:
   - Automatyczne ślady nawigacji: Home > Kursy > Szczegóły
   - Każdy element breadcrumb jest klikalny (oprócz obecnej strony)
   - Pokazuje aktualną lokalizację w aplikacji

3. **User Menu**:
   - Kliknij avatar użytkownika (pierwsza litera email) w prawym górnym rogu
   - Dostęp do profilu i wylogowania
   - Wyświetla aktualną rolę użytkownika

### 📚 Course Management Workflow
1. **Przeglądanie kursów**:
   - Idź do "Kursy" w głównym menu
   - Filtruj kursy: Wszystkie / Aktywne / Zakończone
   - Kliknij "Zobacz szczegóły" na karcie kursu

2. **Zarządzanie kursami** (Admin/Trainer):
   - Przycisk "Dodaj nowy kurs" na liście kursów
   - Na szczegółach kursu: "Edytuj kurs" / "Usuń kurs"
   - Modal z formularzem tworzenia/edycji

3. **Zapisy na kursy** (Participant):
   - Na liście lub szczegółach kursu: "Zapisz się" / "Wypisz się"
   - Real-time aktualizacja statusu zapisu
   - Tylko aktywne kursy pozwalają na zapisy

### 👥 User Roles & Permissions
- **PARTICIPANT**: 
  - Przeglądanie kursów
  - Zapisywanie/wypisywanie się z kursów
  - Dostęp do własnego profilu
- **TRAINER**: 
  - Wszystko co Participant +
  - Tworzenie, edycja, usuwanie kursów
  - Podgląd listy uczestników kursu
- **ADMIN**: 
  - Wszystko co Trainer +
  - Zarządzanie użytkownikami (planned)
  - Dostęp do statystyk (planned)

### 📱 Mobile Experience
- **Responsive Design**: Aplikacja automatycznie dostosowuje się do rozmiaru ekranu
- **Touch-Friendly**: Wszystkie elementy są odpowiednio duże dla dotknięć
- **Hamburger Menu**: Na mobile główna nawigacja ukrywa się pod przycisk ☰
- **Optimized Forms**: Formularze dostosowane do klawiatury mobilnej

## Development Workflow

### Code Quality
- **TypeScript Strict Mode**: Full type safety
- **ESLint + Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation
- **Component Testing**: React Testing Library

### API Development
- **Domain-Driven Design**: Clean architecture z entities, services, repositories
- **Error Handling**: Custom exceptions z proper HTTP status codes
- **Validation**: Zod schemas na client i server side
- **Documentation**: OpenAPI/Swagger specs (planned)

## Deployment

### Development
```bash
# Start backend
cd api && bun run dev

# Start frontend  
cd web && bun run dev

# Database migrations
cd api && bunx prisma migrate dev
```

### Production
```bash
# Docker Compose
docker-compose up --build

# Manual deployment
cd api && bun run build && bun run start
cd web && bun run build && bun run preview
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Zmień porty w docker-compose.yml
2. **Database locks**: Restart containers lub usuń dev.db
3. **CORS errors**: Sprawdź konfigurację w api/src/index.ts
4. **Build errors**: Wyczyść node_modules i reinstaluj dependencies

### Logs
```bash
# Backend logs
cd api && bun run dev --verbose

# Frontend logs  
cd web && bun run dev --debug

# Docker logs
docker-compose logs -f api
docker-compose logs -f web
```

## Contributing

### Development Setup
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `bun install` w api/ i web/
4. Run tests: `bun test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push branch: `git push origin feature/amazing-feature`
7. Create Pull Request

### Code Standards
- Use TypeScript strict mode
- Follow existing component patterns
- Add tests for new features
- Update documentation
- Use conventional commits

---

