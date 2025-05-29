// Base exception
export { BaseHttpException } from './base-exception';
import { BaseHttpException } from './base-exception';

// HTTP exceptions
export { BadRequestException } from './bad-request-exception';
export { UnauthorizedException } from './unauthorized-exception';
export { ForbiddenException } from './forbidden-exception';
export { NotFoundException } from './not-found-exception';
export { ConflictException } from './conflict-exception';

// Type guard to check if error is HTTP exception
export function isHttpException(error: any): error is BaseHttpException {
  return error instanceof BaseHttpException;
}

// Helper to get HTTP status code from any error
export function getHttpStatusCode(error: any): number {
  if (isHttpException(error)) {
    return error.statusCode;
  }
  return 500; // Internal Server Error for unknown errors
}

// Helper to format error response
export function formatErrorResponse(error: any) {
  if (isHttpException(error)) {
    return error.toJSON();
  }
  
  // For non-HTTP exceptions, return generic 500 error
  return {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500
  };
} 