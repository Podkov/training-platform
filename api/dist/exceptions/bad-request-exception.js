"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = void 0;
const base_exception_1 = require("./base-exception");
/**
 * 400 Bad Request exception
 * Used for validation errors and invalid input
 */
class BadRequestException extends base_exception_1.BaseHttpException {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 400;
        this.errorCode = 'BAD_REQUEST';
    }
    /**
     * Create exception for validation errors
     */
    static validation(field, value, constraint) {
        const message = constraint
            ? `Validation failed for field '${field}': ${constraint}`
            : `Invalid value for field '${field}'`;
        return new BadRequestException(message, { field, value, constraint });
    }
    /**
     * Create exception for duplicate resource
     */
    static duplicate(resource, field, value) {
        return new BadRequestException(`${resource} with ${field} '${value}' already exists`, { resource, field, value });
    }
    /**
     * Create exception for business rule violation
     */
    static businessRule(rule, details) {
        return new BadRequestException(`Business rule violation: ${rule}`, { rule, ...details });
    }
    /**
     * Create exception for enrollment errors
     */
    static enrollment(reason, details) {
        return new BadRequestException(`Enrollment error: ${reason}`, { type: 'enrollment', ...details });
    }
    /**
     * Create exception for course operation errors
     */
    static courseOperation(operation, reason, details) {
        return new BadRequestException(`Cannot ${operation} course: ${reason}`, { operation, reason, ...details });
    }
    /**
     * Create exception for invalid status transition
     */
    static invalidStatusTransition(from, to, resource) {
        return new BadRequestException(`Invalid status transition from '${from}' to '${to}' for ${resource}`, { from, to, resource });
    }
}
exports.BadRequestException = BadRequestException;
