import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.ts';

export const authorizeRole = (roles: Array<'User' | 'Admin' | 'Owner'>) => {
    return (req: Request, res: Response, next: NextFunction) : void => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: No user found' });
        }

        const user = req.user as IUser;

        if (!roles.includes(user.role)) {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
        }
        next();
    };
}

