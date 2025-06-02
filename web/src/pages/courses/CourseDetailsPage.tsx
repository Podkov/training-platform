import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  courseService, 
  Course, 
  Enrollment, 
  CourseStatus, 
  UserRole 
} from '../../services/course.service';
import { Button } from '../../components/common/Button';
import { CourseModal } from '../../components/courses/CourseModal';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState<Enrollment[]>([]);
  const [userCourses, setUserCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const courseId = parseInt(id || '0');
  const canManage = user?.role === UserRole.Admin || user?.role === UserRole.Trainer;
  const isAdmin = user?.role === UserRole.Admin;
  const isParticipant = user?.role === UserRole.Participant;

  // Sprawdź czy użytkownik jest zapisany na kurs
  const isEnrolled = userCourses.some(
    enrollment => enrollment.courseId === courseId && enrollment.status === 'active'
  );

  const fetchCourseDetails = async () => {
    if (!courseId) {
      setError('Nieprawidłowy ID kursu');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const courseData = await courseService.getById(courseId);
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania szczegółów kursu');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!courseId || !canManage) return;

    try {
      setEnrollmentsLoading(true);
      const enrollmentsData = await courseService.getCourseEnrollments(courseId);
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error('Błąd podczas pobierania zapisów:', err);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchEnrollmentHistory = async () => {
    if (!courseId || !isAdmin) return;

    try {
      setHistoryLoading(true);
      const historyData = await courseService.getCourseEnrollmentHistory(courseId);
      setEnrollmentHistory(historyData);
    } catch (err) {
      console.error('Błąd podczas pobierania historii zapisów:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUserCourses = async () => {
    if (!isParticipant) return;

    try {
      const data = await courseService.getMyCourses();
      setUserCourses([...data.activeCourses, ...data.finishedCourses]);
    } catch (err) {
      console.error('Błąd podczas pobierania kursów użytkownika:', err);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchUserCourses();
    fetchEnrollments();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course || !isParticipant || course.status !== CourseStatus.Active) return;

    try {
      setIsEnrolling(true);
      setError(null);
      await courseService.enroll(courseId);
      await fetchUserCourses();
      await fetchEnrollments(); // Odśwież listę uczestników
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania na kurs');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!course || !isParticipant) return;

    try {
      setIsUnenrolling(true);
      setError(null);
      await courseService.unenroll(courseId);
      await fetchUserCourses();
      await fetchEnrollments(); // Odśwież listę uczestników
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas wypisywania z kursu');
    } finally {
      setIsUnenrolling(false);
    }
  };

  const handleDelete = async () => {
    if (!course || !canManage) return;
    if (!confirm('Czy na pewno chcesz usunąć ten kurs?')) return;
    try {
      await courseService.delete(courseId, false); // normal delete
      navigate('/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania kursu');
    }
  };

  const handleForceDelete = async () => {
    if (!course || !canManage) return;
    if (!confirm('Czy na pewno chcesz usunąć kurs wraz ze wszystkimi zapisami?')) return;
    try {
      await courseService.delete(courseId, true); // force delete
      navigate('/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas wymuszania usunięcia kursu');
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchCourseDetails(); // Odśwież dane kursu
  };

  const handleCancelParticipant = async (userId: number) => {
    if (!confirm('Czy na pewno chcesz anulować zapis tego uczestnika?')) return;
    try {
      await courseService.cancelEnrollmentByAdmin(courseId, userId);
      await fetchEnrollments();
    } catch (err) {
      console.error('Błąd podczas anulowania zapisu:', err);
    }
  };

  const handleBulkCancel = async () => {
    if (!confirm('Czy na pewno chcesz anulować wszystkie zapisy w tym kursie?')) return;
    try {
      await courseService.cancelAllEnrollments(courseId);
      await fetchEnrollments();
    } catch (err) {
      console.error('Błąd podczas anulowania wszystkich zapisów:', err);
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    
    if (status === CourseStatus.Active) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`}>
          Aktywny
        </span>
      );
    }
    
    return (
      <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`}>
        Zakończony
      </span>
    );
  };

  const getEnrollmentButton = () => {
    if (!isParticipant || !course) return null;

    if (isEnrolled) {
      return (
        <Button
          variant="outline"
          onClick={handleUnenroll}
          isLoading={isUnenrolling}
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          {isUnenrolling ? 'Wypisywanie...' : 'Wypisz się z kursu'}
        </Button>
      );
    }

    if (course.status !== CourseStatus.Active) {
      return (
        <Button variant="outline" disabled>
          Kurs zakończony
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        onClick={handleEnroll}
        isLoading={isEnrolling}
      >
        {isEnrolling ? 'Zapisywanie...' : 'Zapisz się na kurs'}
      </Button>
    );
  };

  const getPageActions = () => {
    const actions: React.ReactNode[] = [];
    const enrollmentButton = getEnrollmentButton();
    if (enrollmentButton) {
      actions.push(enrollmentButton);
    }
    if (canManage && course) {
      actions.push(
        <Button key="edit" variant="outline" onClick={() => setIsEditModalOpen(true)}>
          Edytuj kurs
        </Button>
      );
      actions.push(
        <Button
          key="delete"
          variant="outline"
          onClick={handleDelete}
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          Usuń kurs
        </Button>
      );
      actions.push(
        <Button
          key="force-delete"
          variant="outline"
          onClick={handleForceDelete}
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          Usuń kurs (z zapisami)
        </Button>
      );
    }
    return actions;
  };

  const getBreadcrumbs = () => [
    { label: 'Home', href: '/dashboard', icon: '🏠' },
    { label: 'Kursy', href: '/courses', icon: '📚' },
    { label: course?.title || `Kurs #${courseId}`, icon: '📖' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedLayout 
        breadcrumbs={getBreadcrumbs()}
        pageTitle="Ładowanie..."
      >
        <div className="container mx-auto px-4 py-8 min-h-full">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-lg text-gray-600 dark:text-gray-300">Ładowanie szczegółów kursu...</div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error && !course) {
    return (
      <ProtectedLayout 
        breadcrumbs={getBreadcrumbs()}
        pageTitle="Błąd"
      >
        <div className="container mx-auto px-4 py-8 min-h-full">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nie można załadować kursu
            </h2>
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/courses')}
            >
              Powrót do listy kursów
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout
      breadcrumbs={getBreadcrumbs()}
      pageTitle={course?.title}
      actions={getPageActions()}
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        {course && (
          <>
            {/* Szczegóły kursu */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    {getStatusBadge(course.status)}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {course.description}
                  </p>

                  {course.enrollmentCount !== undefined && (
                    <div className="mt-6 flex items-center text-gray-500 dark:text-gray-400">
                      <span className="mr-2">👥</span>
                      <span className="font-medium">Liczba uczestników: {course.enrollmentCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Błędy */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Lista uczestników (tylko dla admin/trainer) */}
            {canManage && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">👥 Uczestnicy kursu</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-yellow-600 border-yellow-500 hover:bg-yellow-100 hover:text-yellow-700 dark:text-yellow-400 dark:border-yellow-500 dark:hover:bg-yellow-800/50 dark:hover:text-yellow-300 focus-visible:ring-yellow-500"
                    onClick={handleBulkCancel}
                  >
                    Anuluj wszystkie zapisy
                  </Button>
                </div>
                
                {enrollmentsLoading ? (
                  <div className="text-center py-4">
                    <div className="text-gray-600 dark:text-gray-300">Ładowanie uczestników...</div>
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Brak zapisanych uczestników
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Email użytkownika</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rola</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status zapisu</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Akcja</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">{enrollment.user?.email || 'Nieznany użytkownik'}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{enrollment.user?.role || 'Nieznana rola'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${enrollment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                                {enrollment.status === 'active' ? 'Aktywny' : 'Anulowany'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleCancelParticipant(enrollment.userId)}>
                                Anuluj
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Historia zapisów (tylko dla adminów) */}
            {isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    📋 Historia zapisów
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowHistory(!showHistory);
                      if (!showHistory && enrollmentHistory.length === 0) {
                        fetchEnrollmentHistory();
                      }
                    }}
                  >
                    {showHistory ? 'Ukryj historię' : 'Pokaż historię'}
                  </Button>
                </div>

                {showHistory && (
                  <>
                    {historyLoading ? (
                      <div className="text-center py-4">
                        <div className="text-gray-600 dark:text-gray-300">Ładowanie historii...</div>
                      </div>
                    ) : enrollmentHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Brak historii zapisów
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                Email użytkownika
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                Rola
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                Data zapisu
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                Ostatnia zmiana
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {enrollmentHistory.map((enrollment) => (
                              <tr 
                                key={enrollment.id} 
                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                  {enrollment.user?.email || 'Nieznany użytkownik'}
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                  {enrollment.user?.role || 'Nieznana rola'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    enrollment.status === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {enrollment.status === 'active' ? 'Aktywny' : 'Anulowany'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                                  {formatDate(enrollment.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                                  {formatDate(enrollment.updatedAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal edycji kursu */}
        {isEditModalOpen && course && (
          <CourseModal
            course={course}
            onSuccess={handleEditSuccess}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </ProtectedLayout>
  );
};

export default CourseDetailsPage; 