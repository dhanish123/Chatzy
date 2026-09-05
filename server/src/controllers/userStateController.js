import { UserState } from '../models/UserState.js';
import { User } from '../models/User.js';

// Get user state (selectedConversation, selectedGroup)
export const getUserState = async (req, res) => {
  try {
    const userId = req.userId;

    let userState = await UserState.findOne({ userId })
      .populate('selectedConversationId')
      .populate('selectedGroupId');

    if (!userState) {
      // Create new user state if doesn't exist
      userState = new UserState({ userId });
      await userState.save();
    }

    res.json({
      selectedConversationId: userState.selectedConversationId,
      selectedGroupId: userState.selectedGroupId
    });
  } catch (error) {
    console.error('Error getting user state:', error);
    res.status(500).json({ message: 'Error getting user state' });
  }
};

// Save selected conversation
export const setSelectedConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.body;

    let userState = await UserState.findOne({ userId });

    if (!userState) {
      userState = new UserState({ userId });
    }

    userState.selectedConversationId = conversationId || null;
    userState.selectedGroupId = null; // Clear selected group
    userState.updatedAt = new Date();
    await userState.save();

    await userState.populate('selectedConversationId');

    res.json({ selectedConversationId: userState.selectedConversationId });
  } catch (error) {
    console.error('Error setting selected conversation:', error);
    res.status(500).json({ message: 'Error setting selected conversation' });
  }
};

// Save selected group
export const setSelectedGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.body;

    let userState = await UserState.findOne({ userId });

    if (!userState) {
      userState = new UserState({ userId });
    }

    userState.selectedGroupId = groupId || null;
    userState.selectedConversationId = null; // Clear selected conversation
    userState.updatedAt = new Date();
    await userState.save();

    await userState.populate('selectedGroupId');

    res.json({ selectedGroupId: userState.selectedGroupId });
  } catch (error) {
    console.error('Error setting selected group:', error);
    res.status(500).json({ message: 'Error setting selected group' });
  }
};

// Clear user state
export const clearUserState = async (req, res) => {
  try {
    const userId = req.userId;

    let userState = await UserState.findOne({ userId });

    if (!userState) {
      userState = new UserState({ userId });
    }

    userState.selectedConversationId = null;
    userState.selectedGroupId = null;
    userState.updatedAt = new Date();
    await userState.save();

    res.json({ message: 'User state cleared' });
  } catch (error) {
    console.error('Error clearing user state:', error);
    res.status(500).json({ message: 'Error clearing user state' });
  }
};
