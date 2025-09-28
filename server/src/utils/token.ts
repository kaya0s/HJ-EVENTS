import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface JwtPayload {
    userId: string;
    email: string;
}

// Generate JWT token
export const generateToken = (userId: string, email: string): string => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Set token in HTTP-only cookie
export const setTokenCookie = (res: Response, token: string): void => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};

// Clear token cookie
export const clearTokenCookie = (res: Response): void => {
    res.clearCookie('token');
};
