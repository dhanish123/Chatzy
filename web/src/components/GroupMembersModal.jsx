import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { groupAPI } from '../services/api';

export const GroupMembersModal = ({ isOpen, group, currentUserId, isAdmin, onClose, onMembersUpdate }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddMembers = () => {
    // Close modal and redirect to add friends page
    onClose?.();
    navigate('/add-friends');
  };

  const handleMakeAdmin = async (memberId) => {
    try {
      setLoading(true);
      const response = await groupAPI.makeAdmin(group._id, memberId);
      onMembersUpdate?.(response.data);
    } catch (error) {
      console.error('Error making admin:', error);
      alert(error.response?.data?.message || 'Failed to make admin');
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
      alert(error.response?.data?.message || 'Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from group?`)) return;

    try {
      setLoading(true);
      const response = await groupAPI.removeMember(group._id, memberId);
      onMembersUpdate?.(response.data);
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
                          onClick={() => handleRemoveMember(member.userId._id, member.userId.username)}
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
              onClick={handleAddMembers}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Add Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
