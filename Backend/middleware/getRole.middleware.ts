import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/IJwtPayload.ts";
import User from "../models/user.model.ts";

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Getting the cookie");
    const token = req.cookies?.token;

    if (!token) {
        console.error("No token found");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        console.log("Verifying the token");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

        console.log(decoded)
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.error("User not found in database");
            res.status(401).json({ message: "User not found" });
            return;
        }

        req.user = user;
        console.log("User found:", user.username);
        next();
    } catch (error) {
        console.error("Invalid token", error);
        res.status(403).json({ message: "Invalid token" });
    }
};

export default authMiddleware;