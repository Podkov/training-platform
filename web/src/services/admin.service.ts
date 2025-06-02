import { api } from './api';

// Zgodnie z UserResponseDto na backendzie (UserRepository i UserService)
export interface AdminUserListItemDto {
  id: number;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'PARTICIPANT'; // Używamy string literals zamiast UserRole enum dla prostoty po stronie klienta
  enrollmentCount?: number; // Liczba aktywnych zapisów, opcjonalna
  // Dodatkowe pola, jeśli backend je zwraca i są potrzebne
  // np. createdAt, updatedAt
}

export interface AdminUserListResponseDto {
  users: AdminUserListItemDto[];
  total: number;
  page: number;
  limit: number;
}

// DTO dla tworzenia użytkownika przez admina
export interface CreateUserByAdminPayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'TRAINER' | 'PARTICIPANT';
}

// DTO dla zmiany roli
export interface ChangeUserRolePayload {
  newRole: 'ADMIN' | 'TRAINER' | 'PARTICIPANT';
}

// Typy dla statystyk
export interface UserStatsDto {
  totalUsers: number;
  usersByRole: Record<'ADMIN' | 'TRAINER' | 'PARTICIPANT', number>;
}

export interface CourseStatsDto {
  totalCourses: number;
  coursesByStatus: Record<string, number>; // np. { active: 10, finished: 5 }
}

export interface EnrollmentStatsDto {
  totalEnrollments: number;
  enrollmentsByStatus: Record<string, number>; // np. { active: 50, cancelled: 10 }
}

export interface AdminStatsResponseDto {
  users: UserStatsDto;
  courses: CourseStatsDto;
  enrollments: EnrollmentStatsDto;
  generatedAt: string; // ISO date string
}

export const adminService = {
  async getAllUsers(page = 1, limit = 10): Promise<AdminUserListResponseDto> {
    const response = await api.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  async changeUserRole(userId: number, payload: ChangeUserRolePayload): Promise<AdminUserListItemDto> {
    const response = await api.put(`/admin/users/${userId}/role`, payload);
    return response.data;
  },

  async deleteUserByAdmin(userId: number): Promise<void> { // Zakładamy, że force jest domyślnie true na backendzie
    // Backend używa POST dla force-delete
    await api.post(`/admin/users/${userId}/force-delete`);
    // Zazwyczaj DELETE nie zwraca ciała, ale POST może. Jeśli API zwraca coś, można to obsłużyć.
    // Na razie zakładamy, że rzuca błąd w przypadku niepowodzenia, a sukces to brak błędu.
  },

  async createUser(payload: CreateUserByAdminPayload): Promise<AdminUserListItemDto> {
    const response = await api.post('/admin/users', payload);
    return response.data; // Oczekujemy, że backend zwróci nowo utworzonego użytkownika
  },

  async getStats(): Promise<AdminStatsResponseDto> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // W przyszłości można dodać inne metody, np.:
  // async changeUserRole(userId: number, newRole: string): Promise<AdminUserListItemDto> { ... }
  // async deleteUser(userId: number, force?: boolean): Promise<void> { ... }
}; 