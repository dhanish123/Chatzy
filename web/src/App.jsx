import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { initializeSocket, disconnectSocket } from './services/socket.js';
import { Register } from './pages/Register.jsx';
import { Login } from './pages/Login.jsx';
import { Chat } from './pages/Chat.jsx';
import { Profile } from './pages/Profile.jsx';
import { AddFriends } from './pages/AddFriends.jsx';
import { Blocked } from './pages/Blocked.jsx';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

export const App = () => {
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      initializeSocket(token);
      return () => {
        // disconnectSocket();
      };
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-friends"
          element={
            <ProtectedRoute>
              <AddFriends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blocked"
          element={
            <ProtectedRoute>
              <Blocked />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
