import User, { IUser } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.ts';
import { IJwtPayload } from '../types/IJwtPayload.ts';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.utils.ts';
import { Socket } from 'socket.io';
dotenv.config();
const secretAccess = process.env.JWT_SECRET;
const secretRefresh = process.env.REFRESH_TOKEN_SECRET;

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
            logger.error("There was an error because the username was already taken.")
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
            refreshTokens: []
        })
        
        try {
            await newUser.save();
        } catch (error : any) {
            if (error.code === 11000) {
                logger.error("There was an error because there was an duplicate of data.")
                res.status(400).json({ message: 'Duplicate data found.' });
            } else {
                logger.error("There was an unkown error for .")
                res.status(500).json({ message: 'Server error' });
            }
        }
        logger.info(`The user ${username} was created.`)
        res.status(201).json({ message: 'User sucessfully created' })
    } catch(error) {
        logger.error(`There was an unkown server error.`)
        res.status(500).json({ message: 'Server error' })
    }
}

export const validateUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { username, password } = req.body;
        const user: IUser | null = await User.findOne({ username }).exec();
        if (!user) {
            logger.error("The user was not found.")
            res.status(404).json({ message: 'User not found' });
            return
        }
        if (!user._id) {
            logger.error(`The user id was not found.`)
            res.status(404).json({ message: "User id not found" })
            return
        }

        if (user?.roleRaise === false) {
            logger.error(`The application needs to be accepted by an admin.`)
            res.status(418).json({ message: 'Awaiting Admin confirmation' })
            return
        }

        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        if (!isMatch) {
            logger.error(`The password sent did not match the password stored in the database.`)
            res.status(401).json({ message: 'Invalid credentials' });
            return 
        }

        // Access
        const tokenAccess = generateAccessToken({
            userId: user._id,
            username: user.username,
            role: user.role,
        } as IJwtPayload);
        res.cookie('tokenAccess', tokenAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        //Refresh
        const tokenRefresh = generateRefreshToken(user._id as IJwtPayload["userId"])
        user.refreshTokens.push(tokenRefresh)
        await user.save();
        res.cookie('tokenRefresh', tokenRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const io = req.app.get('socketio');
        try {
            io.emit('userLoggedIn', { userId: user._id, username: user.username });
        } catch(e) {
            console.log(`THERE WAS AN ERROR: \n${e}`)
        }

        logger.info(`The login was successful for ${username}`)
        res.status(200).json({ message: 'Login successful' });
        return 
    } catch (error) {
        logger.error(`There was an unkown server error.`)
        res.status(500).json({ message: 'Server error' });
        return 
    }
}

export const logout = async (req: Request, res: Response) : Promise<void> => {
    const { tokenRefresh } = req.cookies;
    if (tokenRefresh) {
        if (!secretRefresh) {
            logger.error(`Missing REFRESH_TOKEN_SECRET in environment.`);
            res.status(500).send({ message: "Internal server error." });
            return 
        }

        try {
            const payload = jwt.verify( tokenRefresh, secretRefresh) as { userId: string };
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { refreshTokens: tokenRefresh }
            });
            
        } catch (error) {
            logger.error(`There went something wrong during the logout.`)
        }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    logger.info(`The user was succesfully logged out.`)
    res.status(200).json({ message: "Logged out successfully" });
};

export const getUserRole = (req: Request, res: Response): void => {   

    try {
        if (!req.user) {
            logger.error(`Could not find the user.`)
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (req.user.role === "Owner") {
            logger.info(`Sending back the information required in frontend for an owner.`)
            res.status(200).json({ role: req.user.role, username: req.user.username, roleRaise: req.user.roleRaise, userId: req.user._id })
            return
        }

        logger.info(`Sending back the information required in frontend for an user.`)
        res.status(200).json({ role: req.user.role, username: req.user.username, userId: req.user._id });
    } catch (error) {
        logger.error(`There was an unkown server error.`)
        res.status(500).json({ message: "Server error" });
    }
};

export const refreshToken = async(req: Request, res: Response) : Promise<void> => {
    const { tokenRefresh } = req.cookies;

    if (!secretAccess) {
        logger.error(`Could not find the secret key needed for the access token.`)
        res.status(404).send({messsage: "Could not find the access secret key."})
        return
    }

    if (!secretRefresh) {
        logger.error(`Could not find the secret key needed for the refresh token.`)
        res.status(404).send({messsage: "Could not find the refresh secret key."})
        return
    }

    if (!tokenRefresh) {
        logger.error(`The user doesn't have a refresh token.`)
        res.status(401).json({ message: 'No refresh token.' });
        return
    }

    try {
        const payload = jwt.verify(tokenRefresh, secretRefresh) as jwt.JwtPayload;
        const user = await User.findById(payload.userId);
    
        if (!user || !user.refreshTokens.includes(tokenRefresh)) {
            res.status(403).json({ message: 'Invalid refresh token.' });
            return
        }
  
        const newAccessToken = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            secretAccess,
            { expiresIn: '15m' }
        );
    
        logger.info(`Sending back the new access token.`)
        res.cookie('tokenAccess', newAccessToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        res.json({ success: true });
    } catch (err) {
        logger.error(`There was an error when refreshing the token.`)
        res.status(403).json({ message: 'Invalid or expired refresh token.' });
        return
    }
}