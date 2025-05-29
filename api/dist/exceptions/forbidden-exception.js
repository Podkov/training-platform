"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = void 0;
const base_exception_1 = require("./base-exception");
const status_enums_1 = require("../entities/status-enums");
/**
 * 403 Forbidden exception
 * Used when user lacks permission for the requested operation
 */
class ForbiddenException extends base_exception_1.BaseHttpException {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 403;
        this.errorCode = 'FORBIDDEN';
    }
    /**
     * Create exception for insufficient role
     */
    static insufficientRole(requiredRole, currentRole, operation) {
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
    static notOwner(resource, resourceId, userId) {
        return new ForbiddenException(`User ${userId} is not the owner of ${resource} ${resourceId}`, { resource, resourceId, userId });
    }
    /**
     * Create exception for admin-only operations
     */
    static adminOnly(operation) {
        return new ForbiddenException(`Operation '${operation}' requires administrator privileges`, { operation, requiredRole: status_enums_1.UserRole.Admin });
    }
    /**
     * Create exception for trainer-only operations
     */
    static trainerOnly(operation) {
        return new ForbiddenException(`Operation '${operation}' requires trainer privileges`, { operation, requiredRole: status_enums_1.UserRole.Trainer });
    }
    /**
     * Create exception for course management
     */
    static courseManagement(operation, courseId) {
        return new ForbiddenException(`Insufficient permissions to ${operation} course ${courseId}`, { operation, courseId, requiredRole: [status_enums_1.UserRole.Admin, status_enums_1.UserRole.Trainer] });
    }
    /**
     * Create exception for enrollment restrictions
     */
    static enrollmentRestriction(reason, details) {
        return new ForbiddenException(`Enrollment forbidden: ${reason}`, { type: 'enrollment', reason, ...details });
    }
    /**
     * Create exception for account actions
     */
    static accountAction(action, reason) {
        return new ForbiddenException(`Cannot ${action} account: ${reason}`, { action, reason });
    }
}
exports.ForbiddenException = ForbiddenException;
