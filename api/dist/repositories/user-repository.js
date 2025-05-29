"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_entity_1 = require("../entities/user-entity");
const exceptions_1 = require("../exceptions");
class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Find user by ID
     */
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!user)
            return null;
        const userEntity = user_entity_1.UserEntity.create({
            id: user.id,
            email: user.email,
            role: user.role,
            enrollmentCount: user._count.enrollments
        });
        return userEntity.toJSON();
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!user)
            return null;
        const userEntity = user_entity_1.UserEntity.create({
            id: user.id,
            email: user.email,
            role: user.role,
            enrollmentCount: user._count.enrollments
        });
        return userEntity.toJSON();
    }
    /**
     * Get all users for admin panel
     */
    async findAllForAdmin(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    _count: {
                        select: { enrollments: { where: { status: 'active' } } }
                    }
                },
                skip,
                take: limit,
                orderBy: { id: 'desc' }
            }),
            this.prisma.user.count()
        ]);
        return {
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                role: user.role,
                enrollmentCount: user._count.enrollments
            })),
            total,
            page,
            limit
        };
    }
    /**
     * Update user profile
     */
    async update(id, dto) {
        // Get existing user
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!existingUser) {
            throw exceptions_1.NotFoundException.user(id);
        }
        try {
            // Create entity from existing data
            let userEntity = user_entity_1.UserEntity.create({
                id: existingUser.id,
                email: existingUser.email,
                role: existingUser.role,
                enrollmentCount: existingUser._count.enrollments
            });
            // Apply updates using entity methods (validates business rules)
            if (dto.email && dto.email !== userEntity.email) {
                userEntity = userEntity.withEmail(dto.email);
            }
            // Update in database
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    ...(dto.email && { email: dto.email })
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    _count: {
                        select: { enrollments: { where: { status: 'active' } } }
                    }
                }
            });
            // Create final entity with updated data
            const finalEntity = user_entity_1.UserEntity.create({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                enrollmentCount: updatedUser._count.enrollments
            });
            return finalEntity.toJSON();
        }
        catch (error) {
            if (error instanceof Error) {
                throw exceptions_1.BadRequestException.validation('user', dto, error.message);
            }
            throw error;
        }
    }
    /**
     * Change user password
     */
    async changePassword(id, dto) {
        const { currentPassword, newPassword } = dto;
        // Get user with password hash
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                passwordHash: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!user) {
            throw exceptions_1.NotFoundException.user(id);
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw exceptions_1.BadRequestException.validation('currentPassword', currentPassword, 'Invalid current password');
        }
        // Hash new password
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { passwordHash: newPasswordHash },
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        const userEntity = user_entity_1.UserEntity.create({
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            enrollmentCount: updatedUser._count.enrollments
        });
        return userEntity.toJSON();
    }
    /**
     * Change user role (admin only)
     */
    async changeRole(adminId, dto) {
        const { userId, newRole } = dto;
        // Get admin user to validate permissions
        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true }
        });
        if (!admin) {
            throw exceptions_1.NotFoundException.user(adminId);
        }
        const adminEntity = user_entity_1.UserEntity.create({
            id: adminId,
            email: '',
            role: admin.role
        });
        if (!adminEntity.canChangeRoles()) {
            throw exceptions_1.ForbiddenException.adminOnly('change user roles');
        }
        // Get target user
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!targetUser) {
            throw exceptions_1.NotFoundException.user(userId);
        }
        try {
            // Create entity and validate role transition
            const targetEntity = user_entity_1.UserEntity.create({
                id: targetUser.id,
                email: targetUser.email,
                role: targetUser.role,
                enrollmentCount: targetUser._count.enrollments
            });
            // Validate role transition
            if (!user_entity_1.UserEntity.isValidRoleTransition(targetEntity.role, newRole)) {
                throw exceptions_1.BadRequestException.businessRule('Invalid role transition');
            }
            // Update role
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { role: newRole },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    _count: {
                        select: { enrollments: { where: { status: 'active' } } }
                    }
                }
            });
            const finalEntity = user_entity_1.UserEntity.create({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                enrollmentCount: updatedUser._count.enrollments
            });
            return finalEntity.toJSON();
        }
        catch (error) {
            if (error instanceof Error) {
                throw exceptions_1.BadRequestException.validation('role', newRole, error.message);
            }
            throw error;
        }
    }
    /**
     * Delete user with optional force deletion
     */
    async delete(dto) {
        const { id, password, force = false } = dto;
        // Get user data
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                email: true,
                passwordHash: true,
                role: true,
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!user) {
            throw exceptions_1.NotFoundException.user(id);
        }
        // Create entity to check business rules
        const userEntity = user_entity_1.UserEntity.create({
            id,
            email: user.email,
            role: user.role,
            enrollmentCount: user._count.enrollments
        });
        // If password is provided (self-deletion), verify it
        if (password) {
            const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isValidPassword) {
                throw exceptions_1.BadRequestException.validation('password', password, 'Invalid password');
            }
        }
        // Check if user can be deleted
        if (!userEntity.canBeDeleted() && !force) {
            throw exceptions_1.BadRequestException.businessRule(`Cannot delete user with ${userEntity.enrollmentCount} active enrollments. Use force=true to override.`);
        }
        // Use transaction to ensure data consistency
        const result = await this.prisma.$transaction(async (tx) => {
            let enrollmentsCancelled = 0;
            // Cancel all active enrollments if any
            if (userEntity.hasActiveEnrollments()) {
                const cancelResult = await tx.enrollment.updateMany({
                    where: {
                        userId: id,
                        status: 'active'
                    },
                    data: { status: 'cancelled' }
                });
                enrollmentsCancelled = cancelResult.count;
            }
            // Delete the user
            await tx.user.delete({
                where: { id }
            });
            return enrollmentsCancelled;
        });
        return {
            id,
            email: user.email,
            message: 'User deleted successfully',
            enrollmentsCancelled: result
        };
    }
    /**
     * Check if user exists
     */
    async exists(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true }
        });
        return !!user;
    }
    /**
     * Check if email is already taken
     */
    async emailExists(email, excludeUserId) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (!user)
            return false;
        if (excludeUserId && user.id === excludeUserId)
            return false;
        return true;
    }
}
exports.UserRepository = UserRepository;
