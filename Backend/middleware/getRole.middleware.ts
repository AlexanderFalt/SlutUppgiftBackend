import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/IJwtPayload.ts";
import User from "../models/user.model.ts";

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Getting the cookie")
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return 
    }

    try {
        console.log("Verifying the token")
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

        console.log("Got the token payload")
        req.JwtPayload = decoded;

        console.log("Finding the user")
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return 
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

export default authMiddleware;