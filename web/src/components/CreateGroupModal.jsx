import { useState, useEffect } from 'react';
import { RiCloseLine, RiAddLine } from 'react-icons/ri';
import { useAuthStore } from '../stores/authStore.js';
import { friendAPI, groupAPI, uploadAPI } from '../services/api.js';
import { Modal } from './Modal.jsx';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';
import { Avatar } from './Avatar.jsx';

export const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const { user } = useAuthStore();
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      const response = await friendAPI.getFriends();
      setAvailableFriends(response.data);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Failed to load friends');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    try {
      setError('');
      
      if (!groupName.trim()) {
        setError('Group name is required');
        return;
      }

      if (selectedMembers.length < 2) {
        setError('Please select at least 2 members');
        return;
      }

      setLoading(true);

      let groupImageUrl = null;
      if (groupImage) {
        const uploadResponse = await uploadAPI.image(groupImage);
        groupImageUrl = uploadResponse.data.url;
      }

      const response = await groupAPI.create({
        name: groupName,
        image: groupImageUrl,
        memberIds: selectedMembers
      });

      // Reset form
      setGroupName('');
      setGroupImage(null);
      setImagePreview(null);
      setSelectedMembers([]);

      onGroupCreated(response.data);
      onClose();
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Group Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Group preview"
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">📷</span>
              </div>
            )}
            <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Group Name */}
        <Input
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          disabled={loading}
        />

        {/* Select Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Members (Minimum 2)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="text-sm text-gray-500">No friends available</p>
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
            onClick={handleCreateGroup}
            disabled={loading || selectedMembers.length < 2}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
