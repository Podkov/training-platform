"use strict";
/**
 * Status enums for the training platform domain
 * These enums provide type safety and centralized status definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserRole = exports.isEnrollmentStatus = exports.isCourseStatus = exports.UserRole = exports.EnrollmentStatus = exports.CourseStatus = void 0;
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["Active"] = "active";
    CourseStatus["Finished"] = "finished";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["Active"] = "active";
    EnrollmentStatus["Cancelled"] = "cancelled";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "ADMIN";
    UserRole["Trainer"] = "TRAINER";
    UserRole["Participant"] = "PARTICIPANT";
})(UserRole || (exports.UserRole = UserRole = {}));
// Type guards for runtime validation
const isCourseStatus = (value) => {
    return Object.values(CourseStatus).includes(value);
};
exports.isCourseStatus = isCourseStatus;
const isEnrollmentStatus = (value) => {
    return Object.values(EnrollmentStatus).includes(value);
};
exports.isEnrollmentStatus = isEnrollmentStatus;
const isUserRole = (value) => {
    return Object.values(UserRole).includes(value);
};
exports.isUserRole = isUserRole;
