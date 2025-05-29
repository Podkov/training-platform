"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const base_exception_1 = require("./base-exception");
/**
 * 404 Not Found exception
 * Used when requested resource doesn't exist
 */
class NotFoundException extends base_exception_1.BaseHttpException {
    constructor(resource, identifier) {
        const message = identifier
            ? `${resource} with ID ${identifier} not found`
            : `${resource} not found`;
        super(message, { resource, identifier });
        this.statusCode = 404;
        this.errorCode = 'NOT_FOUND';
    }
    /**
     * Create exception for course not found
     */
    static course(id) {
        return new NotFoundException('Course', id);
    }
    /**
     * Create exception for user not found
     */
    static user(id) {
        return new NotFoundException('User', id);
    }
    /**
     * Create exception for enrollment not found
     */
    static enrollment(id) {
        return new NotFoundException('Enrollment', id);
    }
    /**
     * Create exception for generic resource
     */
    static resource(name, id) {
        return new NotFoundException(name, id);
    }
}
exports.NotFoundException = NotFoundException;
