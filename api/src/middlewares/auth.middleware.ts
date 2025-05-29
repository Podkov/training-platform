import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.utils';

type UserRole = 'ADMIN' | 'TRAINER' | 'PARTICIPANT';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Brak tokena autoryzacji' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
    return;
  }
};

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: 'Brak uprawnień' });
      return;
    }

    next();
  };
}; 