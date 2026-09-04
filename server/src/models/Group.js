import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: mongoose.Schema.Types.ObjectId,
    joinedAt: Date,
    unreadCount: {
      type: Number,
      default: 0
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: new Date()
  },
  clearedAt: [{
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: Date
  }],
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export const Group = mongoose.model('Group', groupSchema);
