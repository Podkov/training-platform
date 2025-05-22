import { Request, Response } from 'express';
import { register, login } from '../services/auth.service';

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const result = await register({ email, password, role });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Wystąpił nieoczekiwany błąd' });
    }
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Wystąpił nieoczekiwany błąd' });
    }
  }
}; 