import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Course, courseService, Enrollment } from '../../services/course.service';
import { Button } from '../common/Button';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: number) => void;
  onEnrollmentChange?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  onEnrollmentChange,
}) => {
  const { user } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCourses, setUserCourses] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const isParticipant = user?.role === 'PARTICIPANT';
  const canManage = user?.role === 'ADMIN' || user?.role === 'TRAINER';
  const isActive = course.status === 'active';

  // Załaduj zapisane kursy użytkownika
  useEffect(() => {
    if (isParticipant) {
      loadUserEnrollments();
    }
  }, [isParticipant]);

  const loadUserEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const data = await courseService.getMyCourses();
      setUserCourses([...data.activeCourses, ...data.finishedCourses]);
    } catch (err) {
      console.error('Błąd podczas ładowania zapisów:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Sprawdź czy użytkownik jest zapisany na kurs
  const isEnrolled = userCourses.some(
    enrollment => enrollment.courseId === course.id && enrollment.status === 'active'
  );

  const handleEnroll = async () => {
    if (!isParticipant || !isActive) return;

    try {
      setIsEnrolling(true);
      setError(null);
      await courseService.enroll(course.id);
      await loadUserEnrollments(); // Odśwież zapisy
      onEnrollmentChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania na kurs');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!isParticipant) return;

    try {
      setIsUnenrolling(true);
      setError(null);
      await courseService.unenroll(course.id);
      await loadUserEnrollments(); // Odśwież zapisy
      onEnrollmentChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas wypisywania z kursu');
    } finally {
      setIsUnenrolling(false);
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (course.status === 'active') {
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
    if (!isParticipant) return null;

    if (loadingEnrollments) {
      return (
        <Button variant="outline" size="sm" disabled>
          Sprawdzanie...
        </Button>
      );
    }

    if (isEnrolled) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnenroll}
          isLoading={isUnenrolling}
          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          {isUnenrolling ? 'Wypisywanie...' : 'Wypisz się'}
        </Button>
      );
    }

    if (!isActive) {
      return (
        <Button variant="outline" size="sm" disabled>
          Kurs zakończony
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleEnroll}
        isLoading={isEnrolling}
      >
        {isEnrolling ? 'Zapisywanie...' : 'Zapisz się'}
      </Button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Nagłówek z statusem */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Opis */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Statystyki */}
        {course.enrollmentCount !== undefined && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Uczestników: {course.enrollmentCount}
          </div>
        )}

        {/* Błędy */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Akcje */}
        <div className="flex flex-wrap gap-2">
          {/* Link do szczegółów */}
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 min-w-fit"
          >
            <Button variant="outline" size="sm" fullWidth>
              Zobacz szczegóły
            </Button>
          </Link>

          {/* Przycisk zapisywania/wypisywania */}
          {getEnrollmentButton()}

          {/* Przyciski zarządzania dla adminów/trenerów */}
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(course)}
              >
                Edytuj
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(course.id)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                Usuń
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 