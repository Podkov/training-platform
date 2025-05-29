import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  UserResponseDto, 
  UpdateUserDto, 
  DeleteUserDto, 
  DeleteUserResponseDto,
  ChangePasswordDto
} from '../dto/user-dto';
import { ChangeUserRoleDto, AdminUserListDto } from '../dto/admin-dto';
import { UserRole } from '../entities/status-enums';
import { UserEntity } from '../entities/user-entity';
import { 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '../exceptions';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<UserResponseDto | null> {
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

    if (!user) return null;

    const userEntity = UserEntity.create({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      enrollmentCount: user._count.enrollments
    });

    return userEntity.toJSON() as UserResponseDto;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
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

    if (!user) return null;

    const userEntity = UserEntity.create({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      enrollmentCount: user._count.enrollments
    });

    return userEntity.toJSON() as UserResponseDto;
  }

  /**
   * Get all users for admin panel
   */
  async findAllForAdmin(page = 1, limit = 10): Promise<AdminUserListDto> {
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
        role: user.role as UserRole,
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
  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto | null> {
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
      throw NotFoundException.user(id);
    }

    try {
      // Create entity from existing data
      let userEntity = UserEntity.create({
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role as UserRole,
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
      const finalEntity = UserEntity.create({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role as UserRole,
        enrollmentCount: updatedUser._count.enrollments
      });

      return finalEntity.toJSON() as UserResponseDto;
    } catch (error) {
      if (error instanceof Error) {
        throw BadRequestException.validation('user', dto, error.message);
      }
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(id: number, dto: ChangePasswordDto): Promise<UserResponseDto | null> {
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
      throw NotFoundException.user(id);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw BadRequestException.validation('currentPassword', currentPassword, 'Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

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

    const userEntity = UserEntity.create({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as UserRole,
      enrollmentCount: updatedUser._count.enrollments
    });

    return userEntity.toJSON() as UserResponseDto;
  }

  /**
   * Change user role (admin only)
   */
  async changeRole(adminId: number, dto: ChangeUserRoleDto): Promise<UserResponseDto | null> {
    const { userId, newRole } = dto;

    // Get admin user to validate permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    if (!admin) {
      throw NotFoundException.user(adminId);
    }

    const adminEntity = UserEntity.create({
      id: adminId,
      email: '',
      role: admin.role as UserRole
    });

    if (!adminEntity.canChangeRoles()) {
      throw ForbiddenException.adminOnly('change user roles');
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
      throw NotFoundException.user(userId);
    }

    try {
      // Create entity and validate role transition
      const targetEntity = UserEntity.create({
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role as UserRole,
        enrollmentCount: targetUser._count.enrollments
      });

      // Validate role transition
      if (!UserEntity.isValidRoleTransition(targetEntity.role, newRole)) {
        throw BadRequestException.businessRule('Invalid role transition');
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

      const finalEntity = UserEntity.create({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role as UserRole,
        enrollmentCount: updatedUser._count.enrollments
      });

      return finalEntity.toJSON() as UserResponseDto;
    } catch (error) {
      if (error instanceof Error) {
        throw BadRequestException.validation('role', newRole, error.message);
      }
      throw error;
    }
  }

  /**
   * Delete user with optional force deletion
   */
  async delete(dto: DeleteUserDto): Promise<DeleteUserResponseDto | null> {
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
      throw NotFoundException.user(id);
    }

    // Create entity to check business rules
    const userEntity = UserEntity.create({
      id,
      email: user.email,
      role: user.role as UserRole,
      enrollmentCount: user._count.enrollments
    });

    // If password is provided (self-deletion), verify it
    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw BadRequestException.validation('password', password, 'Invalid password');
      }
    }

    // Check if user can be deleted
    if (!userEntity.canBeDeleted() && !force) {
      throw BadRequestException.businessRule(
        `Cannot delete user with ${userEntity.enrollmentCount} active enrollments. Use force=true to override.`
      );
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
  async exists(id: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });
    return !!user;
  }

  /**
   * Check if email is already taken
   */
  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;
    
    return true;
  }
} 