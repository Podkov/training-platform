import { CourseStatus } from '../entities/status-enums';

/**
 * DTO for creating a new course
 * Used in POST /courses endpoint
 */
export interface CreateCourseDto {
  title: string;
  description: string;
  status?: CourseStatus; // Optional, defaults to Active
}

/**
 * DTO for updating an existing course
 * Used in PUT /courses/:id endpoint
 * All fields are optional for partial updates
 */
export interface UpdateCourseDto {
  title?: string;
  description?: string;
  status?: CourseStatus;
}

/**
 * DTO for deleting a course
 * Used in DELETE /courses/:id endpoint
 * Only ADMIN role can delete courses
 */
export interface DeleteCourseDto {
  id: number;
  force?: boolean; // Optional - force delete even with active enrollments
}

/**
 * DTO for course response from API
 * Used in GET endpoints responses
 */
export interface CourseResponseDto {
  id: number;
  title: string;
  description: string;
  status: CourseStatus;
  enrollmentCount?: number; // Optional - number of active enrollments
}

/**
 * DTO for course list query parameters
 * Used in GET /courses endpoint
 */
export interface CourseQueryDto {
  status?: CourseStatus;
  page?: number;
  limit?: number;
  enrolledForUserId?: number;
}

/**
 * DTO for course deletion response
 * Used in DELETE /courses/:id response
 */
export interface DeleteCourseResponseDto {
  id: number;
  message: string;
  enrollmentsCancelled?: number; // Number of enrollments that were cancelled
}
