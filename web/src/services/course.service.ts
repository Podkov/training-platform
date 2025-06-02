import { z } from 'zod';
import { api } from './api';

// Importy enumów zgodnych z backend
export enum CourseStatus {
  Active = 'active',
  Finished = 'finished'
}

export enum EnrollmentStatus {
  Active = 'active',
  Cancelled = 'cancelled'
}

export enum UserRole {
  Admin = 'ADMIN',
  Trainer = 'TRAINER',
  Participant = 'PARTICIPANT'
}

// Typy zgodne z backend DTO
export interface Course {
  id: number;
  title: string;
  description: string;
  status: CourseStatus;
  enrollmentCount?: number; // Zgodne z CourseResponseDto z backend
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
  course?: Course;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  status?: CourseStatus;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  status?: CourseStatus;
}

export interface CourseQuery {
  status?: CourseStatus;
  page?: number;
  limit?: number;
}

export interface UserCoursesResponse {
  activeCourses: Enrollment[];
  finishedCourses: Enrollment[];
}

export interface BulkEnrollmentResponse {
  cancelled: number;
  message: string;
  affectedUsers?: number[];
}

// Schematy walidacji
export const createCourseSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć minimum 3 znaki'),
  description: z.string().min(10, 'Opis musi mieć minimum 10 znaków'),
  status: z.nativeEnum(CourseStatus).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Serwis kursów - wykorzystuje istniejący api.ts
export const courseService = {
  // CRUD dla kursów
  async getAll(query?: CourseQuery): Promise<Course[]> {
    const response = await api.get('/courses', { params: query });
    return response.data;
  },

  async getById(id: number): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  async create(data: CreateCourseDto): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data;
  },

  async update(id: number, data: UpdateCourseDto): Promise<Course> {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  async delete(id: number, force?: boolean): Promise<void> {
    const params = force ? { force: 'true' } : {};
    await api.delete(`/courses/${id}`, { params });
  },

  // Zapisy na kursy - wykorzystuje endpointy /enrollments/
  async enroll(courseId: number): Promise<Enrollment> {
    const response = await api.post(`/enrollments/courses/${courseId}/enroll`);
    return response.data;
  },

  async unenroll(courseId: number): Promise<void> {
    await api.delete(`/enrollments/courses/${courseId}/enroll`);
  },

  async getMyCourses(): Promise<UserCoursesResponse> {
    const response = await api.get('/enrollments/users/me/courses');
    return response.data;
  },

  // Dodatkowe metody dostępne w API
  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    const response = await api.get(`/enrollments/courses/${courseId}`);
    return response.data;
  },

  async getCourseEnrollmentHistory(courseId: number): Promise<Enrollment[]> {
    const response = await api.get(`/enrollments/courses/${courseId}/history`);
    return response.data;
  },

  async getAllEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments');
    return response.data;
  },

  async getUserEnrollments(userId: number): Promise<UserCoursesResponse> {
    const response = await api.get(`/enrollments/users/${userId}/courses`);
    return response.data;
  },

  async cancelEnrollmentByAdmin(courseId: number, userId: number): Promise<Enrollment> {
    const response = await api.delete(`/enrollments/courses/${courseId}/users/${userId}/enroll`);
    return response.data;
  },

  async cancelAllEnrollments(courseId: number): Promise<BulkEnrollmentResponse> {
    const response = await api.delete(`/enrollments/courses/${courseId}/cancel-all`);
    return response.data;
  },

  async cancelAllEnrollmentsForUser(userId: number): Promise<UserCoursesResponse> {
    const response = await api.get(`/enrollments/users/${userId}/courses`);
    return response.data;
  }
};

// Hook do obsługi błędów (wykorzystuje już skonfigurowane interceptory w api.ts)
export const useCourseError = () => {
  const handleError = (error: any) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    return 'Wystąpił nieoczekiwany błąd';
  };

  return { handleError };
}; 