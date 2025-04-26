import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.ts';
import { logger } from '../utils/logger.utils.ts';
import { HTTP_STATUS } from '../constants/httpStatusCodes.ts';

export const authorizeRole = (roles: Array<'User' | 'Admin' | 'Owner'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {

    if (!req.user) {
      logger.error("The user was not found")
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Unauthorized: No user found' });
      return; 
    }

    const user = req.user as IUser;

    if (!roles.includes(user.role)) {
        logger.error("The users role was out side of the roles that were defined.")
        res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Forbidden: You do not have the required permissions' });
        return;
    }

    logger.info("The role was succesfully authorized.")
    next();
  };
};