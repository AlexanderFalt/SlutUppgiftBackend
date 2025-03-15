import User, { IUser } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.utils.ts';

export const createUser = async(req: Request, res: Response) : Promise<void> => {
    try{
        const {
            username,
            name,
            emailAdress,
            password,
            role,
        } = req.body;
        const newUser = new User({
            username,
            name,
            emailAdress,
            password,
            role,
        })
        await newUser.save()
                 
        const token = generateToken({
            userId: newUser._id,
            username: newUser.username,
            role: newUser.role,
        });

        res.status(201).json({ message: 'User sucessfully created', token})
    } catch(error) {
        res.status(500).json({ message: 'Server error' })
    }
}

export const validateUser = async (req: Request, res: Response): Promise<Response>  => {
    try {
        const { username, password } = req.body;
        const user: IUser | null = await User.findOne({ username }).exec();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });  // <-- Notice the return here
        }

        // Now TypeScript knows that `user` is not null
        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });  // <-- Another return here
        }

        const token = generateToken({
            userId: user._id,
            username: user.username,
            role: user.role,
        });
        return res.status(200).json({ message: 'Login successful', token });  // <-- And return here
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}