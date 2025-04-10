import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/IJwtPayload.ts";
import User from "../models/user.model.ts";
import { logger } from '../utils/logger.utils.ts';

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.tokenAccess;

    if (!token) {
        logger.error("Could not find the token")
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;
        const user = await User.findById(decoded.userId);
        if (!user) {
            logger.error("Could not find the user")
            res.status(401).json({ message: "User not found" });
            return;
        }

        req.user = user;
        logger.info("The user was found.")
        next();
    } catch (error) {
        logger.error("There was an error when getting the role.")
        res.status(403).json({ message: "Invalid token" });
    }
};

export default authMiddleware;