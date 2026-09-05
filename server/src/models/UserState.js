import mongoose from 'mongoose';

const userStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  selectedConversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    default: null
  },
  selectedGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  updatedAt: {
    type: Date,
    default: new Date()
  }
});

export const UserState = mongoose.model('UserState', userStateSchema);
