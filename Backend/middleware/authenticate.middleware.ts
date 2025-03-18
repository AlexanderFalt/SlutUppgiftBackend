import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/user.model.ts";  
import { IJwtPayload } from "../types/IJwtPayload.ts";  

dotenv.config();

const secret = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    if (!secret) {
        console.error("JWT_SECRET is missing");
        res.status(500).send("JWT_SECRET not found in environment variables");
        return
    }

    const token = req.cookies?.token;
    if (!token) {
        console.error("No token found in cookies");
        res.status(401).send("Token not found");
        return
    }

    try {
        const decoded = jwt.verify(token, secret) as IJwtPayload;

        req.user = {
            _id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            password: "", 
        } as IUser;

        next();
    } catch (err) {
        console.error("Invalid or expired token");
        res.status(403).send("Unauthorized token");
        return
    }
};