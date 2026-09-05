import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '../components/Tab.jsx';
import { userAPI, friendAPI, conversationAPI } from '../services/api.js';
import { useFriendStore } from '../stores/friendStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export const AddFriends = () => {
  const [tab, setTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { pendingRequests, sentRequests, setPendingRequests, setSentRequests } = useFriendStore();
  const { conversations, setConversations } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const [pending, sent] = await Promise.all([
          friendAPI.getPendingRequests(),
          friendAPI.getSentRequests()
        ]);
        setPendingRequests(pending.data);
        setSentRequests(sent.data);
      } catch (error) {
        console.error('Error loading requests:', error);
      }
    };
    loadRequests();
  }, []);

  // Real-time search as user types
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await userAPI.searchUsers(searchQuery);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    // Debounce search to avoid too many API calls
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId);
      setSearchResults(searchResults.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await friendAPI.cancelRequest(requestId);
      setSentRequests(sentRequests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const handleAcceptRequest = async (requestId, senderId) => {
    try {
      await friendAPI.acceptRequest(requestId);
      
      // Create/Get a conversation with the accepted user
      const convResponse = await conversationAPI.getOrCreate(senderId);
      
      // Add to conversations if not already there
      if (!conversations.some(c => c._id === convResponse.data._id)) {
        setConversations([...conversations, convResponse.data]);
      }
      
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
      
      // Navigate to chat page to show the new conversation
      navigate('/chat');
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendAPI.rejectRequest(requestId);
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Add Friends</h1>

          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setTab('search')}
              className={`pb-2 ${tab === 'search' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Search Users
            </button>
            <button
              onClick={() => setTab('pending')}
              className={`pb-2 ${tab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`pb-2 ${tab === 'sent' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>

          {tab === 'search' && (
            <div>
              <div className="mb-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profileImage} initials={user.username[0]} />
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSendRequest(user._id)}
                      variant="primary"
                      size="sm"
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'pending' && (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.senderId.profileImage} initials={req.senderId.username[0]} />
                    <p className="font-medium">{req.senderId.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptRequest(req._id, req.senderId._id)}
                      variant="primary"
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(req._id)}
                      variant="secondary"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'sent' && (
            <div className="space-y-3">
              {sentRequests.map(req => (
                <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.receiverId.profileImage} initials={req.receiverId.username[0]} />
                    <p className="font-medium">{req.receiverId.username}</p>
                  </div>
                  <Button
                    onClick={() => handleCancelRequest(req._id)}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
