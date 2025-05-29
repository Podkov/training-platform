"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user-repository");
const enrollment_repository_1 = require("../repositories/enrollment-repository");
const status_enums_1 = require("../entities/status-enums");
const exceptions_1 = require("../exceptions");
const user_entity_1 = require("../entities/user-entity");
class UserService {
    constructor(prisma) {
        this.userRepository = new user_repository_1.UserRepository(prisma);
        this.enrollmentRepository = new enrollment_repository_1.EnrollmentRepository(prisma);
    }
    /**
     * Get current user profile
     */
    async getCurrentUser(currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        return user;
    }
    /**
     * Get user by ID (admin/trainer only)
     */
    async getUserById(id, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        // Users can view their own profile, admins/trainers can view any profile
        if (currentUser.userId !== id && !requestingUserEntity.canManageCourses()) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin, status_enums_1.UserRole.Trainer], requestingUser.role, 'view other user profiles');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw exceptions_1.NotFoundException.user(id);
        }
        return user;
    }
    /**
     * Update user profile
     */
    async updateUser(id, dto, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const targetUser = await this.userRepository.findById(id);
        if (!targetUser) {
            throw exceptions_1.NotFoundException.user(id);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        const targetUserEntity = user_entity_1.UserEntity.create(targetUser);
        // Check if user can perform operation on target user
        if (!requestingUserEntity.canPerformOperationOnUser(targetUserEntity, 'update')) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin], requestingUser.role, 'update other user profiles');
        }
        // Validate email uniqueness if email is being changed
        if (dto.email && dto.email !== targetUser.email) {
            const emailExists = await this.userRepository.emailExists(dto.email, id);
            if (emailExists) {
                throw exceptions_1.BadRequestException.duplicate('User', 'email', dto.email);
            }
        }
        const updatedUser = await this.userRepository.update(id, dto);
        if (!updatedUser) {
            throw exceptions_1.NotFoundException.user(id);
        }
        return updatedUser;
    }
    /**
     * Change user password
     */
    async changePassword(dto, currentUser) {
        // Users can only change their own password
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        // Additional password validation
        if (dto.newPassword.length < 6) {
            throw exceptions_1.BadRequestException.validation('newPassword', dto.newPassword, 'Password must be at least 6 characters long');
        }
        if (dto.currentPassword === dto.newPassword) {
            throw exceptions_1.BadRequestException.validation('newPassword', dto.newPassword, 'New password must be different from current password');
        }
        const updatedUser = await this.userRepository.changePassword(currentUser.userId, dto);
        if (!updatedUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        return updatedUser;
    }
    /**
     * Change user role (admin only)
     */
    async changeUserRole(dto, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        if (!requestingUserEntity.canChangeRoles()) {
            throw exceptions_1.ForbiddenException.adminOnly('change user roles');
        }
        const updatedUser = await this.userRepository.changeRole(currentUser.userId, dto);
        if (!updatedUser) {
            throw exceptions_1.NotFoundException.user(dto.userId);
        }
        return updatedUser;
    }
    /**
     * Delete user account
     */
    async deleteUser(dto, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const targetUser = await this.userRepository.findById(dto.id);
        if (!targetUser) {
            throw exceptions_1.NotFoundException.user(dto.id);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        const targetUserEntity = user_entity_1.UserEntity.create(targetUser);
        // Check permissions
        if (!requestingUserEntity.canPerformOperationOnUser(targetUserEntity, 'delete')) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin], requestingUser.role, 'delete other user accounts');
        }
        // For self-deletion, password is required
        if (currentUser.userId === dto.id && !dto.password) {
            throw exceptions_1.BadRequestException.validation('password', dto.password, 'Password is required for self-deletion');
        }
        const result = await this.userRepository.delete(dto);
        if (!result) {
            throw exceptions_1.NotFoundException.user(dto.id);
        }
        return result;
    }
    /**
     * Get all users (admin only)
     */
    async getAllUsers(page = 1, limit = 10, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        if (!requestingUserEntity.isAdmin()) {
            throw exceptions_1.ForbiddenException.adminOnly('view all users');
        }
        return this.userRepository.findAllForAdmin(page, limit);
    }
    /**
     * Get user statistics (admin only)
     */
    async getUserStats(currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        if (!requestingUserEntity.isAdmin()) {
            throw exceptions_1.ForbiddenException.adminOnly('view user statistics');
        }
        // This would need additional repository methods
        // For now, return basic structure
        return {
            totalUsers: 0, // Would call userRepository.count()
            usersByRole: {
                [status_enums_1.UserRole.Admin]: 0,
                [status_enums_1.UserRole.Trainer]: 0,
                [status_enums_1.UserRole.Participant]: 0
            }
        };
    }
    /**
     * Check if user can be deleted (helper method)
     */
    async canUserBeDeleted(userId, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const targetUser = await this.userRepository.findById(userId);
        if (!targetUser) {
            throw exceptions_1.NotFoundException.user(userId);
        }
        const targetUserEntity = user_entity_1.UserEntity.create(targetUser);
        return targetUserEntity.canBeDeleted();
    }
    /**
     * Get all users for admin panel (admin only)
     */
    async getAllUsersForAdmin(page, limit, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        if (!requestingUserEntity.isAdmin()) {
            throw exceptions_1.ForbiddenException.adminOnly('view all users');
        }
        return this.userRepository.findAllForAdmin(page, limit);
    }
    /**
     * Force delete user (admin only)
     */
    async forceDeleteUser(userId, currentUser) {
        const requestingUser = await this.userRepository.findById(currentUser.userId);
        if (!requestingUser) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const requestingUserEntity = user_entity_1.UserEntity.create(requestingUser);
        if (!requestingUserEntity.isAdmin()) {
            throw exceptions_1.ForbiddenException.adminOnly('force delete users');
        }
        const result = await this.userRepository.delete({ id: userId, force: true });
        if (!result) {
            throw exceptions_1.NotFoundException.user(userId);
        }
        return result;
    }
}
exports.UserService = UserService;
