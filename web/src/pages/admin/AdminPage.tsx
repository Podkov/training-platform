import React from 'react';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { Link } from 'react-router-dom';

// Przykładowe dane dla kafelków w panelu admina
const adminSections = [
  {
    title: 'Zarządzanie użytkownikami',
    description: 'Przeglądaj, edytuj role i usuwaj konta użytkowników.',
    icon: '👥',
    href: '/admin/users',
    color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
  },
  {
    title: 'Zarządzanie kursami',
    description: 'Dodawaj, edytuj i usuwaj kursy w systemie.',
    icon: '📚',
    href: '/courses',
    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Statystyki systemu',
    description: 'Monitoruj aktywność i kluczowe wskaźniki platformy.',
    icon: '📊',
    href: '/admin/statistics',
    color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
  },
];

export const AdminPage: React.FC = () => {
  const getBreadcrumbs = () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Panel Administratora', icon: '⚙️' }
  ];

  return (
    <ProtectedLayout
      breadcrumbs={getBreadcrumbs()}
      pageTitle="Panel Administratora"
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Witaj w panelu administratora. Wybierz jedną z poniższych sekcji, aby rozpocząć zarządzanie systemem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              to={section.href}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
            >
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}>
                <span className="text-2xl">{section.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default AdminPage; 