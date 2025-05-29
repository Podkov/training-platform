import { BaseHttpException } from './base-exception';

/**
 * 409 Conflict exception
 * Used when request conflicts with current state of resource
 */
export class ConflictException extends BaseHttpException {
  public readonly statusCode = 409;
  public readonly errorCode = 'CONFLICT';

  constructor(message: string, details?: any) {
    super(message, details);
  }

  /**
   * Create exception for duplicate enrollment
   */
  static duplicateEnrollment(userId: number, courseId: number): ConflictException {
    return new ConflictException(
      'User is already enrolled in this course',
      { userId, courseId, type: 'duplicate_enrollment' }
    );
  }

  /**
   * Create exception for duplicate email
   */
  static duplicateEmail(email: string): ConflictException {
    return new ConflictException(
      'User with this email already exists',
      { email, type: 'duplicate_email' }
    );
  }

  /**
   * Create exception for course with active enrollments
   */
  static courseHasEnrollments(courseId: number, enrollmentCount: number): ConflictException {
    return new ConflictException(
      `Cannot delete course with ${enrollmentCount} active enrollments`,
      { courseId, enrollmentCount, type: 'course_has_enrollments' }
    );
  }

  /**
   * Create exception for user with active enrollments
   */
  static userHasEnrollments(userId: number, enrollmentCount: number): ConflictException {
    return new ConflictException(
      `Cannot delete user with ${enrollmentCount} active enrollments`,
      { userId, enrollmentCount, type: 'user_has_enrollments' }
    );
  }

  /**
   * Create exception for invalid state transition
   */
  static invalidStateTransition(
    resource: string, 
    currentState: string, 
    targetState: string,
    reason?: string
  ): ConflictException {
    const message = reason 
      ? `Cannot transition ${resource} from ${currentState} to ${targetState}: ${reason}`
      : `Invalid state transition for ${resource} from ${currentState} to ${targetState}`;
    
    return new ConflictException(message, {
      resource,
      currentState,
      targetState,
      reason,
      type: 'invalid_state_transition'
    });
  }

  /**
   * Create exception for resource in use
   */
  static resourceInUse(resource: string, id: number, usedBy: string): ConflictException {
    return new ConflictException(
      `${resource} ${id} is currently in use by ${usedBy}`,
      { resource, id, usedBy, type: 'resource_in_use' }
    );
  }
} 