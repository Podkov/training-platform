import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService, Course, CourseStatus } from '../../services/course.service';
import { Button } from '../../components/common/Button';
import { CourseCard } from '../../components/courses/CourseCard';
import { CourseModal } from '../../components/courses/CourseModal';
import { ProtectedLayout } from '../../components/layout/ProtectedLayout';

export const CourseListPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CourseStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const canManageCourses = user?.role === 'ADMIN' || user?.role === 'TRAINER';

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = filter !== 'all' ? { status: filter } : undefined;
      const data = await courseService.getAll(query);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania kursów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filter]);

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
      await fetchCourses(); // Odśwież listę
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania kursu');
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    fetchCourses(); // Odśwież listę po dodaniu/edycji
  };

  const handleEnrollmentChange = () => {
    fetchCourses(); // Odśwież listę po zapisie/wypisie
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

  if (loading) {
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
            >
              Wszystkie
            </Button>
            <Button
              variant={filter === CourseStatus.Active ? 'primary' : 'outline'}
              onClick={() => setFilter(CourseStatus.Active)}
              size="sm"
            >
              Aktywne
            </Button>
            <Button
              variant={filter === CourseStatus.Finished ? 'primary' : 'outline'}
              onClick={() => setFilter(CourseStatus.Finished)}
              size="sm"
            >
              Zakończone
            </Button>
          </div>
        </div>

        {/* Błędy */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Lista kursów */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' 
                ? 'Brak dostępnych kursów' 
                : `Brak kursów: ${filter === CourseStatus.Active ? 'aktywnych' : 'zakończonych'}`
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {canManageCourses && filter === 'all' 
                ? 'Rozpocznij tworzenie pierwszego kursu aby zobaczyć go tutaj.'
                : 'Spróbuj zmienić filtr lub sprawdź ponownie później.'
              }
            </p>
            {canManageCourses && filter === 'all' && (
              <Button onClick={handleCreateCourse}>
                <span className="mr-2">➕</span>
                Utwórz pierwszy kurs
              </Button>
            )}
          </div>
        ) : (
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
        )}

        {/* Modal tworzenia/edycji kursu */}
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