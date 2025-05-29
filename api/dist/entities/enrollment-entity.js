"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentEntity = void 0;
const status_enums_1 = require("./status-enums");
/**
 * Enrollment domain entity with business logic
 * Encapsulates enrollment-related business rules and validation
 */
class EnrollmentEntity {
    constructor(id, userId, courseId, status, course) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.status = status;
        this.course = course;
        this.validateUserId(userId);
        this.validateCourseId(courseId);
    }
    /**
     * Create new enrollment entity from data
     */
    static create(data) {
        return new EnrollmentEntity(data.id, data.userId, data.courseId, data.status, data.course);
    }
    /**
     * Check if enrollment is active
     */
    isActive() {
        return this.status === status_enums_1.EnrollmentStatus.Active;
    }
    /**
     * Check if enrollment is cancelled
     */
    isCancelled() {
        return this.status === status_enums_1.EnrollmentStatus.Cancelled;
    }
    /**
     * Check if enrollment can be cancelled
     */
    canBeCancelled() {
        return this.status === status_enums_1.EnrollmentStatus.Active;
    }
    /**
     * Check if course is still active (if course data is available)
     */
    isCourseActive() {
        return this.course?.status === status_enums_1.CourseStatus.Active;
    }
    /**
     * Check if this is an active enrollment in an active course
     */
    isActiveInActiveCourse() {
        return this.isActive() && this.isCourseActive();
    }
    /**
     * Check if this is an active enrollment in a finished course
     */
    isActiveInFinishedCourse() {
        return this.isActive() && this.course?.status === status_enums_1.CourseStatus.Finished;
    }
    /**
     * Get enrollment with cancelled status
     */
    cancel() {
        if (!this.canBeCancelled()) {
            throw new Error('Cannot cancel enrollment that is not active');
        }
        return new EnrollmentEntity(this.id, this.userId, this.courseId, status_enums_1.EnrollmentStatus.Cancelled, this.course);
    }
    /**
     * Get enrollment with updated course data
     */
    withCourse(course) {
        if (course.id !== this.courseId) {
            throw new Error('Course ID mismatch');
        }
        return new EnrollmentEntity(this.id, this.userId, this.courseId, this.status, course);
    }
    /**
     * Check if user can enroll in course (static method for validation)
     */
    static canUserEnrollInCourse(userId, courseStatus, existingEnrollment) {
        // User cannot enroll if already has active enrollment
        if (existingEnrollment?.isActive()) {
            return false;
        }
        // User cannot enroll in inactive course
        if (courseStatus !== status_enums_1.CourseStatus.Active) {
            return false;
        }
        return true;
    }
    /**
     * Validate user ID
     */
    validateUserId(userId) {
        if (!userId || userId <= 0) {
            throw new Error('Invalid user ID');
        }
    }
    /**
     * Validate course ID
     */
    validateCourseId(courseId) {
        if (!courseId || courseId <= 0) {
            throw new Error('Invalid course ID');
        }
    }
    /**
     * Convert to plain object for serialization
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            courseId: this.courseId,
            status: this.status,
            course: this.course
        };
    }
}
exports.EnrollmentEntity = EnrollmentEntity;
