import { Request, Response } from 'express';
import User from '../models/User.model';
import bcrypt from 'bcryptjs';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/token';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

interface RegisterRequest extends Request {
    body: {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
        phone: string;
    };
}

interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

// Register a new user
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, username, email, password, phone } = req.body;

        if (!firstName || !lastName || !username || !email || !password || !phone) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return;
        }

        // Check name length validation
        if ((firstName.length < 3 || firstName.length > 30) || (lastName.length < 3 || lastName.length > 30)) {
            res.status(400).json({ message: "First and Last names must be between 3 and 30 characters" });
            return;
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ message: 'Email or username already in use.' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            firstName,
            lastName,
            username, 
            phone,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Double-check user was saved and handle possible save error
        if (!user || !user._id) {
            res.status(500).json({ message: 'Failed to register user.' });
            return;
        }

        res.status(201).json({ 
            message: 'User registered successfully.',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
};

// Login user
export const login = async (req: LoginRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
       
        if (!email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        
        // Fix: Use toLowerCase() instead of lowerCase()
        const normalizedEmail = email.toLowerCase();
        
        // Find user by email or username
        const user = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedEmail }] });
        if (!user) {  
            res.status(400).json({ message: 'User not Found' });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }

        // Generate token and set cookie
        const token = generateToken((user._id as any).toString(), user.email);
        setTokenCookie(res, token);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get current user
export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // userId should come from middleware after JWT verification
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear the token cookie
        clearTokenCookie(res);
        res.json({ message: 'Logged out successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};
