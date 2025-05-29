import { UserRole, CourseStatus, EnrollmentStatus } from '../entities/status-enums';

/**
 * DTO for admin dashboard statistics
 * Used in GET /admin/stats endpoint
 */
export interface AdminStatsDto {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  usersByRole: {
    [key in UserRole]: number;
  };
  coursesByStatus: {
    [key in CourseStatus]: number;
  };
  enrollmentsByStatus: {
    [key in EnrollmentStatus]: number;
  };
}

/**
 * DTO for admin user management
 * Used in GET /admin/users endpoint
 */
export interface AdminUserListDto {
  users: Array<{
    id: number;
    email: string;
    role: UserRole;
    enrollmentCount: number;
    createdAt?: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

/**
 * DTO for admin course management
 * Used in GET /admin/courses endpoint
 */
export interface AdminCourseListDto {
  courses: Array<{
    id: number;
    title: string;
    description: string;
    status: CourseStatus;
    enrollmentCount: number;
    activeEnrollments: number;
    createdAt?: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

/**
 * DTO for admin role change
 * Used in PUT /admin/users/:id/role endpoint
 */
export interface ChangeUserRoleDto {
  userId: number;
  newRole: UserRole;
  reason?: string; // Optional reason for audit log
} 