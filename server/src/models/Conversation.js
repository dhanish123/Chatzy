import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: mongoose.Schema.Types.ObjectId,
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
  clearedAt: {
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
