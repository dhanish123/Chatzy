import { useState, useEffect } from 'react';
import { friendAPI, groupAPI } from '../services/api.js';
import { Modal } from './Modal.jsx';
import { Avatar } from './Avatar.jsx';

export const AddGroupMembersModal = ({ groupId, isOpen, onClose, onMembersAdded }) => {
  const [availableFriends, setAvailableFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadFriendAndGroupData();
    }
  }, [isOpen, groupId]);

  const loadFriendAndGroupData = async () => {
    try {
      const [friendsRes, groupRes] = await Promise.all([
        friendAPI.getFriends(),
        groupAPI.get(groupId)
      ]);

      setGroupMembers(groupRes.data.members.map(m => m.userId._id));
      
      // Filter friends who are not already in the group
      const nonMemberFriends = friendsRes.data.filter(
        friend => !groupRes.data.members.some(m => m.userId._id === friend._id)
      );
      
      setAvailableFriends(nonMemberFriends);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load friends');
    }
  };

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = async () => {
    try {
      setError('');

      if (selectedMembers.length === 0) {
        setError('Please select at least one member');
        return;
      }

      setLoading(true);

      await groupAPI.addMembers(groupId, {
        memberIds: selectedMembers
      });

      setSelectedMembers([]);
      onMembersAdded();
      onClose();
    } catch (err) {
      console.error('Error adding members:', err);
      setError(err.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Members"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Members List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select members to add
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="text-sm text-gray-500">
                All friends are already in this group
              </p>
            ) : (
              availableFriends.map(friend => (
                <label
                  key={friend._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(friend._id)}
                    onChange={() => handleMemberToggle(friend._id)}
                    disabled={loading}
                    className="rounded"
                  />
                  <Avatar
                    src={friend.profileImage}
                    initials={friend.username?.[0]}
                    size="sm"
                    className="ml-2"
                  />
                  <span className="ml-2 text-sm text-gray-900 flex-1">
                    {friend.username}
                  </span>
                  {selectedMembers.includes(friend._id) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedMembers.length} members
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedMembers.length === 0}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Members'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
