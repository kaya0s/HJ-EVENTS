import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

// JWT Authentication Middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        
        let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }

        // Verify token
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
