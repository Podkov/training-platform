import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Course, 
  CreateCourseDto, 
  UpdateCourseDto, 
  createCourseSchema, 
  updateCourseSchema,
  courseService,
  CourseStatus
} from '../../services/course.service';
import { Button } from '../common/Button';

interface CourseModalProps {
  course?: Course | null;
  onSuccess: () => void;
  onClose: () => void;
}

type FormData = CreateCourseDto;

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  onSuccess,
  onClose,
}) => {
  const isEditing = !!course;
  const schema = isEditing ? updateCourseSchema : createCourseSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      status: course?.status || CourseStatus.Active,
    },
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        status: course.status,
      });
    }
  }, [course, reset]);

  const onSubmit = handleSubmit(async (data: FormData) => {
    try {
      if (isEditing && course) {
        await courseService.update(course.id, data as UpdateCourseDto);
      } else {
        await courseService.create(data);
      }
      onSuccess();
    } catch (error) {
      // Błąd będzie obsłużony przez interceptor w api.ts
      console.error('Błąd podczas zapisywania kursu:', error);
    }
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Nagłówek */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edytuj kurs' : 'Dodaj nowy kurs'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formularz */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Tytuł */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tytuł kursu *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Wprowadź tytuł kursu"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Opis */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opis kursu *
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Wprowadź opis kursu"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status kursu
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value={CourseStatus.Active}>Aktywny</option>
                <option value={CourseStatus.Finished}>Zakończony</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
            </div>

            {/* Przyciski */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                fullWidth
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                fullWidth
              >
                {isSubmitting 
                  ? (isEditing ? 'Zapisywanie...' : 'Tworzenie...') 
                  : (isEditing ? 'Zapisz zmiany' : 'Utwórz kurs')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 