import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" });
    res.status(200).json({ message: "Logged out successfully" });
};