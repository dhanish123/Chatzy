import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  userId1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export const Friendship = mongoose.model('Friendship', friendshipSchema);
