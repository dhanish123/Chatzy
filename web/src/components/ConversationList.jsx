import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { useFriendStore } from '../stores/friendStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { userStateAPI } from '../services/userStateAPI.js';
import { conversationAPI } from '../services/api.js';
import { Avatar } from './Avatar.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LuMessageSquare } from 'react-icons/lu';

export const ConversationList = ({ searchQuery = '' }) => {
  const { conversations, setSelectedConversation, selectedConversation, setConversations } = useChatStore();
  const { setSelectedGroup } = useGroupStore();
  const { user } = useAuthStore();
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Auto-select first conversation on load if none selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const validConv = conversations.find(c => c?.participants && c.participants.length > 0);
      if (validConv) {
        setSelectedConversation(validConv);
        // Save auto-selected conversation to MongoDB (fire and forget)
        userStateAPI.setSelectedConversation(validConv._id);
      }
    }
  }, [conversations.length, selectedConversation]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  const handleContextMenu = (e, convId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      convId
    });
  };

  const handleDeleteConversation = async () => {
    if (!contextMenu?.convId) return;
    
    try {
      await conversationAPI.delete(contextMenu.convId);
      // Remove from store
      const updatedConversations = conversations.filter(c => c._id !== contextMenu.convId);
      setConversations(updatedConversations);
      
      // Clear selection if deleted conversation was selected
      if (selectedConversation?._id === contextMenu.convId) {
        setSelectedConversation(null);
        setSelectedGroup(null);
      }
      
      setContextMenu(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  if (conversations.length === 0) {
    return <EmptyState title="No conversations" description="Start a conversation with a friend" icon={LuMessageSquare} />;
  }

  return (
    <div>
      {conversations.map((conv) => {
        // Safety check: ensure participants exist
        if (!conv?.participants || conv.participants.length === 0) {
          return null;
        }

        const userId = user?._id?.toString();
        const otherUser = conv.participants.find(p => p?.userId?._id?.toString() !== userId);
        
        if (!otherUser?.userId) return null;

        return (
          <div
            key={conv._id}
            onClick={() => {
              setSelectedConversation(conv);
              setSelectedGroup(null); // Clear group when selecting private chat
              // Save selected conversation to MongoDB (fire and forget)
              userStateAPI.setSelectedConversation(conv._id);
            }}
            onContextMenu={(e) => handleContextMenu(e, conv._id)}
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar src={otherUser.userId.profileImage} initials={otherUser.userId.username?.[0] || 'U'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{otherUser.userId.username}</p>
                <p className="text-sm text-gray-500 truncate">
                  {conv.lastMessage?.mediaType === 'audio' 
                    ? '🎙️ Audio message'
                    : conv.lastMessage?.mediaType === 'image'
                    ? '📷 Image'
                    : conv.lastMessage?.mediaType === 'video'
                    ? '🎥 Video'
                    : conv.lastMessage?.mediaType === 'file'
                    ? '📄 File'
                    : conv.lastMessage?.mediaType === 'application/pdf'
                    ? '📕 PDF'
                    : conv.lastMessage?.content || 'No messages'}
                </p>
              </div>
            </div>
            {otherUser.unreadCount > 0 && selectedConversation?._id !== conv._id && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {otherUser.unreadCount}
              </span>
            )}
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-300 rounded shadow-lg py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={handleDeleteConversation}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
          >
            Delete Chat
          </button>
        </div>
      )}
    </div>
  );
};
