import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { adminService, AdminStatsResponseDto } from '../../services/admin.service';
import { PageLoading } from '../../components/common/PageLoading';
import { Alert } from '../../components/common/Alert';

export const AdminStatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.getStats();
        setStats(response);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Nie udało się załadować statystyk systemu.');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const getBreadcrumbs = () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Panel Administratora', href: '/admin', icon: '⚙️' },
    { label: 'Statystyki systemu', icon: '📊' },
  ];

  return (
    <ProtectedLayout
      breadcrumbs={getBreadcrumbs()}
      pageTitle="Statystyki systemu"
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        {loading && <PageLoading message="Ładowanie statystyk..." />}
        {error && <Alert type="error" title="Błąd ładowania danych" message={error} className="mb-4" />}
        
        {!loading && !error && stats && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Podsumowanie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Karta: Data wygenerowania */}
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Data wygenerowania</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {new Date(stats.generatedAt).toLocaleString('pl-PL')}
                </p>
              </div>
            </div>

            {/* Sekcja: Statystyki Użytkowników */}
            <section className="mb-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Statystyki Użytkowników</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Całkowita liczba użytkowników:</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.users.totalUsers}</p>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Użytkownicy według ról:</p>
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                    <li>Administratorzy: {stats.users.usersByRole.ADMIN || 0}</li>
                    <li>Trenerzy: {stats.users.usersByRole.TRAINER || 0}</li>
                    <li>Uczestnicy: {stats.users.usersByRole.PARTICIPANT || 0}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sekcja: Statystyki Kursów */}
            <section className="mb-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Statystyki Kursów</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Całkowita liczba kursów:</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.courses.totalCourses ?? 0}</p>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kursy według statusu:</p>
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                    {stats.courses.coursesByStatus && Object.keys(stats.courses.coursesByStatus).length > 0 ? (
                      Object.entries(stats.courses.coursesByStatus).map(([status, count]) => (
                        <li key={status}>{status}: {count}</li>
                      ))
                    ) : (
                      <li>Brak danych o statusach kursów.</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Sekcja: Statystyki Zapisów */}
            <section className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Statystyki Zapisów na Kursy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Całkowita liczba zapisów:</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.enrollments.totalEnrollments ?? 0}</p>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Zapisy według statusu:</p>
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                    {stats.enrollments.enrollmentsByStatus && Object.keys(stats.enrollments.enrollmentsByStatus).length > 0 ? (
                      Object.entries(stats.enrollments.enrollmentsByStatus).map(([status, count]) => (
                        <li key={status}>{status}: {count}</li>
                      ))
                    ) : (
                      <li>Brak danych o statusach zapisów.</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default AdminStatisticsPage; 