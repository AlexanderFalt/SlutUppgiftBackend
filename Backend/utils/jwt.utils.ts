import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET || '';

if (!secret) {
    console.log("Couldn't find secret.")
    throw new Error("Missing JWT_SECRET in environment variables.");
}

export const generateToken = (payload: object) => {
    console.log(`Making a token with: \n ${JSON.stringify(payload)}`)
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};