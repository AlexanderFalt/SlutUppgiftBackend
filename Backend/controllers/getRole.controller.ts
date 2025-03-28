import { Request, Response } from "express";

export const getUserRole = (req: Request, res: Response): void => { 
    try {
        console.log("Starting controller")
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (req.user.role === "Owner") {
            console.log("User Data in Backend:", req.user.role + " " + req.user.username + " " + req.user.roleRaise);
            res.status(200).json({ role: req.user.role, username: req.user.username, roleRaise: req.user.roleRaise, userId: req.user._id })
            return
        }
        console.log("User Data in Backend:", req.user.role + " " + req.user.username); // Debugging log
        res.status(200).json({ role: req.user.role, username: req.user.username, userId: req.user._id });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};