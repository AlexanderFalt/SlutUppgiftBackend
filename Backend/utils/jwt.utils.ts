import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IJwtPayload } from '../types/IJwtPayload.ts';
import { logger } from './logger.utils.ts';
dotenv.config();

const secretAccess = process.env.JWT_SECRET;
const secretRefresh = process.env.REFRESH_TOKEN_SECRET;

if (!secretAccess || !secretRefresh) {
    logger.error("Could not find a secret key")
    throw new Error("Missing private keys for the JWTs.");
}

export const generateAccessToken = (payload: IJwtPayload) => {
    logger.info("Creating a access token")
    return jwt.sign(payload, secretAccess, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: IJwtPayload["userId"]) => {
    logger.info("Creating a refresh token")
    return jwt.sign( { userId }, secretRefresh, { expiresIn: '7d' });
}  