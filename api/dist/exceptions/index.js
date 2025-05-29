"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.BaseHttpException = void 0;
exports.isHttpException = isHttpException;
exports.getHttpStatusCode = getHttpStatusCode;
exports.formatErrorResponse = formatErrorResponse;
// Base exception
var base_exception_1 = require("./base-exception");
Object.defineProperty(exports, "BaseHttpException", { enumerable: true, get: function () { return base_exception_1.BaseHttpException; } });
const base_exception_2 = require("./base-exception");
// HTTP exceptions
var bad_request_exception_1 = require("./bad-request-exception");
Object.defineProperty(exports, "BadRequestException", { enumerable: true, get: function () { return bad_request_exception_1.BadRequestException; } });
var unauthorized_exception_1 = require("./unauthorized-exception");
Object.defineProperty(exports, "UnauthorizedException", { enumerable: true, get: function () { return unauthorized_exception_1.UnauthorizedException; } });
var forbidden_exception_1 = require("./forbidden-exception");
Object.defineProperty(exports, "ForbiddenException", { enumerable: true, get: function () { return forbidden_exception_1.ForbiddenException; } });
var not_found_exception_1 = require("./not-found-exception");
Object.defineProperty(exports, "NotFoundException", { enumerable: true, get: function () { return not_found_exception_1.NotFoundException; } });
var conflict_exception_1 = require("./conflict-exception");
Object.defineProperty(exports, "ConflictException", { enumerable: true, get: function () { return conflict_exception_1.ConflictException; } });
// Type guard to check if error is HTTP exception
function isHttpException(error) {
    return error instanceof base_exception_2.BaseHttpException;
}
// Helper to get HTTP status code from any error
function getHttpStatusCode(error) {
    if (isHttpException(error)) {
        return error.statusCode;
    }
    return 500; // Internal Server Error for unknown errors
}
// Helper to format error response
function formatErrorResponse(error) {
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
