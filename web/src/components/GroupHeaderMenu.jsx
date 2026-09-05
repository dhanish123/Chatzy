import { useState } from 'react';
import { RiMoreLine } from 'react-icons/ri';
import { groupAPI } from '../services/api.js';
import { Modal } from './Modal.jsx';
import { AddGroupMembersModal } from './AddGroupMembersModal.jsx';

export const GroupHeaderMenu = ({
  groupId,
  onChatCleared,
  onUserLeft
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClearChat = async () => {
    try {
      setLoading(true);
      await groupAPI.clear(groupId);
      onChatCleared();
      setIsMenuOpen(false);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitGroup = async () => {
    try {
      setLoading(true);
      await groupAPI.leave(groupId);
      onUserLeft();
      setIsMenuOpen(false);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = () => {
    setShowAddMembers(true);
    setIsMenuOpen(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === 'clear') {
      await handleClearChat();
    } else if (confirmAction === 'exit') {
      await handleExitGroup();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <RiMoreLine size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
            <button
              onClick={handleAddMembers}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2"
            >
              ➕ Add Members
            </button>
            <button
              onClick={() => {
                setConfirmAction('clear');
                setShowConfirm(true);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 font-medium flex items-center gap-2 border-t"
            >
              🗑️ Clear Chat
            </button>
            <button
              onClick={() => {
                setConfirmAction('exit');
                setShowConfirm(true);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 border-t"
            >
              🚪 Exit Group
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmAction(null);
        }}
        title={confirmAction === 'clear' ? 'Clear Chat' : 'Exit Group'}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {confirmAction === 'clear'
              ? 'Are you sure you want to clear all messages in this group? This action cannot be undone.'
              : 'Are you sure you want to leave this group? You will no longer receive messages from this group.'}
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmAction(null);
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={loading}
              className={`px-4 py-2 text-white rounded font-medium disabled:opacity-50 ${
                confirmAction === 'exit'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : confirmAction === 'clear' ? 'Clear' : 'Exit'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Members Modal */}
      {showAddMembers && (
        <AddGroupMembersModal
          groupId={groupId}
          isOpen={showAddMembers}
          onClose={() => setShowAddMembers(false)}
          onMembersAdded={() => {
            setShowAddMembers(false);
          }}
        />
      )}
    </>
  );
};
