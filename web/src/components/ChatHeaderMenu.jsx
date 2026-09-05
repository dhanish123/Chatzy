import { useState, useRef, useEffect } from 'react';
import { RiMoreFill } from 'react-icons/ri';
import { blockAPI, conversationAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { Modal } from './Modal.jsx';

export const ChatHeaderMenu = ({ conversationId, otherUserId, onChatCleared, onUserBlocked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    isDangerous: false
  });
  const menuRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleClearChat = () => {
    setModalState({
      isOpen: true,
      title: 'Clear Chat',
      message: 'Clear all messages in this chat? This action cannot be undone.',
      action: 'clear',
      isDangerous: true
    });
  };

  const handleBlockUser = () => {
    setModalState({
      isOpen: true,
      title: 'Block User',
      message: 'Block this user? They will not be notified and cannot send you messages.',
      action: 'block',
      isDangerous: true
    });
  };

  const handleModalConfirm = async () => {
    setLoading(true);
    try {
      if (modalState.action === 'clear') {
        await conversationAPI.clear(conversationId);
        onChatCleared?.();
      } else if (modalState.action === 'block') {
        await blockAPI.blockUser(otherUserId);
        onUserBlocked?.(otherUserId);
        
        // Emit block event to socket
        if (socket) {
          socket.emit('blockUser', { blockedUserId: otherUserId });
        }
      }
      setModalState({ ...modalState, isOpen: false });
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <RiMoreFill size={20} className="text-gray-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <button
              onClick={handleClearChat}
              disabled={loading}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 disabled:opacity-50"
            >
              Clear Chat
            </button>
            <button
              onClick={handleBlockUser}
              disabled={loading}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50"
            >
              Block User
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
        confirmText={modalState.isDangerous ? 'Confirm' : 'OK'}
        cancelText="Cancel"
        isDangerous={modalState.isDangerous}
        loading={loading}
      />
    </>
  );
};
