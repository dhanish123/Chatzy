import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { useFriendStore } from '../stores/friendStore.js';
import { conversationAPI, messageAPI, groupAPI } from '../services/api.js';
import { getSocket, joinConversation, leaveConversation, initializeSocket, joinUserRoom } from '../services/socket.js';
import { Sidebar } from '../components/Sidebar.jsx';
import { ChatWindow } from '../components/ChatWindow.jsx';
import { Loader } from '../components/Loader.jsx';

export const Chat = () => {
  const { user, token } = useAuthStore();
  const { conversations, selectedConversation, setConversations, setSelectedConversation } = useChatStore();
  const { groups, setGroups } = useGroupStore();
  const { friends } = useFriendStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
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
  }, [setConversations, setGroups]);

  // Initialize socket and listen for friend acceptance events
  useEffect(() => {
    if (!token || !user) return;

    const socket = initializeSocket(token);
    joinUserRoom(user._id);

    // Listen for friend request acceptance
    socket.on('friendRequestAccepted', async (data) => {
      try {
        // Refetch all conversations to get the latest populated data
        const convResponse = await conversationAPI.getAll();
        setConversations(convResponse.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    });

    return () => {
      socket.off('friendRequestAccepted');
    };
  }, [token, user, setConversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      {selectedConversation ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400">Go to "Add Friends" to start messaging!</p>
          </div>
        </div>
      )}
    </div>
  );
};
