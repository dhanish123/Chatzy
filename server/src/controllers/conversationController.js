import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(422).json({ message: 'User ID is required' });
    }

    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': req.userId },
        { 'participants.userId': otherUserId }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { userId: req.userId, unreadCount: 0 },
          { userId: otherUserId, unreadCount: 0 }
        ]
      });
      await conversation.save();
    }

    // Populate user data before returning
    await conversation.populate([
      { path: 'lastMessage' },
      { path: 'participants.userId', select: '-password' }
    ]);

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.userId
    }).populate([
      { path: 'lastMessage' },
      { path: 'participants.userId', select: '-password' }
    ]).sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate([
      { path: 'lastMessage' },
      { path: 'participants.userId', select: '-password' }
    ]);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId._id.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const participant = conversation.participants.find(
      p => p.userId.toString() === req.userId.toString()
    );

    if (!participant) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    participant.unreadCount = 0;
    await conversation.save();

    // Mark all messages as read
    const messages = await Message.find({ conversationId });
    for (const message of messages) {
      if (message.senderId.toString() !== req.userId.toString()) {
        const readBy = message.readBy.find(r => r.userId.toString() === req.userId.toString());
        if (!readBy) {
          message.readBy.push({ userId: req.userId, readAt: new Date() });
          if (message.readBy.length === conversation.participants.length) {
            message.status = 'read';
          } else if (message.status === 'sent') {
            message.status = 'delivered';
          }
          await message.save();
        }
      }
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const clearConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.deleteMany({ conversationId });
    conversation.lastMessage = null;
    conversation.clearedAt = { userId: req.userId, timestamp: new Date() };
    await conversation.save();

    res.json({ message: 'Conversation cleared' });
  } catch (error) {
    next(error);
  }
};
