import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (username, email, password) => {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new User({ username, email, password });
  await user.save();

  const token = generateToken(user._id);
  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);
  return { user, token };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
