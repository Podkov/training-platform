/**
 * Status enums for the training platform domain
 * These enums provide type safety and centralized status definitions
 */

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

// Type guards for runtime validation
export const isCourseStatus = (value: string): value is CourseStatus => {
  return Object.values(CourseStatus).includes(value as CourseStatus);
};

export const isEnrollmentStatus = (value: string): value is EnrollmentStatus => {
  return Object.values(EnrollmentStatus).includes(value as EnrollmentStatus);
};

export const isUserRole = (value: string): value is UserRole => {
  return Object.values(UserRole).includes(value as UserRole);
}; 