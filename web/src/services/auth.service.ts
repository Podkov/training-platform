import { z } from 'zod';
import { api } from './api';

export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
});

export const registerSchema = loginSchema.extend({
  role: z.enum(['ADMIN', 'TRAINER', 'PARTICIPANT']).optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export interface AuthResponse {
  token: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    localStorage.removeItem('token');
    
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },
}; 