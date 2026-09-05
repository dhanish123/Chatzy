import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { conversationAPI, messageAPI, blockAPI, groupAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { MessageBubble } from './MessageBubble.jsx';
import { MessageInput } from './MessageInput.jsx';
import { ChatHeaderMenu } from './ChatHeaderMenu.jsx';
import { GroupHeaderMenu } from './GroupHeaderMenu.jsx';
import { GroupMembersModal } from './GroupMembersModal.jsx';
import { SystemMessage } from './SystemMessage.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { Loader } from './Loader.jsx';
import { Avatar } from './Avatar.jsx';

export const ChatWindow = () => {
  const { user } = useAuthStore();
  const { selectedConversation, messages, setMessages, addMessage, updateMessage } = useChatStore();
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const [loading, setLoading] = useState(true);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ blocked: false, blockedBy: false });
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const typingTimeoutRef = useRef(null);
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

  // Update timestamp when other user's profile image changes
  useEffect(() => {
    // Not needed anymore since Avatar component handles URL construction
    // Removed: setImageTimestamp(Date.now());
  }, [otherUser?.profileImage]);

  useEffect(() => {
    if (!conversationId) return;

    // Clear messages when switching conversations
    setMessages([]);

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await messageAPI.getMessages(conversationId);
        setMessages(response.data);
        
        if (!isGroup && selectedConversation) {
          await conversationAPI.markAsRead(conversationId);
        }

        // Mark all received messages as read
        if (response.data && response.data.length > 0) {
          response.data.forEach((msg) => {
            if (!msg.isSystemMessage && msg.senderId._id !== user?._id) {
              if (socket) {
                socket.emit(isGroup ? 'groupMessageRead' : 'messageRead', {
                  messageId: msg._id,
                  conversationId,
                  groupId: isGroup ? conversationId : undefined
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
        // Scroll to bottom after loading
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    };

    loadMessages();

    if (socket) {
      if (isGroup) {
        socket.emit('joinGroup', conversationId);
        
        const handleGroupNewMessage = (message) => {
          addMessage(message);
          // Mark as read immediately if not own message
          if (message.senderId._id !== user?._id && !message.isSystemMessage) {
            socket.emit('groupMessageRead', {
              messageId: message._id,
              groupId: conversationId
            });
          }
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        const handleMessageStatusUpdated = (data) => {
          updateMessage(data.messageId, { status: data.status });
        };

        const handleGroupTyping = () => {
          setIsOtherUserTyping(true);
        };

        const handleGroupStopTyping = () => {
          setIsOtherUserTyping(false);
        };

        const handleGroupMemberAdded = async (data) => {
          // Refresh group to get updated members list
          try {
            const updatedGroup = await groupAPI.get(conversationId);
            setSelectedGroup(updatedGroup.data);
          } catch (error) {
            console.error('Error refreshing group members:', error);
          }
        };

        const handleSystemMessage = (message) => {
          // Add system message to chat
          addMessage(message);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        socket.on('groupNewMessage', handleGroupNewMessage);
        socket.on('groupMessageRead', handleMessageStatusUpdated);
        socket.on('messageStatusUpdated', handleMessageStatusUpdated);
        socket.on('userTypingGroup', handleGroupTyping);
        socket.on('userStoppedTypingGroup', handleGroupStopTyping);
        socket.on('groupMemberAdded', handleGroupMemberAdded);
        socket.on('systemMessage', handleSystemMessage);
        
        return () => {
          socket.off('groupNewMessage', handleGroupNewMessage);
          socket.off('groupMessageRead', handleMessageStatusUpdated);
          socket.off('messageStatusUpdated', handleMessageStatusUpdated);
          socket.off('userTypingGroup', handleGroupTyping);
          socket.off('userStoppedTypingGroup', handleGroupStopTyping);
          socket.off('groupMemberAdded', handleGroupMemberAdded);
          socket.off('systemMessage', handleSystemMessage);
          socket.emit('leaveGroup', conversationId);
        };
      } else {
        socket.emit('joinConversation', conversationId);
        
        const handleNewMessage = (message) => {
          addMessage(message);
          // Mark as read immediately if not own message
          if (message.senderId._id !== user?._id && !message.isSystemMessage) {
            socket.emit('messageRead', {
              messageId: message._id,
              conversationId
            });
          }
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        const handleMessageStatusUpdated = (data) => {
          updateMessage(data.messageId, { status: data.status });
        };

        const handleUserTyping = () => {
          setIsOtherUserTyping(true);
        };

        const handleUserStopTyping = () => {
          setIsOtherUserTyping(false);
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageStatusUpdated', handleMessageStatusUpdated);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStoppedTyping', handleUserStopTyping);
        
        return () => {
          socket.off('newMessage', handleNewMessage);
          socket.off('messageStatusUpdated', handleMessageStatusUpdated);
          socket.off('userTyping', handleUserTyping);
          socket.off('userStoppedTyping', handleUserStopTyping);
          socket.emit('leaveConversation', conversationId);
        };
      }
    }
  }, [conversationId, isGroup, selectedConversation, socket, addMessage, updateMessage, user]);

  useEffect(() => {
    // Scroll to bottom when messages load or change
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 150);
    }
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
        replyTo,
        groupId: isGroup ? conversationId : undefined
      });
      addMessage(response.data);

      if (socket) {
        if (isGroup) {
          socket.emit('groupMessageDelivered', { messageId: response.data._id, groupId: conversationId });
        } else {
          socket.emit('messageDelivered', { messageId: response.data._id, conversationId });
        }
        // Stop typing when message is sent
        socket.emit(isGroup ? 'groupStopTyping' : 'stopTyping', { conversationId });
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit(isGroup ? 'groupTyping' : 'typing', { conversationId });
    }
  };

  const handleStopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit(isGroup ? 'groupStopTyping' : 'stopTyping', { conversationId });
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

  // Determine if current user is admin for groups
  const isGroupAdmin = isGroup && (selectedGroup?.creatorId?._id === user?._id || 
    selectedGroup?.members?.some(m => m.userId._id === user?._id && m.isAdmin));

  return (
    <div className="flex-1 flex h-screen bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {isGroup ? (
            <>
              <Avatar 
                src={selectedGroup?.image} 
                initials={selectedGroup?.name?.[0]} 
                size="md" 
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {selectedGroup?.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedGroup?.members?.length} members
                </p>
              </div>
            </>
          ) : (
            <>
              {otherUser && (
                <Avatar 
                  src={otherUser.profileImage || ''} 
                  initials={otherUser.username?.[0]} 
                  size="md" 
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {otherUser?.username}
                </h2>
                {otherUser && (
                  <p className="text-xs text-gray-500">
                    {otherUser.isOnline ? 'Online' : `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString()}`}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isGroup && (
            <button
              onClick={() => setShowMembersModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
              title="View members"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 8H5m14 0h-4m0-4H9m8 0h4" />
              </svg>
            </button>
          )}
          {isGroup ? (
            <GroupHeaderMenu
              groupId={conversationId}
              onChatCleared={() => setMessages([])}
              onUserLeft={() => {
                // Handle user leaving group - navigate back or remove from list
              }}
            />
          ) : otherUser ? (
            <ChatHeaderMenu
              conversationId={conversationId}
              otherUserId={otherUser._id}
              onChatCleared={() => setMessages([])}
              onUserBlocked={() => setBlockStatus({ ...blockStatus, blocked: true })}
            />
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation
          </div>
        ) : (
          messages.map((msg) => 
            msg.isSystemMessage ? (
              <SystemMessage key={msg._id} message={msg} />
            ) : (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.senderId._id?.toString() === user?._id?.toString()}
                isGroup={isGroup}
                onReply={(message) => {
                  setReplyingTo(message);
                }}
                onEdit={(message) => {
                  setEditingMessage(message);
                }}
                onDelete={handleDeleteMessage}
                onHover={setHoveredMessage}
              />
            )
          )
        )}
        {isOtherUserTyping && (
          <div className="flex items-start mb-3">
            <TypingIndicator />
          </div>
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
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      )}
      </div>

      {/* Members Modal for Groups */}
      {isGroup && selectedGroup && (
        <GroupMembersModal
          isOpen={showMembersModal}
          group={selectedGroup}
          currentUserId={user?._id}
          isAdmin={isGroupAdmin}
          onClose={() => setShowMembersModal(false)}
          onMembersUpdate={(updatedGroup) => {
            // Update the selected group in store
            setSelectedGroup(updatedGroup);
          }}
        />
      )}
    </div>
  );
};
