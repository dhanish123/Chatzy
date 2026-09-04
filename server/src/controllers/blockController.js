import { Block } from '../models/Block.js';
import { User } from '../models/User.js';

export const blockUser = async (req, res, next) => {
  try {
    const { blockedId } = req.body;

    if (!blockedId) {
      return res.status(422).json({ message: 'User ID is required' });
    }

    if (blockedId === req.userId.toString()) {
      return res.status(422).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(blockedId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingBlock = await Block.findOne({
      blockerId: req.userId,
      blockedId
    });

    if (existingBlock) {
      return res.status(409).json({ message: 'Already blocked' });
    }

    const block = new Block({
      blockerId: req.userId,
      blockedId
    });

    await block.save();
    res.status(201).json(block);
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const { blockedId } = req.params;

    const block = await Block.findOne({
      blockerId: req.userId,
      blockedId
    });

    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }

    await Block.deleteOne({ _id: block._id });
    res.json({ message: 'User unblocked' });
  } catch (error) {
    next(error);
  }
};

export const getBlockedUsers = async (req, res, next) => {
  try {
    const blocks = await Block.find({
      blockerId: req.userId
    }).populate('blockedId', '-password');

    const blockedUsers = blocks.map(b => b.blockedId);
    res.json(blockedUsers);
  } catch (error) {
    next(error);
  }
};

export const isUserBlocked = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const block = await Block.findOne({
      blockerId: req.userId,
      blockedId: userId
    });

    res.json({ isBlocked: !!block });
  } catch (error) {
    next(error);
  }
};
