import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { Group } from '../models/Group.js';

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Check if it's a group or conversation
    let clearTimestamp = null;

    // First try as conversation
    let conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const participant = conversation.participants.find(
        p => p.userId.toString() === req.userId.toString()
      );

      if (!participant) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      clearTimestamp = participant.clearedAt;

      // Build query - only show messages created after clearedAt
      const query = { conversationId };
      if (clearTimestamp) {
        query.createdAt = { $gte: clearTimestamp };
      }

      const messages = await Message.find(query)
        .populate('senderId', '-password')
        .populate('replyTo')
        .sort({ createdAt: 1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return res.json(messages.reverse());
    }

    // Try as group
    const group = await Group.findById(conversationId);
    if (group) {
      const isMember = group.members.some(m => m.userId.toString() === req.userId.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const cleared = group.clearedAt?.find(c => c.userId.toString() === req.userId.toString());
      clearTimestamp = cleared?.timestamp;

      // Build query - only show messages created after clearedAt
      const query = { groupId: conversationId };
      if (clearTimestamp) {
        query.createdAt = { $gte: clearTimestamp };
      }

      const messages = await Message.find(query)
        .populate('senderId', '-password')
        .populate('replyTo')
        .sort({ createdAt: 1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return res.json(messages.reverse());
    }

    return res.status(404).json({ message: 'Conversation or group not found' });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const { conversationId, content, mediaUrl, mediaType, replyTo } = req.body;

    if (!conversationId) {
      return res.status(422).json({ message: 'Conversation ID is required' });
    }

    // Check if it's a group or conversation
    let conversation = await Conversation.findById(conversationId);
    let group = null;

    if (conversation) {
      const isParticipant = conversation.participants.some(
        p => p.userId.toString() === req.userId.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const message = new Message({
        conversationId,
        senderId: req.userId,
        content: content || '',
        mediaUrl,
        mediaType,
        replyTo,
        status: 'sent'
      });

      await message.save();
      await message.populate('senderId', '-password');
      await message.populate('replyTo');

      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      return res.status(201).json(message);
    }

    // Try as group
    group = await Group.findById(conversationId);
    if (group) {
      const isMember = group.members.some(m => m.userId.toString() === req.userId.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const message = new Message({
        groupId: conversationId,
        senderId: req.userId,
        content: content || '',
        mediaUrl,
        mediaType,
        replyTo,
        status: 'sent'
      });

      await message.save();
      await message.populate('senderId', '-password');
      await message.populate('replyTo');

      group.lastMessage = message._id;
      group.lastMessageAt = new Date();
      await group.save();

      return res.status(201).json(message);
    }

    return res.status(404).json({ message: 'Conversation or group not found' });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const createdTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (currentTime - createdTime > tenMinutes) {
      return res.status(403).json({ message: 'Cannot edit message after 10 minutes' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const createdTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (currentTime - createdTime > tenMinutes) {
      return res.status(403).json({ message: 'Cannot delete message after 10 minutes' });
    }

    message.isDeleted = true;
    message.content = '';
    message.mediaUrl = null;
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const readBy = message.readBy.find(r => r.userId.toString() === req.userId.toString());
    if (!readBy && message.senderId.toString() !== req.userId.toString()) {
      message.readBy.push({ userId: req.userId, readAt: new Date() });
      message.status = 'read';
      await message.save();
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
};
