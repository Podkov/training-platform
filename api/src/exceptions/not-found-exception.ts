import { BaseHttpException } from './base-exception';

/**
 * 404 Not Found exception
 * Used when requested resource doesn't exist
 */
export class NotFoundException extends BaseHttpException {
  public readonly statusCode = 404;
  public readonly errorCode = 'NOT_FOUND';

  constructor(resource: string, identifier?: string | number) {
    const message = identifier 
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;
    
    super(message, { resource, identifier });
  }

  /**
   * Create exception for course not found
   */
  static course(id: number): NotFoundException {
    return new NotFoundException('Course', id);
  }

  /**
   * Create exception for user not found
   */
  static user(id: number): NotFoundException {
    return new NotFoundException('User', id);
  }

  /**
   * Create exception for enrollment not found
   */
  static enrollment(id?: number): NotFoundException {
    return new NotFoundException('Enrollment', id);
  }

  /**
   * Create exception for generic resource
   */
  static resource(name: string, id?: string | number): NotFoundException {
    return new NotFoundException(name, id);
  }
}
