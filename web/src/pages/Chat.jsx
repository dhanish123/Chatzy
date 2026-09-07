import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { useFriendStore } from '../stores/friendStore.js';
import { conversationAPI, messageAPI, groupAPI } from '../services/api.js';
import { userStateAPI } from '../services/userStateAPI.js';
import { getSocket, joinConversation, leaveConversation, initializeSocket, joinUserRoom } from '../services/socket.js';
import { Sidebar } from '../components/Sidebar.jsx';
import { Loader } from '../components/Loader.jsx';

// Lazy load ChatWindow for faster initial render
const ChatWindow = lazy(() => import('../components/ChatWindow.jsx').then(m => ({ default: m.ChatWindow })));

export const Chat = () => {
  const { user, token } = useAuthStore();
  const { conversations, selectedConversation, setConversations, setSelectedConversation } = useChatStore();
  const { groups, selectedGroup, setGroups, setSelectedGroup } = useGroupStore();
  const { friends } = useFriendStore();
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load conversations and groups in parallel for speed
        const [convRes, groupRes] = await Promise.all([
          conversationAPI.getAll(),
          groupAPI.getAll()
        ]);
        
        setConversations(convRes.data);
        setGroups(groupRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize socket and listen for friend acceptance events
  useEffect(() => {
    if (!token || !user) return;

    const socket = initializeSocket(token);
    joinUserRoom(user._id);

    // Listen for friend request acceptance
    socket.on('friendRequestAccepted', async (data) => {
      try {
        // Refetch all conversations to get the latest populated data
        const convResponse = conversationAPI.getAll();
        setConversations(convResponse.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    });

    return () => {
      socket.off('friendRequestAccepted');
    };
  }, [token, user, setConversations]);

  // Handle conversation selection - show chat on mobile
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedGroup(null);
    setShowChat(true);
  };

  // Handle group selection - show chat on mobile
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedConversation(null);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-white">
        <div className="hidden md:flex md:w-80 bg-white border-r border-gray-200">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - hidden on mobile when chat is shown */}
      <div className={`${showChat ? 'hidden' : 'w-full'} md:flex md:w-80 bg-white border-r border-gray-200 flex-col h-full overflow-hidden`}>
        <Sidebar onSelectConversation={handleSelectConversation} onSelectGroup={handleSelectGroup} />
      </div>

      {/* Chat Window - full screen on mobile, flex-1 on desktop */}
      {selectedConversation || selectedGroup ? (
        <div className="w-full md:flex-1 flex flex-col h-full">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-gray-50"><Loader size="lg" /></div>}>
            <ChatWindow 
              onBackClick={() => {
                setShowChat(false);
                setSelectedConversation(null);
                setSelectedGroup(null);
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className="hidden md:flex md:flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400">Go to "Add Friends" to start messaging!</p>
          </div>
        </div>
      )}
    </div>
  );
};
