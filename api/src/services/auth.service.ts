import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils';

const prisma = new PrismaClient();

type UserRole = 'ADMIN' | 'TRAINER' | 'PARTICIPANT';

export interface RegisterData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const { email, password, role = 'PARTICIPANT' } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Użytkownik o podanym emailu już istnieje');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role
    }
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  return { token };
};

export const login = async (data: LoginData) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Nieprawidłowy email lub hasło');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Nieprawidłowy email lub hasło');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  return { token };
}; 