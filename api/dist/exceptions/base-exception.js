"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHttpException = void 0;
/**
 * Base HTTP exception class
 * All custom exceptions should extend this class
 */
class BaseHttpException extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
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
exports.BaseHttpException = BaseHttpException;
