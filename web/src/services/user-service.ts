import { z } from 'zod';
import { api } from './api';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Aktualne hasło jest wymagane'),
  newPassword: z.string().min(6, 'Nowe hasło musi mieć minimum 6 znaków'),
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export interface User {
  id: number;
  email: string;
  role: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async changePassword(data: ChangePasswordData): Promise<User> {
    const response = await api.put<User>('/users/me/password', data);
    return response.data;
  },
  
  async deleteAccount(userId: number, data: DeleteAccountData): Promise<void> {
    await api.delete(`/users/${userId}`, { data });
  },
  
  // TODO: Implement updateUser and deleteAccount if needed
};

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Hasło jest wymagane'),
});
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>; 