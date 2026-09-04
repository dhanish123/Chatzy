import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { userAPI } from '../services/api.js';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Loader } from '../components/Loader.jsx';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile({ username });
      setUser(response.data);
      setMessage('Profile updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await userAPI.uploadProfileImage(file);
      setUser(response.data);
      setMessage('Profile image updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {message && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{message}</div>
        )}

        <div className="flex justify-center mb-6">
          <label className="cursor-pointer">
            <Avatar src={user?.profileImage} initials={user?.username?.[0]} size="xl" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={user?.email}
            disabled
          />

          <Button
            onClick={handleUpdateProfile}
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
