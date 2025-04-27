import User, { IUser } from '../models/user.model.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.ts';
import { IJwtPayload } from '../types/IJwtPayload.ts';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.utils.ts';
import { Socket } from 'socket.io';
import { HTTP_STATUS } from '../constants/httpStatusCodes.ts';
import { Http } from 'winston/lib/winston/transports/index.js';
import { ReturnDocument } from 'mongodb';
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
            res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Username is already taken' });
            return;
        }

        const newUser = new User({
            username,
            name,
            emailAddress,
            password,
            roleRaise,
            role
        })
        
        try {
            await newUser.save();
        } catch (error : any) {
            if (error.code === 11000) {
                logger.error("There was an error because there was an duplicate of data.")
                res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Duplicate data found.' });
            } else {
                logger.error("There was an unkown error for .")
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
            }
        }
        logger.info(`The user ${username} was created.`)
        res.status(HTTP_STATUS.CREATED).json({ message: 'User sucessfully created' })
        return;
    } catch(error) {
        logger.error(`There was an unkown server error.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' })
    }
}

export const validateUser = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { username, password } = req.body;
        const io = req.app.get('socketio');
        if (!io) {
          console.error("Socket.io instance not found in app settings!");
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
          return;
        }

        const user: IUser | null = await User.findOne({ username }).exec();
        if (!user) {
            logger.error("The user was not found.")
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
            return
        }
        if (!user._id) {
            logger.error(`The user id was not found.`)
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User id not found" })
            return
        }

        if (user?.roleRaise === false) {
            logger.error(`The application needs to be accepted by an admin.`)
            res.status(HTTP_STATUS.IM_A_TEAPOT).json({ message: 'Awaiting Admin confirmation' })
            return
        }

        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        if (!isMatch) {
            logger.error(`The password sent did not match the password stored in the database.`)
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid credentials' });
            return 
        }
        
        // Access
        const tokenAccess = await generateAccessToken({
            userId: user._id,
            username: user.username,
            role: user.role,
        } as IJwtPayload);
        res.cookie('tokenAccess', tokenAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
            path: '/'
        });

        //Refresh
        const tokenRefresh = await generateRefreshToken(user._id as IJwtPayload["userId"])
        res.cookie('tokenRefresh', tokenRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        logger.info(`The login was successful for ${username}`)
        res.status(HTTP_STATUS.OK).json({ 
            message: 'Login successful', 
            userId: user._id
        });
        return 
    } catch (error) {
        logger.error(`There was an unkown server error.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
        return 
    }
}

export const logout = async (req: Request, res: Response) : Promise<void> => {
    const { tokenRefresh, accessToken } = req.cookies;
    const io = req.app.get('socketio');

    if (!secretRefresh) {
        logger.error(`Missing REFRESH_TOKEN_SECRET in environment.`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: "Internal server error." });
        return 
    }

    if (!secretAccess) {
        logger.error(`Missing REFRESH_TOKEN_SECRET in environment.`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: "Internal server error." });
        return 
    }
    
    io.on('disconnect', (socket: Socket) => {
        socket.disconnect()
        console.log('Left room this is the current rooms:', Array.from(socket.rooms))
    })

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    logger.info(`The user was succesfully logged out.`)
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully" });
};

export const getUserRole = async(req: Request, res: Response): Promise<void> => {   
    try {
        if (!req.user) {
            logger.error(`Could not find the user.`)
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
            return;
        }

        if (req.user.role === "Owner") {
            logger.info(`Sending back the information required in frontend for an owner.`)
            const user = await User.findById(req.user._id).lean();
            if(!user) {
                res.status(HTTP_STATUS.NOT_FOUND).json({message: "Could not find the user for Owner."})
                return
            }
            res.status(HTTP_STATUS.OK).json({ role: req.user.role, username: req.user.username, roleRaise: user.roleRaise, userId: req.user._id })
            return
        }

        logger.info(`Sending back the information required in frontend for an user.`)
        res.status(HTTP_STATUS.OK).json({ role: req.user.role, username: req.user.username, userId: req.user._id });
    } catch (error) {
        logger.error(`There was an unkown server error.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

export const refreshToken = async(req: Request, res: Response) : Promise<void> => {
    const { tokenRefresh } = req.cookies;

    if (!secretAccess) {
        logger.error(`Could not find the secret key needed for the access token.`)
        res.status(HTTP_STATUS.NOT_FOUND).send({messsage: "Could not find the access secret key."})
        return
    }

    if (!secretRefresh) {
        logger.error(`Could not find the secret key needed for the refresh token.`)
        res.status(HTTP_STATUS.NOT_FOUND).send({messsage: "Could not find the refresh secret key."})
        return
    }

    if (!tokenRefresh) {
        logger.error(`The user doesn't have a refresh token.`)
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'No refresh token.' });
        return
    }

    try {
        const payload = jwt.verify(tokenRefresh, secretRefresh) as jwt.JwtPayload;
        const user = await User.findById(payload.userId);
    
        if (!user) {
            res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Invalid refresh token.' });
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
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        res.json({ success: true });
    } catch (err) {
        logger.error(`There was an error when refreshing the token.`)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Invalid or expired refresh token.' });
        return
    }
}