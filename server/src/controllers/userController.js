import { User } from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(422).json({ message: 'Username is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${process.env.API_URL}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: fileUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('-password').limit(20);

    res.json(users);
  } catch (error) {
    next(error);
  }
};
