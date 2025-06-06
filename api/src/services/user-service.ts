import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../repositories/user-repository';
import { EnrollmentRepository } from '../repositories/enrollment-repository';
import { 
  UserResponseDto, 
  UpdateUserDto, 
  DeleteUserDto, 
  DeleteUserResponseDto,
  ChangePasswordDto
} from '../dto/user-dto';
import { ChangeUserRoleDto, AdminUserListDto, CreateUserByAdminDto } from '../dto/admin-dto';
import { UserRole } from '../entities/status-enums';
import { JwtPayload } from '../utils/jwt.utils';
import { ForbiddenException, NotFoundException, BadRequestException } from '../exceptions';
import { UserEntity } from '../entities/user-entity';

export class UserService {
  private userRepository: UserRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
    this.enrollmentRepository = new EnrollmentRepository(prisma);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(currentUser: JwtPayload): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw NotFoundException.user(currentUser.userId);
    }
    return user;
  }

  /**
   * Get user by ID (admin/trainer only)
   */
  async getUserById(id: number, currentUser: JwtPayload): Promise<UserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);

    // Users can view their own profile, admins/trainers can view any profile
    if (currentUser.userId !== id && !requestingUserEntity.canManageCourses()) {
      throw ForbiddenException.insufficientRole(
        [UserRole.Admin, UserRole.Trainer], 
        requestingUser.role, 
        'view other user profiles'
      );
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw NotFoundException.user(id);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateUser(id: number, dto: UpdateUserDto, currentUser: JwtPayload): Promise<UserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw NotFoundException.user(id);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    const targetUserEntity = UserEntity.create(targetUser);

    // Check if user can perform operation on target user
    if (!requestingUserEntity.canPerformOperationOnUser(targetUserEntity, 'update')) {
      throw ForbiddenException.insufficientRole(
        [UserRole.Admin], 
        requestingUser.role, 
        'update other user profiles'
      );
    }

    // Validate email uniqueness if email is being changed
    if (dto.email && dto.email !== targetUser.email) {
      const emailExists = await this.userRepository.emailExists(dto.email, id);
      if (emailExists) {
        throw BadRequestException.duplicate('User', 'email', dto.email);
      }
    }

    const updatedUser = await this.userRepository.update(id, dto);
    if (!updatedUser) {
      throw NotFoundException.user(id);
    }
    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(dto: ChangePasswordDto, currentUser: JwtPayload): Promise<UserResponseDto> {
    // Users can only change their own password
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw NotFoundException.user(currentUser.userId);
    }

    // Additional password validation
    if (dto.newPassword.length < 6) {
      throw BadRequestException.validation('newPassword', dto.newPassword, 'Hasło musi mieć co najmniej 6 znaków.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw BadRequestException.validation('newPassword', dto.newPassword, 'Nowe hasło musi być inne niż obecne.');
    }

    const updatedUser = await this.userRepository.changePassword(currentUser.userId, dto);
    if (!updatedUser) {
      throw NotFoundException.user(currentUser.userId);
    }
    return updatedUser;
  }

  /**
   * Change user role (admin only)
   */
  async changeUserRole(dto: ChangeUserRoleDto, currentUser: JwtPayload): Promise<UserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.canChangeRoles()) {
      throw ForbiddenException.adminOnly('change user roles');
    }

    const updatedUser = await this.userRepository.changeRole(currentUser.userId, dto);
    if (!updatedUser) {
      throw NotFoundException.user(dto.userId);
    }
    return updatedUser;
  }

  /**
   * Delete user account
   */
  async deleteUser(dto: DeleteUserDto, currentUser: JwtPayload): Promise<DeleteUserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const targetUser = await this.userRepository.findById(dto.id);
    if (!targetUser) {
      throw NotFoundException.user(dto.id);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    const targetUserEntity = UserEntity.create(targetUser);

    // Check permissions
    if (!requestingUserEntity.canPerformOperationOnUser(targetUserEntity, 'delete')) {
      throw ForbiddenException.insufficientRole(
        [UserRole.Admin], 
        requestingUser.role, 
        'delete other user accounts'
      );
    }

    // For self-deletion, password is required
    if (currentUser.userId === dto.id && !dto.password) {
      throw BadRequestException.validation('password', dto.password, 'Hasło jest wymagane do samodzielnego usunięcia konta.');
    }

    const result = await this.userRepository.delete(dto);
    if (!result) {
      throw NotFoundException.user(dto.id);
    }
    return result;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page = 1, limit = 10, currentUser: JwtPayload): Promise<AdminUserListDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.isAdmin()) {
      throw ForbiddenException.adminOnly('view all users');
    }

    return this.userRepository.findAllForAdmin(page, limit);
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(currentUser: JwtPayload): Promise<{
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.isAdmin()) {
      throw ForbiddenException.adminOnly('view user statistics');
    }

    const totalUsers = await this.userRepository.countAll();
    const adminUsers = await this.userRepository.countByRole(UserRole.Admin);
    const trainerUsers = await this.userRepository.countByRole(UserRole.Trainer);
    const participantUsers = await this.userRepository.countByRole(UserRole.Participant);

    return {
      totalUsers,
      usersByRole: {
        [UserRole.Admin]: adminUsers,
        [UserRole.Trainer]: trainerUsers,
        [UserRole.Participant]: participantUsers,
      },
    };
  }

  /**
   * Check if user can be deleted (helper method)
   */
  async canUserBeDeleted(userId: number, currentUser: JwtPayload): Promise<boolean> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw NotFoundException.user(userId);
    }

    const targetUserEntity = UserEntity.create(targetUser);
    return targetUserEntity.canBeDeleted();
  }

  /**
   * Get all users for admin panel (admin only)
   */
  async getAllUsersForAdmin(page: number, limit: number, currentUser: JwtPayload): Promise<AdminUserListDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.isAdmin()) {
      throw ForbiddenException.adminOnly('view all users');
    }

    return this.userRepository.findAllForAdmin(page, limit);
  }

  /**
   * Force delete user (admin only)
   */
  async forceDeleteUser(userId: number, currentUser: JwtPayload): Promise<DeleteUserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.isAdmin()) {
      throw ForbiddenException.adminOnly('force delete users');
    }

    const result = await this.userRepository.delete({ id: userId, force: true });
    if (!result) {
      throw NotFoundException.user(userId);
    }
    return result;
  }

  /**
   * Create a new user by an administrator.
   */
  async createUserByAdmin(dto: CreateUserByAdminDto, currentUser: JwtPayload): Promise<UserResponseDto> {
    const requestingUser = await this.userRepository.findById(currentUser.userId);
    if (!requestingUser) {
      throw NotFoundException.user(currentUser.userId);
    }

    const requestingUserEntity = UserEntity.create(requestingUser);
    if (!requestingUserEntity.isAdmin()) {
      throw ForbiddenException.adminOnly('create users');
    }

    // Basic validation (more can be added with Zod or similar)
    if (!dto.email || !dto.password || !dto.role) {
      throw new BadRequestException('Pola email, password i role są wymagane.', 'MISSING_FIELDS');
    }
    if (dto.password.length < 6) {
      throw BadRequestException.validation('password', dto.password, 'Hasło musi mieć co najmniej 6 znaków.');
    }
    if (!Object.values(UserRole).includes(dto.role)) {
      throw BadRequestException.validation('role', dto.role, 'Nieprawidłowa rola użytkownika.');
    }

    // Service layer calls repository
    const newUser = await this.userRepository.createByAdmin(dto);
    return newUser;
  }
} 