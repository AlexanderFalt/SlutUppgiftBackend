import User, { IUser } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils.ts';

export const createUser = async(req: Request, res: Response) : Promise<void> => {
    try{
        console.log("Starting create user function")
        const {
            username,
            name,
            emailAddress,
            password,
            role,
        } = req.body;

        console.log(` This was the data that was sent:\n ${JSON.stringify(req.body)}`)

        console.log(`Checking if ${username} already exists`)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Username is already taken' });
            return;
        }

        console.log("Creating a new user document")
        const newUser = new User({
            username,
            name,
            emailAddress,
            password,
            role,
        })

        console.log(` This was the data that was sent:\n ${newUser}`)

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

        console.log("Creating JWT.")
        const token = generateToken({
            userId: newUser._id,
            username: newUser.username,
            role: newUser.role,
        });

        console.log("Attaching the JWT as a cookie")
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Används endast i production
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 timme
        });

        console.log("Starting create user function")
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