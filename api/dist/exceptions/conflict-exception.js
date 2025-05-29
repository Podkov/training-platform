"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = void 0;
const base_exception_1 = require("./base-exception");
/**
 * 409 Conflict exception
 * Used when request conflicts with current state of resource
 */
class ConflictException extends base_exception_1.BaseHttpException {
    constructor(message, details) {
        super(message, details);
        this.statusCode = 409;
        this.errorCode = 'CONFLICT';
    }
    /**
     * Create exception for duplicate enrollment
     */
    static duplicateEnrollment(userId, courseId) {
        return new ConflictException('User is already enrolled in this course', { userId, courseId, type: 'duplicate_enrollment' });
    }
    /**
     * Create exception for duplicate email
     */
    static duplicateEmail(email) {
        return new ConflictException('User with this email already exists', { email, type: 'duplicate_email' });
    }
    /**
     * Create exception for course with active enrollments
     */
    static courseHasEnrollments(courseId, enrollmentCount) {
        return new ConflictException(`Cannot delete course with ${enrollmentCount} active enrollments`, { courseId, enrollmentCount, type: 'course_has_enrollments' });
    }
    /**
     * Create exception for user with active enrollments
     */
    static userHasEnrollments(userId, enrollmentCount) {
        return new ConflictException(`Cannot delete user with ${enrollmentCount} active enrollments`, { userId, enrollmentCount, type: 'user_has_enrollments' });
    }
    /**
     * Create exception for invalid state transition
     */
    static invalidStateTransition(resource, currentState, targetState, reason) {
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
    static resourceInUse(resource, id, usedBy) {
        return new ConflictException(`${resource} ${id} is currently in use by ${usedBy}`, { resource, id, usedBy, type: 'resource_in_use' });
    }
}
exports.ConflictException = ConflictException;
