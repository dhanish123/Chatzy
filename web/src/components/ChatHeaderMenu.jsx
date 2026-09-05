import { useState, useRef, useEffect } from 'react';
import { RiMoreFill } from 'react-icons/ri';
import { blockAPI, conversationAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';

export const ChatHeaderMenu = ({ conversationId, otherUserId, onChatCleared, onUserBlocked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleClearChat = async () => {
    if (!window.confirm('Clear all messages in this chat?')) return;

    setLoading(true);
    try {
      await conversationAPI.clear(conversationId);
      onChatCleared?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm('Block this user? They will not be notified.')) return;

    setLoading(true);
    try {
      await blockAPI.blockUser(otherUserId);
      onUserBlocked?.(otherUserId);
      
      // Emit block event to socket
      if (socket) {
        socket.emit('blockUser', { blockedUserId: otherUserId });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};
