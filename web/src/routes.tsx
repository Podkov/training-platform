import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading dla stron
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const CourseListPage = React.lazy(() => import('./pages/courses/CourseListPage'));
const CourseDetailsPage = React.lazy(() => import('./pages/courses/CourseDetailsPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const AdminPage = React.lazy(() => import('./pages/admin/AdminPage'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const AdminStatisticsPage = React.lazy(() => import('./pages/admin/AdminStatisticsPage'));

// Potrzebujemy ProtectedRoute do sprawdzania ról
import { ProtectedRoute } from './components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <React.Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Ładowanie...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Publiczne trasy */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Chronione trasy - używają ProtectedLayout wewnętrznie */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Trasa dla Panelu Administratora */}
        <Route 
          path="/admin" 
          element={(
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          )}
        />
        {/* Trasa dla Zarządzania Użytkownikami w Panelu Admina */}
        <Route
          path="/admin/users"
          element={(
            <ProtectedRoute requiredRole="ADMIN">
              <UserManagementPage />
            </ProtectedRoute>
          )}
        />
        {/* Trasa dla Statystyk Systemu w Panelu Admina */}
        <Route
          path="/admin/statistics"
          element={(
            <ProtectedRoute requiredRole="ADMIN">
              <AdminStatisticsPage />
            </ProtectedRoute>
          )}
        />
        
        {/* Przekierowanie */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 - można dodać później */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
}; 