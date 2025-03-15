import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUser } from '../models/user.model.ts';

dotenv.config();

const secret = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    if (!secret) {
        res.status(500).send('JWT_SECRET not found in environment variables');
        return; 
    }

    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).send('Token not found');
        return; 
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            res.status(403).send('Unauthorized token');
            return; 
        }

        req.user = decoded as IUser; 
        next(); 
    });
};