"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const status_enums_1 = require("./status-enums");
/**
 * User domain entity with business logic
 * Encapsulates user-related business rules and validation
 */
class UserEntity {
    constructor(id, email, role, enrollmentCount = 0) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.enrollmentCount = enrollmentCount;
        this.validateEmail(email);
        this.validateRole(role);
    }
    /**
     * Create new user entity from data
     */
    static create(data) {
        return new UserEntity(data.id, data.email, data.role, data.enrollmentCount || 0);
    }
    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.role === status_enums_1.UserRole.Admin;
    }
    /**
     * Check if user is trainer
     */
    isTrainer() {
        return this.role === status_enums_1.UserRole.Trainer;
    }
    /**
     * Check if user is participant
     */
    isParticipant() {
        return this.role === status_enums_1.UserRole.Participant;
    }
    /**
     * Check if user can manage courses
     */
    canManageCourses() {
        return this.isAdmin() || this.isTrainer();
    }
    /**
     * Check if user can enroll in courses
     */
    canEnrollInCourses() {
        return this.isParticipant();
    }
    /**
     * Check if user can delete other users
     */
    canDeleteUsers() {
        return this.isAdmin();
    }
    /**
     * Check if user can change roles
     */
    canChangeRoles() {
        return this.isAdmin();
    }
    /**
     * Check if user can be deleted
     */
    canBeDeleted() {
        return this.enrollmentCount === 0;
    }
    /**
     * Check if user has active enrollments
     */
    hasActiveEnrollments() {
        return this.enrollmentCount > 0;
    }
    /**
     * Get user with updated role
     */
    withRole(newRole) {
        // Business rule: only admins can change roles
        this.validateRole(newRole);
        return new UserEntity(this.id, this.email, newRole, this.enrollmentCount);
    }
    /**
     * Get user with updated email
     */
    withEmail(newEmail) {
        this.validateEmail(newEmail);
        return new UserEntity(this.id, newEmail, this.role, this.enrollmentCount);
    }
    /**
     * Get user with updated enrollment count
     */
    withEnrollmentCount(count) {
        if (count < 0) {
            throw new Error('Enrollment count cannot be negative');
        }
        return new UserEntity(this.id, this.email, this.role, count);
    }
    /**
     * Check if user can perform operation on another user
     */
    canPerformOperationOnUser(targetUser, operation) {
        // Admins can perform any operation on any user
        if (this.isAdmin()) {
            return true;
        }
        // Users can only perform operations on themselves
        if (this.id === targetUser.id) {
            // But not role changes
            if (operation === 'changeRole') {
                return false;
            }
            return true;
        }
        return false;
    }
    /**
     * Check if role transition is valid
     */
    static isValidRoleTransition(from, to) {
        // All transitions are valid for admins to perform
        // But we might add business rules here, e.g.:
        // - Cannot demote the last admin
        // - Cannot promote to admin without special approval
        return true;
    }
    /**
     * Validate email format
     */
    validateEmail(email) {
        if (!email || email.trim().length === 0) {
            throw new Error('Email cannot be empty');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        if (email.length > 255) {
            throw new Error('Email cannot exceed 255 characters');
        }
    }
    /**
     * Validate user role
     */
    validateRole(role) {
        if (!Object.values(status_enums_1.UserRole).includes(role)) {
            throw new Error(`Invalid user role: ${role}`);
        }
    }
    /**
     * Convert to plain object for serialization
     */
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            role: this.role,
            enrollmentCount: this.enrollmentCount
        };
    }
}
exports.UserEntity = UserEntity;
