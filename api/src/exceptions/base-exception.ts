/**
 * Base HTTP exception class
 * All custom exceptions should extend this class
 */
export abstract class BaseHttpException extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert exception to JSON response format
   */
  toJSON() {
    return {
      error: this.errorCode,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details })
    };
  }
} 