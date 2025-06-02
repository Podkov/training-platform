import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { Button } from '../../components/common/Button';
import { CourseStatus } from '../../services/course.service';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isParticipant = user?.role === 'PARTICIPANT';
  const isAdmin = user?.role === 'ADMIN';

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'TRAINER': return 'Trener';
      case 'PARTICIPANT': return 'Uczestnik';
      default: return 'Użytkownik';
    }
  };

  // Zaktualizowano typ, aby zawierał opcjonalne pole `state`
  type QuickAction = {
    title: string;
    description: string;
    icon: string;
    href: string;
    color: string;
    state?: any; // Można tu użyć bardziej szczegółowego typu, jeśli jest znany
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Przeglądaj kursy',
      description: 'Zobacz dostępne kursy i zapisz się na interesujące Cię szkolenia',
      icon: '📚',
      href: '/courses',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      // state: undefined // niepotrzebne, bo jest opcjonalne
    },
    {
      title: 'Mój profil',
      description: 'Zarządzaj swoim kontem i ustawieniami',
      icon: '👤',
      href: '/profile',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      // state: undefined
    }
  ];

  // Definicja nowego kafelka "Moje aktywne kursy"
  const myActiveCoursesAction: QuickAction = { // Użycie typu QuickAction
    title: 'Moje aktywne kursy',
    description: 'Szybki dostęp do kursów, w których aktualnie uczestniczysz',
    icon: '🎯',
    href: '/courses',
    color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    state: { preselectFilters: { myCourses: true, status: CourseStatus.Active } }
  };

  // Definicja kafelka dla Panelu Administratora
  const adminPanelAction: QuickAction = {
    title: 'Panel Administratora',
    description: 'Zarządzaj użytkownikami, kursami i ustawieniami systemu',
    icon: '🛠️', // Można wybrać inną ikonę, np. ⚙️
    href: '/admin',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    // state nie jest tu potrzebny, bo /admin to dedykowana strona
  };

  // Łączenie akcji
  let allQuickActions: QuickAction[] = [...quickActions];
  if (isParticipant) {
    allQuickActions.push(myActiveCoursesAction);
  }
  // Admin może być jednocześnie participantem, więc nie używamy `else if`
  if (isAdmin) { 
    // Dodajmy kafelek admina na konkretnej pozycji, np. jako trzeci, jeśli są 3 miejsca w rzędzie
    // lub po prostu na końcu, jeśli układ jest elastyczny.
    // Dla uproszczenia, dodaję na końcu. Można dostosować sortowanie lub wstawianie.
    allQuickActions.push(adminPanelAction);
  }

  // Można by posortować `allQuickActions` według jakiegoś priorytetu, jeśli kolejność ma znaczenie
  // np. quickActions.sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <ProtectedLayout pageTitle="Dashboard">
      <div className="container mx-auto px-4 py-8 min-h-full">
        {/* Powitanie */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-blue-600 dark:text-blue-400">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Witaj, {user?.email}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Rola: {getRoleDisplayName(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Szybkie akcje */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allQuickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              state={action.state}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Statystyki/ostatnie aktywności - można rozbudować później */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Szybki przegląd
          </h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-gray-600 dark:text-gray-300">
              System szkoleniowy TrainingHub jest gotowy do użycia!
            </p>
            <div className="mt-4">
              <Link to="/courses">
                <Button>
                  Rozpocznij eksplorowanie kursów
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default DashboardPage; 