import { UserRole } from './status-enums';

/**
 * User domain entity with business logic
 * Encapsulates user-related business rules and validation
 */
export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly enrollmentCount: number = 0
  ) {
    this.validateEmail(email);
    this.validateRole(role);
  }

  /**
   * Create new user entity from data
   */
  static create(data: {
    id: number;
    email: string;
    role: UserRole;
    enrollmentCount?: number;
  }): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.role,
      data.enrollmentCount || 0
    );
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.Admin;
  }

  /**
   * Check if user is trainer
   */
  isTrainer(): boolean {
    return this.role === UserRole.Trainer;
  }

  /**
   * Check if user is participant
   */
  isParticipant(): boolean {
    return this.role === UserRole.Participant;
  }

  /**
   * Check if user can manage courses
   */
  canManageCourses(): boolean {
    return this.isAdmin() || this.isTrainer();
  }

  /**
   * Check if user can enroll in courses
   */
  canEnrollInCourses(): boolean {
    return this.isParticipant();
  }

  /**
   * Check if user can delete other users
   */
  canDeleteUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if user can change roles
   */
  canChangeRoles(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if user can be deleted
   */
  canBeDeleted(): boolean {
    return this.enrollmentCount === 0;
  }

  /**
   * Check if user has active enrollments
   */
  hasActiveEnrollments(): boolean {
    return this.enrollmentCount > 0;
  }

  /**
   * Get user with updated role
   */
  withRole(newRole: UserRole): UserEntity {
    // Business rule: only admins can change roles
    this.validateRole(newRole);

    return new UserEntity(
      this.id,
      this.email,
      newRole,
      this.enrollmentCount
    );
  }

  /**
   * Get user with updated email
   */
  withEmail(newEmail: string): UserEntity {
    this.validateEmail(newEmail);

    return new UserEntity(
      this.id,
      newEmail,
      this.role,
      this.enrollmentCount
    );
  }

  /**
   * Get user with updated enrollment count
   */
  withEnrollmentCount(count: number): UserEntity {
    if (count < 0) {
      throw new Error('Enrollment count cannot be negative');
    }

    return new UserEntity(
      this.id,
      this.email,
      this.role,
      count
    );
  }

  /**
   * Check if user can perform operation on another user
   */
  canPerformOperationOnUser(targetUser: UserEntity, operation: string): boolean {
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
  static isValidRoleTransition(from: UserRole, to: UserRole): boolean {
    // All transitions are valid for admins to perform
    // But we might add business rules here, e.g.:
    // - Cannot demote the last admin
    // - Cannot promote to admin without special approval
    return true;
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
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
  private validateRole(role: UserRole): void {
    if (!Object.values(UserRole).includes(role)) {
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