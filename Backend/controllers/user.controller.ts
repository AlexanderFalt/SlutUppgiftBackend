import User, { IUser } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils.ts';

export const createUser = async(req: Request, res: Response) : Promise<void> => {
    try{
        const {
            username,
            name,
            emailAddress,
            password,
            roleRaise,
            role,
        } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Username is already taken' });
            return;
        }

        const newUser = new User({
            username,
            name,
            emailAddress,
            password,
            roleRaise,
            role,
        })
        
        try {
            await newUser.save();
        } catch (error : any) {
            if (error.code === 11000) {
                res.status(400).json({ message: 'Duplicate data found.' });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
            console.error("Error saving user:", error);
        }

        res.status(201).json({ message: 'User sucessfully created' })
    } catch(error) {
        res.status(500).json({ message: 'Server error' })
    }
}

export const validateUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { username, password } = req.body;
        const user: IUser | null = await User.findOne({ username }).exec();
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }

        if (user?.roleRaise === false) {
            res.status(418).json({ message: 'Awaiting Admin confirmation' })
            return
        }

        // Now TypeScript knows that `user` is not null
        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return 
        }

        const token = generateToken({
            userId: user._id,
            username: user.username,
            role: user.role,
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Används endast i production
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 timme
        });


        res.status(200).json({ message: 'Login successful' });
        return 
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        return 
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" });
    res.status(200).json({ message: "Logged out successfully" });
};

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