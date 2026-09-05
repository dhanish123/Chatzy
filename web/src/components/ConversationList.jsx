import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { useFriendStore } from '../stores/friendStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { userStateAPI } from '../services/userStateAPI.js';
import { Avatar } from './Avatar.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LuMessageSquare } from 'react-icons/lu';

export const ConversationList = ({ searchQuery = '' }) => {
  const { conversations, setSelectedConversation, selectedConversation } = useChatStore();
  const { setSelectedGroup } = useGroupStore();
  const { user } = useAuthStore();

  // Auto-select first conversation on load if none selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const validConv = conversations.find(c => c?.participants && c.participants.length > 0);
      if (validConv) {
        setSelectedConversation(validConv);
      }
    }
  }, [conversations, selectedConversation, setSelectedConversation]);

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
              // Save selected conversation to MongoDB
              userStateAPI.setSelectedConversation(conv._id).catch(err => 
                console.error('Error saving selected conversation:', err)
              );
            }}
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
    </div>
  );
};
