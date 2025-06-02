import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService, Course, CourseStatus, CourseListResponseDto, CourseQuery } from '../../services/course.service';
import { Button } from '../../components/common/Button';
import { CourseCard } from '../../components/courses/CourseCard';
import { CourseModal } from '../../components/courses/CourseModal';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';

const ITEMS_PER_PAGE = 9; // 3 kolumny * 3 rzędy

export const CourseListPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CourseStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Usunięto: myEnrolledCourseIds, loadingMyCoursesInfo
  const [filterMyCoursesActive, setFilterMyCoursesActive] = useState(false);
  // Dodano loadingMyCoursesInfo z powrotem, ponieważ przycisk "Moje kursy" będzie wyłączony podczas ładowania
  const [loadingMyCoursesInfo, setLoadingMyCoursesInfo] = useState(false);

  const canManageCourses = user?.role === 'ADMIN' || user?.role === 'TRAINER';
  const isParticipant = user?.role === 'PARTICIPANT';

  const fetchCourses = async (pageToFetch: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      if (filterMyCoursesActive) { // Jeśli filtr "Moje kursy" jest aktywny, ustawiamy loadingMyCoursesInfo
        setLoadingMyCoursesInfo(true);
      }
      const query: CourseQuery = { // Użycie CourseQuery
        status: filter !== 'all' ? filter : undefined,
        page: pageToFetch,
        limit: ITEMS_PER_PAGE,
        myCourses: isParticipant && filterMyCoursesActive ? true : undefined, // Przekazanie informacji o filtrze "Moich kursów"
      };
      const response: CourseListResponseDto = await courseService.getAll(query);
      setCourses(response.courses);
      setTotalCourses(response.total);
      setCurrentPage(pageToFetch); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania kursów');
    } finally {
      setLoading(false);
      if (filterMyCoursesActive) { // Resetujemy loadingMyCoursesInfo
        setLoadingMyCoursesInfo(false);
      }
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCourses(1);
    }
  }, [filter, filterMyCoursesActive]); // Dodano filterMyCoursesActive do zależności

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (location.state?.preselectFilters) {
      const { myCourses, status } = location.state.preselectFilters;
      if (myCourses && isParticipant) {
        setFilterMyCoursesActive(true);
      }
      if (status) {
        setFilter(status);
      }
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, isParticipant]);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kurs?')) return;

    try {
      await courseService.delete(courseId);
      if (courses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1); // to wywoła useEffect[currentPage]
      } else {
        fetchCourses(currentPage); // Odśwież listę na bieżącej stronie
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania kursu');
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    if (currentPage !== 1) {
        setCurrentPage(1);
    } else {
        fetchCourses(1);
    }
  };

  const handleEnrollmentChange = () => {
    fetchCourses(currentPage);
  };
  
  const getPageActions = () => {
    if (!canManageCourses) return null;
    
    return (
      <Button onClick={handleCreateCourse}>
        <span className="mr-2">➕</span>
        Dodaj nowy kurs
      </Button>
    );
  };

  if (loading && !loadingMyCoursesInfo) {
    return (
      <ProtectedLayout pageTitle="Kursy">
        <div className="container mx-auto px-4 py-8 min-h-full">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-lg text-gray-600 dark:text-gray-300">Ładowanie kursów...</div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout 
      pageTitle="Kursy" 
      actions={getPageActions()}
    >
      <div className="container mx-auto px-4 py-8 min-h-full">
        {/* Filtry */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              disabled={loadingMyCoursesInfo} // Wyłączony podczas ładowania gdy filtr "Moje kursy" jest aktywny
            >
              Wszystkie
            </Button>
            <Button
              variant={filter === CourseStatus.Active ? 'primary' : 'outline'}
              onClick={() => setFilter(CourseStatus.Active)}
              size="sm"
              disabled={loadingMyCoursesInfo}
            >
              Aktywne
            </Button>
            <Button
              variant={filter === CourseStatus.Finished ? 'primary' : 'outline'}
              onClick={() => setFilter(CourseStatus.Finished)}
              size="sm"
              disabled={loadingMyCoursesInfo}
            >
              Zakończone
            </Button>

            {isParticipant && (
              <Button
                variant={filterMyCoursesActive ? 'primary' : 'outline'}
                onClick={() => setFilterMyCoursesActive(!filterMyCoursesActive)}
                size="sm"
                disabled={loading} // Wyłączony podczas ogólnego ładowania kursów
              >
                {loadingMyCoursesInfo ? 'Ładowanie...' : 'Moje kursy'}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Lista kursów */}
        {(() => {
          // Usunięto filtrowanie po stronie klienta (displayedCourses)
          if (!loading && courses.length === 0) { // Sprawdzamy `!loading`, aby uniknąć wyświetlenia przed załadowaniem
            let noCoursesMessage = 'Brak dostępnych kursów spełniających kryteria.';
            if (isParticipant && filterMyCoursesActive) {
               if (filter === 'all') {
                noCoursesMessage = 'Nie jesteś zapisany/a na żaden kurs.';
              } else {
                noCoursesMessage = `Nie jesteś zapisany/a na żadne ${filter === CourseStatus.Active ? 'aktywne' : 'zakończone'} kursy.`;
              }
            } else if (filter !== 'all') {
                 noCoursesMessage = `Brak kursów ${filter === CourseStatus.Active ? 'aktywnych' : 'zakończonych'}.`;
            }


            return (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {noCoursesMessage}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {canManageCourses && filter === 'all' && !filterMyCoursesActive
                    ? 'Rozpocznij tworzenie pierwszego kursu aby zobaczyć go tutaj.'
                    : 'Spróbuj zmienić filtry lub sprawdź ponownie później.'
                  }
                </p>
                {canManageCourses && filter === 'all' && !filterMyCoursesActive && (
                  <Button onClick={handleCreateCourse}>
                    <span className="mr-2">➕</span>
                    Utwórz pierwszy kurs
                  </Button>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={canManageCourses ? handleEditCourse : undefined}
                  onDelete={canManageCourses ? handleDeleteCourse : undefined}
                  onEnrollmentChange={handleEnrollmentChange}
                />
              ))}
            </div>
          );
        })()}

        {/* Paginacja */}
        {totalCourses > ITEMS_PER_PAGE && !loading && ( // Ukryj paginację podczas ładowania
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(totalCourses / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage} 
            />
          </div>
        )}

        {isModalOpen && (
          <CourseModal
            course={editingCourse}
            onSuccess={handleModalSuccess}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </ProtectedLayout>
  );
};

export default CourseListPage; 