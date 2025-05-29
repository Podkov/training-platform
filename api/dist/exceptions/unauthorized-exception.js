"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = void 0;
const base_exception_1 = require("./base-exception");
/**
 * 401 Unauthorized exception
 * Used when authentication is required or invalid
 */
class UnauthorizedException extends base_exception_1.BaseHttpException {
    constructor(message = 'Authentication required', details) {
        super(message, details);
        this.statusCode = 401;
        this.errorCode = 'UNAUTHORIZED';
    }
    /**
     * Create exception for missing token
     */
    static missingToken() {
        return new UnauthorizedException('Authentication token is required', { reason: 'missing_token' });
    }
    /**
     * Create exception for invalid token
     */
    static invalidToken(reason) {
        return new UnauthorizedException('Invalid authentication token', { reason: reason || 'invalid_token' });
    }
    /**
     * Create exception for expired token
     */
    static expiredToken() {
        return new UnauthorizedException('Authentication token has expired', { reason: 'expired_token' });
    }
    /**
     * Create exception for invalid credentials
     */
    static invalidCredentials() {
        return new UnauthorizedException('Invalid email or password', { reason: 'invalid_credentials' });
    }
    /**
     * Create exception for account issues
     */
    static accountIssue(reason) {
        return new UnauthorizedException(`Account authentication failed: ${reason}`, { reason: 'account_issue', details: reason });
    }
}
exports.UnauthorizedException = UnauthorizedException;
