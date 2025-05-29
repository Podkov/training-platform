import { UserRole } from '../entities/status-enums';

/**
 * DTO for user response from API
 * Used in authentication and user info endpoints
 */
export interface UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * DTO for updating user profile
 * Used in PUT /users/:id endpoint
 */
export interface UpdateUserDto {
  email?: string;
  role?: UserRole;
}

/**
 * DTO for user registration (extends auth service)
 * Used in POST /auth/register endpoint
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * DTO for user login
 * Used in POST /auth/login endpoint
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * DTO for deleting user profile
 * Used in DELETE /users/me endpoint (self-deletion)
 * and DELETE /users/:id endpoint (admin deletion)
 */
export interface DeleteUserDto {
  id: number;
  password?: string; // Required for self-deletion, optional for admin
  force?: boolean; // Optional - force delete even with active enrollments
}

/**
 * DTO for user deletion response
 * Used in DELETE /users/:id and /users/me response
 */
export interface DeleteUserResponseDto {
  id: number;
  email: string;
  message: string;
  enrollmentsCancelled?: number; // Number of enrollments that were cancelled
}

/**
 * DTO for password change
 * Used in PUT /users/me/password endpoint
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
} 