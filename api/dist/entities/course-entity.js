"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseEntity = void 0;
const status_enums_1 = require("./status-enums");
/**
 * Course domain entity with business logic
 * Encapsulates course-related business rules and validation
 */
class CourseEntity {
    constructor(id, title, description, status, enrollmentCount = 0) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.enrollmentCount = enrollmentCount;
        this.validateTitle(title);
        this.validateDescription(description);
    }
    /**
     * Create new course entity from data
     */
    static create(data) {
        return new CourseEntity(data.id, data.title, data.description, data.status, data.enrollmentCount || 0);
    }
    /**
     * Check if course is active and can accept enrollments
     */
    canAcceptEnrollments() {
        return this.status === status_enums_1.CourseStatus.Active;
    }
    /**
     * Check if course can be deleted
     */
    canBeDeleted() {
        return this.enrollmentCount === 0;
    }
    /**
     * Check if course can be finished
     */
    canBeFinished() {
        return this.status === status_enums_1.CourseStatus.Active;
    }
    /**
     * Get course with updated status
     */
    withStatus(newStatus) {
        if (newStatus === status_enums_1.CourseStatus.Finished && !this.canBeFinished()) {
            throw new Error('Cannot finish course that is not active');
        }
        return new CourseEntity(this.id, this.title, this.description, newStatus, this.enrollmentCount);
    }
    /**
     * Get course with updated enrollment count
     */
    withEnrollmentCount(count) {
        if (count < 0) {
            throw new Error('Enrollment count cannot be negative');
        }
        return new CourseEntity(this.id, this.title, this.description, this.status, count);
    }
    /**
     * Check if course has active enrollments
     */
    hasActiveEnrollments() {
        return this.enrollmentCount > 0;
    }
    /**
     * Validate course title
     */
    validateTitle(title) {
        if (!title || title.trim().length === 0) {
            throw new Error('Course title cannot be empty');
        }
        if (title.length < 3) {
            throw new Error('Course title must be at least 3 characters long');
        }
        if (title.length > 100) {
            throw new Error('Course title cannot exceed 100 characters');
        }
    }
    /**
     * Validate course description
     */
    validateDescription(description) {
        if (!description || description.trim().length === 0) {
            throw new Error('Course description cannot be empty');
        }
        if (description.length < 10) {
            throw new Error('Course description must be at least 10 characters long');
        }
        if (description.length > 1000) {
            throw new Error('Course description cannot exceed 1000 characters');
        }
    }
    /**
     * Convert to plain object for serialization
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            enrollmentCount: this.enrollmentCount
        };
    }
}
exports.CourseEntity = CourseEntity;
