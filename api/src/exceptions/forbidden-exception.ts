import { BaseHttpException } from './base-exception';
import { UserRole } from '../entities/status-enums';

/**
 * 403 Forbidden exception
 * Used when user lacks permission for the requested operation
 */
export class ForbiddenException extends BaseHttpException {
  public readonly statusCode = 403;
  public readonly errorCode = 'FORBIDDEN';

  constructor(message: string, details?: any) {
    super(message, details);
  }

  /**
   * Create exception for insufficient role
   */
  static insufficientRole(
    requiredRole: UserRole | UserRole[], 
    currentRole: UserRole,
    operation?: string
  ): ForbiddenException {
    const required = Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole;
    const message = operation 
      ? `Insufficient permissions to ${operation}. Required: ${required}, Current: ${currentRole}`
      : `Insufficient permissions. Required: ${required}, Current: ${currentRole}`;
    
    return new ForbiddenException(message, { 
      requiredRole, 
      currentRole, 
      operation 
    });
  }

  /**
   * Create exception for resource ownership
   */
  static notOwner(resource: string, resourceId: number, userId: number): ForbiddenException {
    return new ForbiddenException(
      `User ${userId} is not the owner of ${resource} ${resourceId}`,
      { resource, resourceId, userId }
    );
  }

  /**
   * Create exception for admin-only operations
   */
  static adminOnly(operation: string): ForbiddenException {
    return new ForbiddenException(
      `Operation '${operation}' requires administrator privileges`,
      { operation, requiredRole: UserRole.Admin }
    );
  }

  /**
   * Create exception for trainer-only operations
   */
  static trainerOnly(operation: string): ForbiddenException {
    return new ForbiddenException(
      `Operation '${operation}' requires trainer privileges`,
      { operation, requiredRole: UserRole.Trainer }
    );
  }

  /**
   * Create exception for course management
   */
  static courseManagement(operation: string, courseId: number): ForbiddenException {
    return new ForbiddenException(
      `Insufficient permissions to ${operation} course ${courseId}`,
      { operation, courseId, requiredRole: [UserRole.Admin, UserRole.Trainer] }
    );
  }

  /**
   * Create exception for enrollment restrictions
   */
  static enrollmentRestriction(reason: string, details?: any): ForbiddenException {
    return new ForbiddenException(
      `Enrollment forbidden: ${reason}`,
      { type: 'enrollment', reason, ...details }
    );
  }

  /**
   * Create exception for account actions
   */
  static accountAction(action: string, reason: string): ForbiddenException {
    return new ForbiddenException(
      `Cannot ${action} account: ${reason}`,
      { action, reason }
    );
  }
}
