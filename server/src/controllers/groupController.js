import { Group } from '../models/Group.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

export const createGroup = async (req, res, next) => {
  try {
    const { name, image, memberIds } = req.body;

    if (!name) {
      return res.status(422).json({ message: 'Group name is required' });
    }

    if (!memberIds || memberIds.length < 2) {
      return res.status(422).json({ message: 'At least 2 other members required' });
    }

    const members = [
      { userId: req.userId, joinedAt: new Date() },
      ...memberIds.map(id => ({ userId: id, joinedAt: new Date() }))
    ];

    const group = new Group({
      name,
      image,
      creatorId: req.userId,
      members
    });

    await group.save();
    await group.populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' }
    ]);

    // System message
    const systemMessage = new Message({
      conversationId: null,
      senderId: req.userId,
      content: `${(await User.findById(req.userId)).username} created the group`,
      mediaUrl: null,
      status: 'sent'
    });
    // Store in groups later

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      'members.userId': req.userId
    }).populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' },
      { path: 'lastMessage' }
    ]).sort({ lastMessageAt: -1 });

    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' },
      { path: 'lastMessage' }
    ]);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.userId._id.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const addGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    if (!memberIds || memberIds.length === 0) {
      return res.status(422).json({ message: 'Member IDs are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.userId.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    for (const memberId of memberIds) {
      const exists = group.members.some(m => m.userId.toString() === memberId);
      if (!exists) {
        group.members.push({ userId: memberId, joinedAt: new Date() });
      }
    }

    await group.save();
    await group.populate([
      { path: 'members.userId', select: '-password' }
    ]);

    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(m => m.userId.toString() !== req.userId.toString());
    await group.save();

    res.json({ message: 'Left group' });
  } catch (error) {
    next(error);
  }
};

export const clearGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.userId.toString() === req.userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.deleteMany({ groupId });
    group.lastMessage = null;
    group.clearedAt.push({ userId: req.userId, timestamp: new Date() });
    await group.save();

    res.json({ message: 'Group cleared' });
  } catch (error) {
    next(error);
  }
};
