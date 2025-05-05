import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/user.model.ts";  
import { IJwtPayload } from "../types/IJwtPayload.ts";  
import { logger } from '../utils/logger.utils.ts';
import { HTTP_STATUS } from "../constants/httpStatusCodes.ts";

dotenv.config();

const secret = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    if (!secret) {
        logger.error("Could not find the secret key for the JWT")
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("JWT_SECRET not found in environment variables");
        return
    }

    const token = req.cookies?.tokenAccess;
    if (!token) {
        logger.error("Could not find the access token.")
        res.status(HTTP_STATUS.UNAUTHORIZED).send("Token not found");
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
        res.status(HTTP_STATUS.FORBIDDEN).send("Unauthorized token");
        return
    }
};