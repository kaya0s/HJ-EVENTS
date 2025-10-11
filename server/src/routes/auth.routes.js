import express from 'express';
import User from '../models/user.model.js';
import { generateToken } from '../utils/token.js';
import bcrypt from 'bcryptjs'

const router = express.Router()

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if(!email||!password) return res.status(400).json({message:"Invalid Credentials"})

    try {
      
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        generateToken(user._id, res);
        return res.status(200).json({message:"Successfully Logged in!",user}
        )

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//register
router.post("/register",async (req, res) => {
  const { firstName,lastName, email, password } = req.body;
  try {
    if (!firstName||!lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName:firstName+" "+lastName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();


      res.status(201).json({message:"Successfully created an account",user:{
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      }});
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



export default router;
