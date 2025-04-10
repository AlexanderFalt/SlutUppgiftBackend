import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/user.model.ts";  
import { IJwtPayload } from "../types/IJwtPayload.ts";  
import { logger } from '../utils/logger.utils.ts';

dotenv.config();

const secret = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    if (!secret) {
        logger.error("Could not find the secret key for the JWT")
        res.status(500).send("JWT_SECRET not found in environment variables");
        return
    }

    const token = req.cookies?.tokenAccess;
    if (!token) {
        logger.error("Could not find the access token.")
        res.status(401).send("Token not found");
        return
    }

    try {
        const decoded = jwt.verify(token, secret) as IJwtPayload;

        req.user = {
            _id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
        } as IUser;

        logger.info("The token was succesfully authenticated")

        next();
    } catch (err) {
        logger.error("There was an error when trying to authenticate the token.")
        res.status(403).send("Unauthorized token");
        return
    }
};