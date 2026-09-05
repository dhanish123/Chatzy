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
      { userId: req.userId, isAdmin: true, joinedAt: new Date() },
      ...memberIds.map(id => ({ userId: id, isAdmin: false, joinedAt: new Date() }))
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

    // Create system message for group creation
    const creator = await User.findById(req.userId);
    const systemMessage = new Message({
      groupId: group._id,
      senderId: req.userId,
      content: `${creator.username} created the group`,
      isSystemMessage: true,
      systemMessageType: 'groupCreated',
      status: 'sent'
    });
    await systemMessage.save();

    // Update group's last message
    group.lastMessage = systemMessage._id;
    group.lastMessageAt = new Date();
    await group.save();

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

    const addedMembers = [];
    for (const memberId of memberIds) {
      const exists = group.members.some(m => m.userId.toString() === memberId);
      if (!exists) {
        group.members.push({ userId: memberId, isAdmin: false, joinedAt: new Date() });
        addedMembers.push(memberId);
      }
    }

    await group.save();
    await group.populate([
      { path: 'members.userId', select: '-password' }
    ]);

    // Create system messages for added members
    if (addedMembers.length > 0) {
      const currentUser = await User.findById(req.userId);
      const io = req.app.get('io');
      
      for (const memberId of addedMembers) {
        const addedUser = await User.findById(memberId);
        const systemMessage = new Message({
          groupId: group._id,
          senderId: req.userId,
          content: `${currentUser.username} added ${addedUser.username}`,
          isSystemMessage: true,
          systemMessageType: 'memberAdded',
          status: 'sent'
        });
        await systemMessage.save();
        
        // Emit to group socket
        if (io) {
          io.to(`group:${groupId}`).emit('systemMessage', {
            _id: systemMessage._id,
            groupId: group._id,
            senderId: req.userId,
            content: systemMessage.content,
            isSystemMessage: true,
            systemMessageType: 'memberAdded',
            createdAt: systemMessage.createdAt,
            status: 'sent'
          });
        }
      }
      
      // Update last message
      group.lastMessage = (await Message.findOne({ groupId: group._id }).sort({ createdAt: -1 }))._id;
      group.lastMessageAt = new Date();
      await group.save();
    }

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

    const currentUser = await User.findById(req.userId);
    group.members = group.members.filter(m => m.userId.toString() !== req.userId.toString());

    // Create system message for member leaving
    const systemMessage = new Message({
      groupId: group._id,
      senderId: req.userId,
      content: `${currentUser.username} left the group`,
      isSystemMessage: true,
      systemMessageType: 'memberRemoved',
      status: 'sent'
    });
    await systemMessage.save();

    group.lastMessage = systemMessage._id;
    group.lastMessageAt = new Date();
    await group.save();

    // Emit to group socket
    const io = req.app.get('io');
    if (io) {
      io.to(`group:${groupId}`).emit('systemMessage', {
        _id: systemMessage._id,
        groupId: group._id,
        senderId: req.userId,
        content: systemMessage.content,
        isSystemMessage: true,
        systemMessageType: 'memberRemoved',
        createdAt: systemMessage.createdAt,
        status: 'sent'
      });
    }

    res.json({ message: 'Left group', group });
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

export const makeAdmin = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only group creator can make admins
    if (group.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can manage admins' });
    }

    const member = group.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.isAdmin = true;
    await group.save();
    await group.populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' }
    ]);

    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const removeAdmin = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only group creator can remove admins
    if (group.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can manage admins' });
    }

    const member = group.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Don't allow removing creator's admin status
    if (group.creatorId.toString() === memberId) {
      return res.status(422).json({ message: 'Cannot remove creator admin status' });
    }

    member.isAdmin = false;
    await group.save();
    await group.populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' }
    ]);

    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only admin can remove members
    const isAdmin = group.creatorId.toString() === req.userId.toString() ||
      group.members.find(m => m.userId.toString() === req.userId.toString() && m.isAdmin);
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Don't allow removing creator
    if (group.creatorId.toString() === memberId) {
      return res.status(422).json({ message: 'Cannot remove group creator' });
    }

    // Get the member being removed for system message
    const removedMember = group.members.find(m => m.userId.toString() === memberId);
    const removedUser = await User.findById(memberId);
    const currentUser = await User.findById(req.userId);

    group.members = group.members.filter(m => m.userId.toString() !== memberId);
    await group.save();
    await group.populate([
      { path: 'creatorId', select: '-password' },
      { path: 'members.userId', select: '-password' }
    ]);

    // Create system message for member removal
    const systemMessage = new Message({
      groupId: group._id,
      senderId: req.userId,
      content: `${currentUser.username} removed ${removedUser.username}`,
      isSystemMessage: true,
      systemMessageType: 'memberRemoved',
      status: 'sent'
    });
    await systemMessage.save();

    // Emit to group socket
    const io = req.app.get('io');
    if (io) {
      io.to(`group:${groupId}`).emit('systemMessage', {
        _id: systemMessage._id,
        groupId: group._id,
        senderId: req.userId,
        content: systemMessage.content,
        isSystemMessage: true,
        systemMessageType: 'memberRemoved',
        createdAt: systemMessage.createdAt,
        status: 'sent'
      });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};
};
