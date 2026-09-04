import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { disconnectSocket } from '../services/socket.js';

export const UserMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    disconnectSocket();
    navigate('/login');
  };

  return (
    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <button
        onClick={() => {
          navigate('/profile');
          onClose();
        }}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Profile
      </button>
      <button
        onClick={() => {
          navigate('/add-friends');
          onClose();
        }}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Add Friends
      </button>
      <button
        onClick={() => {
          navigate('/blocked');
          onClose();
        }}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Blocked Users
      </button>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
      >
        Logout
      </button>
    </div>
  );
};
