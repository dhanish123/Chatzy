import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { connectDB } from '../config/database.js';

/**
 * Migration script to clean up old /uploads/ URLs
 * This removes the broken image URLs that were stored with /uploads/ prefix
 * New images will be stored as base64 data URLs
 */

const fixImageUrls = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Fix user profile images
    console.log('Fixing user profile images...');
    const usersResult = await User.updateMany(
      { profileImage: { $regex: '^/uploads/' } },
      { $set: { profileImage: null } }
    );
    console.log(`Updated ${usersResult.modifiedCount} users`);

    // Fix message media URLs
    console.log('Fixing message media URLs...');
    const messagesResult = await Message.updateMany(
      { mediaUrl: { $regex: '^/uploads/' } },
      { $set: { mediaUrl: null } }
    );
    console.log(`Updated ${messagesResult.modifiedCount} messages`);

    console.log('✅ Image URL cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    process.exit(1);
  }
};

fixImageUrls();
