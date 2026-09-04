import { User } from '../models/User.js';
import { registerUser, loginUser } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.status(422).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(422).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(422).json({ message: 'Password must be at least 6 characters' });
    }

    const { user, token } = await registerUser(username, email, password);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: 'User already exists' });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Missing required fields' });
    }

    const { user, token } = await loginUser(email, password);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In production, send reset email with token
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    next(error);
  }
};
