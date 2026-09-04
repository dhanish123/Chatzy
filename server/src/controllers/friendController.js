import { FriendRequest } from '../models/FriendRequest.js';
import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';

export const sendFriendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(422).json({ message: 'Receiver ID is required' });
    }

    if (receiverId === req.userId.toString()) {
      return res.status(422).json({ message: 'Cannot add yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { userId1: req.userId, userId2: receiverId },
        { userId1: receiverId, userId2: req.userId }
      ]
    });

    if (existingFriendship) {
      return res.status(409).json({ message: 'Already friends' });
    }

    const existingRequest = await FriendRequest.findOne({
      senderId: req.userId,
      receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'Request already sent' });
    }

    const friendRequest = new FriendRequest({
      senderId: req.userId,
      receiverId
    });

    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.receiverId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const friendship = new Friendship({
      userId1: friendRequest.senderId,
      userId2: friendRequest.receiverId
    });

    await friendship.save();
    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.receiverId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    next(error);
  }
};

export const cancelFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.senderId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await FriendRequest.deleteOne({ _id: requestId });
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      receiverId: req.userId,
      status: 'pending'
    }).populate('senderId', '-password').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getSentRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      senderId: req.userId,
      status: 'pending'
    }).populate('receiverId', '-password').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      $or: [
        { userId1: req.userId },
        { userId2: req.userId }
      ]
    }).populate([
      { path: 'userId1', select: '-password' },
      { path: 'userId2', select: '-password' }
    ]);

    const friends = friendships.map(f => {
      return f.userId1._id.toString() === req.userId.toString() ? f.userId2 : f.userId1;
    });

    res.json(friends);
  } catch (error) {
    next(error);
  }
};
