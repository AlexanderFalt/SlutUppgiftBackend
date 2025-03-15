import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET || '';

if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
}
export const generateToken = (payload: object) => {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};