import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { groupAPI, friendAPI } from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';

export const GroupMembersModal = ({ isOpen, group, currentUserId, isAdmin, onClose, onMembersUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, memberId: null, memberName: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, type: 'error', title: '', message: '' });

  const handleOpenAddMembers = async () => {
    try {
      setLoading(true);
      const response = await friendAPI.getFriends();
      // Filter out members already in group
      const existingMemberIds = group.members.map(m => m.userId._id);
      const filteredFriends = response.data.filter(f => !existingMemberIds.includes(f._id));
      setFriendsList(filteredFriends);
      setSelectedMembers([]);
      setShowAddMembers(true);
    } catch (error) {
      console.error('Error loading friends:', error);
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load friends list'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConfirmAddMembers = async () => {
    if (selectedMembers.length === 0) {
      setAlertDialog({
        isOpen: true,
        type: 'warning',
        title: 'Select Members',
        message: 'Please select at least one member'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await groupAPI.addMembers(group._id, { memberIds: selectedMembers });
      onMembersUpdate?.(response.data);
      setShowAddMembers(false);
      setSelectedMembers([]);
      setAlertDialog({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Added ${selectedMembers.length} member(s) to the group`
      });
    } catch (error) {
      console.error('Error adding members:', error);
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add members'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    try {
      setLoading(true);
      const response = await groupAPI.makeAdmin(group._id, memberId);
      onMembersUpdate?.(response.data);
    } catch (error) {
      console.error('Error making admin:', error);
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to make admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (memberId) => {
    try {
      setLoading(true);
      const response = await groupAPI.removeAdmin(group._id, memberId);
      onMembersUpdate?.(response.data);
    } catch (error) {
      console.error('Error removing admin:', error);
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to remove admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const memberName = group.members.find(m => m.userId._id === memberId)?.userId.username;
    setConfirmDialog({
      isOpen: true,
      action: 'removeMember',
      memberId,
      memberName
    });
  };

  const handleConfirmRemoveMember = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.removeMember(group._id, confirmDialog.memberId);
      onMembersUpdate?.(response.data);
      setConfirmDialog({ isOpen: false, action: null, memberId: null, memberName: null });
    } catch (error) {
      console.error('Error removing member:', error);
      setAlertDialog({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to remove member'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-96 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Members ({group?.members?.length || 0})
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {group?.members && group.members.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {group.members.map((member) => {
                  const isCreator = group.creatorId._id === member.userId._id;
                  const memberIsAdmin = member.isAdmin;

                  return (
                    <li key={member.userId._id} className="p-3 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar
                          src={member.userId.profileImage}
                          initials={member.userId.username?.[0]}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.userId.username}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {isCreator && (
                              <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                                CREATOR
                              </span>
                            )}
                            {memberIsAdmin && !isCreator && (
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && !isCreator && (
                        <div className="flex gap-1 ml-2">
                          {memberIsAdmin ? (
                            <button
                              onClick={() => handleRemoveAdmin(member.userId._id)}
                              disabled={loading}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                              title="Remove admin"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeAdmin(member.userId._id)}
                              disabled={loading}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                              title="Make admin"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveMember(member.userId._id)}
                            disabled={loading}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No members</div>
            )}
          </div>

          {/* Footer with Add Members Button */}
          {isAdmin && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleOpenAddMembers}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                Add Members
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add Friends to Group</h3>
              <button
                onClick={() => setShowAddMembers(false)}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto">
              {friendsList.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {friendsList.map((friend) => (
                    <li
                      key={friend._id}
                      onClick={() => handleMemberToggle(friend._id)}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend._id)}
                        onChange={() => handleMemberToggle(friend._id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Avatar
                        src={friend.profileImage}
                        initials={friend.username?.[0]}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{friend.username}</p>
                        <p className="text-xs text-gray-500">{friend.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No friends to add</p>
                  <p className="text-xs mt-2">All your friends are already in this group</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setShowAddMembers(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddMembers}
                disabled={loading || selectedMembers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                Add ({selectedMembers.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Member"
        message={`Remove ${confirmDialog.memberName} from group?`}
        onConfirm={handleConfirmRemoveMember}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null, memberId: null, memberName: null })}
        confirmText="Remove"
        isDangerous
        loading={loading}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        type={alertDialog.type}
        title={alertDialog.title}
        message={alertDialog.message}
        onClose={() => setAlertDialog({ isOpen: false, type: 'error', title: '', message: '' })}
      />
    </>
  );
};
