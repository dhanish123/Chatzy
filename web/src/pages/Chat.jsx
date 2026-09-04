import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useGroupStore } from '../stores/groupStore.js';
import { useFriendStore } from '../stores/friendStore.js';
import { conversationAPI, messageAPI, groupAPI } from '../services/api.js';
import { getSocket, joinConversation, leaveConversation } from '../services/socket.js';
import { Sidebar } from '../components/Sidebar.jsx';
import { ChatWindow } from '../components/ChatWindow.jsx';
import { Loader } from '../components/Loader.jsx';

export const Chat = () => {
  const { user } = useAuthStore();
  const { conversations, selectedConversation, setConversations, setSelectedConversation } = useChatStore();
  const { groups } = useGroupStore();
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      {selectedConversation || groups.length > 0 ? <ChatWindow /> : <div className="flex-1" />}
    </div>
  );
};
