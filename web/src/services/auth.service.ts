import { z } from 'zod';

const API_URL = 'http://localhost:4000';

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
    console.log('📤 Wysyłanie żądania logowania do API...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('❌ Błąd odpowiedzi z API:', response.status);
      const error = await response.json();
      throw new Error(error.error || 'Błąd logowania');
    }

    console.log('📥 Otrzymano odpowiedź z API');
    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('📤 Wysyłanie żądania rejestracji do API...');
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('❌ Błąd odpowiedzi z API:', response.status);
      const error = await response.json();
      throw new Error(error.error || 'Błąd rejestracji');
    }

    console.log('📥 Otrzymano odpowiedź z API');
    return response.json();
  },

  logout() {
    console.log('🗑️ Usuwanie tokena z localStorage');
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔍 Sprawdzanie tokena:', token ? 'znaleziono' : 'brak');
    return token;
  },

  setToken(token: string) {
    console.log('💾 Zapisywanie tokena w localStorage');
    localStorage.setItem('token', token);
  },
}; 