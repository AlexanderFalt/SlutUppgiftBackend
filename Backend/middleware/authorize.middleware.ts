import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (roles: Array<'User' | 'Admin' | 'Owner'>) => {
    return (req: Request, res: Response, next: NextFunction) : void => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: No user found' });
        }
        if (!roles.includes(req.user.role) && !req.user.role !== undefined) {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
        }
        next();
    };
}

