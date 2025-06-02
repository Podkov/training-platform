import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppLayout } from './AppLayout';
import { UserRole } from '../../services/course.service';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  actions?: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requiredRole,
  breadcrumbs,
  pageTitle,
  actions,
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <AppLayout pageTitle="Brak uprawnień">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Brak uprawnień
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Nie masz wystarczających uprawnień do wyświetlenia tej strony.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Wymagana rola: {requiredRole} | Twoja rola: {user?.role}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      pageTitle={pageTitle}
      actions={actions}
    >
      {children}
    </AppLayout>
  );
}; 