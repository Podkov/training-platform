import { EnrollmentStatus } from '../entities/status-enums';

/**
 * DTO for enrolling in a course
 * Used in POST /courses/:id/enroll endpoint
 */
export interface EnrollDto {
  courseId: number;
}

/**
 * DTO for cancelling enrollment
 * Used in DELETE /courses/:id/enroll endpoint
 */
export interface CancelEnrollmentDto {
  courseId: number;
}

/**
 * DTO for bulk cancelling enrollments
 * Used when deleting courses or users
 */
export interface BulkCancelEnrollmentDto {
  userId?: number; // Cancel all enrollments for this user
  courseId?: number; // Cancel all enrollments for this course
  reason: string; // Reason for cancellation (e.g., "Course deleted", "User deleted")
}

/**
 * DTO for enrollment response from API
 * Used in GET endpoints responses
 */
export interface EnrollmentResponseDto {
  id: number;
  userId: number;
  courseId: number;
  status: EnrollmentStatus;
  course?: {
    id: number;
    title: string;
    description: string;
    status: string;
  };
}

/**
 * DTO for user's courses response
 * Used in GET /enrollments/me endpoint
 */
export interface UserCoursesResponseDto {
  activeCourses: EnrollmentResponseDto[];
  finishedCourses: EnrollmentResponseDto[];
}

/**
 * DTO for enrollment query parameters
 * Used in GET /enrollments endpoint
 */
export interface EnrollmentQueryDto {
  userId?: number;
  courseId?: number;
  status?: EnrollmentStatus;
}

/**
 * DTO for bulk operation response
 * Used in bulk cancellation responses
 */
export interface BulkEnrollmentResponseDto {
  cancelled: number; // Number of enrollments cancelled
  message: string;
  affectedUsers?: number[]; // IDs of users affected
}
