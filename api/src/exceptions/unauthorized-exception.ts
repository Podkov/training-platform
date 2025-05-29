import { BaseHttpException } from './base-exception';

/**
 * 401 Unauthorized exception
 * Used when authentication is required or invalid
 */
export class UnauthorizedException extends BaseHttpException {
  public readonly statusCode = 401;
  public readonly errorCode = 'UNAUTHORIZED';

  constructor(message: string = 'Authentication required', details?: any) {
    super(message, details);
  }

  /**
   * Create exception for missing token
   */
  static missingToken(): UnauthorizedException {
    return new UnauthorizedException(
      'Authentication token is required',
      { reason: 'missing_token' }
    );
  }

  /**
   * Create exception for invalid token
   */
  static invalidToken(reason?: string): UnauthorizedException {
    return new UnauthorizedException(
      'Invalid authentication token',
      { reason: reason || 'invalid_token' }
    );
  }

  /**
   * Create exception for expired token
   */
  static expiredToken(): UnauthorizedException {
    return new UnauthorizedException(
      'Authentication token has expired',
      { reason: 'expired_token' }
    );
  }

  /**
   * Create exception for invalid credentials
   */
  static invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException(
      'Invalid email or password',
      { reason: 'invalid_credentials' }
    );
  }

  /**
   * Create exception for account issues
   */
  static accountIssue(reason: string): UnauthorizedException {
    return new UnauthorizedException(
      `Account authentication failed: ${reason}`,
      { reason: 'account_issue', details: reason }
    );
  }
} 