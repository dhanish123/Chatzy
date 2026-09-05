import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { conversationAPI, messageAPI, blockAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { MessageBubble } from './MessageBubble.jsx';
import { MessageInput } from './MessageInput.jsx';
import { ChatHeaderMenu } from './ChatHeaderMenu.jsx';
import { Loader } from './Loader.jsx';

export const ChatWindow = () => {
  const { user } = useAuthStore();
  const { selectedConversation, messages, setMessages, addMessage, updateMessage } = useChatStore();
  const { selectedGroup } = useGroupStore();
  const [loading, setLoading] = useState(true);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ blocked: false, blockedBy: false });
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  const isGroup = !!selectedGroup;
  const conversationId = isGroup ? selectedGroup._id : selectedConversation?._id;
  
  // Safety check - if no conversation/group selected, return empty state
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  const otherUser = !isGroup ? selectedConversation?.participants?.find(p => p.userId._id !== user?._id)?.userId : null;

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await messageAPI.getMessages(conversationId);
        setMessages(response.data);
        
        // Scroll to last message after loading
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
        
        if (!isGroup && selectedConversation) {
          await conversationAPI.markAsRead(conversationId);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    if (socket) {
      socket.emit('joinConversation', conversationId);
      
      const handleNewMessage = (message) => {
        addMessage(message);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.emit('leaveConversation', conversationId);
      };
    }
  }, [conversationId, isGroup, selectedConversation, socket, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversationId || isGroup || !otherUser) return;

    const checkBlockStatus = async () => {
      try {
        const response = await blockAPI.isUserBlocked(otherUser._id);
        setBlockStatus(response.data);
      } catch (error) {
        console.error('Error checking block status:', error);
      }
    };

    checkBlockStatus();

    // Listen for block/unblock events from socket
    if (socket) {
      const handleUserBlocked = (data) => {
        if (data.blockedUserId === otherUser._id) {
          setBlockStatus({ blocked: true, blockedBy: false });
        }
      };

      const handleUserUnblocked = (data) => {
        if (data.unblockedUserId === otherUser._id) {
          setBlockStatus({ blocked: false, blockedBy: false });
        }
      };

      socket.on('userBlocked', handleUserBlocked);
      socket.on('userUnblocked', handleUserUnblocked);

      return () => {
        socket.off('userBlocked', handleUserBlocked);
        socket.off('userUnblocked', handleUserUnblocked);
      };
    }
  }, [otherUser?._id, conversationId, isGroup, socket]);

  const handleSendMessage = async (content, mediaUrl, mediaType, replyTo) => {
    if (!content && !mediaUrl) return;

    try {
      const response = await messageAPI.send({
        conversationId,
        content,
        mediaUrl,
        mediaType,
        replyTo
      });
      addMessage(response.data);

      if (socket) {
        socket.emit('messageDelivered', { messageId: response.data._id, conversationId });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const response = await messageAPI.edit(messageId, content);
      updateMessage(messageId, { content: response.data.content, isEdited: true });
      setEditingMessage(null);

      if (socket) {
        socket.emit('messageUpdated', { messageId, content: response.data.content, isEdited: true });
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await messageAPI.delete(messageId);
      updateMessage(messageId, response.data);

      if (socket) {
        socket.emit('messageDeleted', { messageId });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {isGroup ? selectedGroup?.name : otherUser?.username}
          </h2>
          {!isGroup && otherUser && (
            <p className="text-xs text-gray-500">
              {otherUser.isOnline ? 'Online' : `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString()}`}
            </p>
          )}
        </div>
        {!isGroup && otherUser && (
          <ChatHeaderMenu
            conversationId={conversationId}
            otherUserId={otherUser._id}
            onChatCleared={() => setMessages([])}
            onUserBlocked={() => setBlockStatus({ ...blockStatus, blocked: true })}
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId._id === user?._id}
              onReply={(message) => {
                setReplyingTo(message);
              }}
              onEdit={(message) => {
                setEditingMessage(message);
              }}
              onDelete={handleDeleteMessage}
              onHover={setHoveredMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {blockStatus.blocked ? (
        <div className="bg-red-50 border-t border-red-200 p-4 flex items-center justify-between">
          <p className="text-red-700">You blocked {otherUser?.username}</p>
          <button
            onClick={async () => {
              try {
                await blockAPI.unblockUser(otherUser._id);
                setBlockStatus({ ...blockStatus, blocked: false });
                
                // Emit unblock event to socket
                if (socket) {
                  socket.emit('unblockUser', { unblockedUserId: otherUser._id });
                }
              } catch (error) {
                console.error('Error unblocking user:', error);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Unblock
          </button>
        </div>
      ) : (
        <MessageInput 
          onSend={handleSendMessage}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
          onEditSave={(content) => {
            handleEditMessage(editingMessage._id, content);
          }}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSetReply={setReplyingTo}
          isBlocked={blockStatus.blockedBy}
        />
      )}
    </div>
  );
};
