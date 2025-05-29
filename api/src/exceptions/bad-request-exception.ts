import { BaseHttpException } from './base-exception';

/**
 * 400 Bad Request exception
 * Used for validation errors and invalid input
 */
export class BadRequestException extends BaseHttpException {
  public readonly statusCode = 400;
  public readonly errorCode = 'BAD_REQUEST';

  constructor(message: string, details?: any) {
    super(message, details);
  }

  /**
   * Create exception for validation errors
   */
  static validation(field: string, value?: any, constraint?: string): BadRequestException {
    const message = constraint 
      ? `Validation failed for field '${field}': ${constraint}`
      : `Invalid value for field '${field}'`;
    
    return new BadRequestException(message, { field, value, constraint });
  }

  /**
   * Create exception for duplicate resource
   */
  static duplicate(resource: string, field: string, value: any): BadRequestException {
    return new BadRequestException(
      `${resource} with ${field} '${value}' already exists`,
      { resource, field, value }
    );
  }

  /**
   * Create exception for business rule violation
   */
  static businessRule(rule: string, details?: any): BadRequestException {
    return new BadRequestException(
      `Business rule violation: ${rule}`,
      { rule, ...details }
    );
  }

  /**
   * Create exception for enrollment errors
   */
  static enrollment(reason: string, details?: any): BadRequestException {
    return new BadRequestException(
      `Enrollment error: ${reason}`,
      { type: 'enrollment', ...details }
    );
  }

  /**
   * Create exception for course operation errors
   */
  static courseOperation(operation: string, reason: string, details?: any): BadRequestException {
    return new BadRequestException(
      `Cannot ${operation} course: ${reason}`,
      { operation, reason, ...details }
    );
  }

  /**
   * Create exception for invalid status transition
   */
  static invalidStatusTransition(from: string, to: string, resource: string): BadRequestException {
    return new BadRequestException(
      `Invalid status transition from '${from}' to '${to}' for ${resource}`,
      { from, to, resource }
    );
  }
} 