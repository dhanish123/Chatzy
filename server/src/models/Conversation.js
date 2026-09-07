import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    clearedAt: {
      type: Date,
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date,
      default: null
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
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
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
