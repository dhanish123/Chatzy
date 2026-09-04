import { useState, useEffect } from 'react';
import { blockAPI } from '../services/api.js';
import { useBlockStore } from '../stores/blockStore.js';
import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';

export const Blocked = () => {
  const { blockedUsers, setBlockedUsers, removeBlockedUser } = useBlockStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        const response = await blockAPI.getBlockedUsers();
        setBlockedUsers(response.data);
      } catch (error) {
        console.error('Error loading blocked users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlocked();
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await blockAPI.unblockUser(userId);
      removeBlockedUser(userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Blocked Users</h1>

          {loading ? (
            <p>Loading...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-gray-500">No blocked users</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.profileImage} initials={user.username[0]} />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUnblock(user._id)}
                    variant="secondary"
                    size="sm"
                  >
                    Unblock
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
