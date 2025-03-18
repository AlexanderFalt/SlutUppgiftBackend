import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.ts';

export const authorizeRole = (roles: Array<'User' | 'Admin' | 'Owner'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(`This is the user in the authorize file: ${req.user}`)

    if (!req.user) {
      console.error(`Something went wrong in authorize.middleware.ts: 1`);
      res.status(401).json({ message: 'Unauthorized: No user found' });
      return; 
    }

    const user = req.user as IUser;

    if (!roles.includes(user.role)) {
      console.error(`Something went wrong in authorize.middleware.ts: 2`);
      res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
      return;
    }

    next();
  };
};