import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { blockAPI, conversationAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { Modal } from './Modal.js';

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  menuButton: {
    padding: 8
  },
  menuOverlay: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 180,
    zIndex: 1000
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  menuItemLast: {
    borderBottomWidth: 0
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151'
  },
  menuItemDanger: {
    color: '#ef4444'
  }
});

export const ChatHeaderMenu = ({ conversationId, otherUserId, onChatCleared, onUserBlocked }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    isDangerous: false
  });
  const socket = getSocket();

  const handleClearChat = () => {
    setModalState({
      isOpen: true,
      title: 'Clear Chat',
      message: 'Clear all messages in this chat? This action cannot be undone.',
      action: 'clear',
      isDangerous: true
    });
  };

  const handleBlockUser = () => {
    setModalState({
      isOpen: true,
      title: 'Block User',
      message: 'Block this user? They will not be notified and cannot send you messages.',
      action: 'block',
      isDangerous: true
    });
  };

  const handleModalConfirm = async () => {
    setLoading(true);
    try {
      if (modalState.action === 'clear') {
        await conversationAPI.clear(conversationId);
        onChatCleared?.();
      } else if (modalState.action === 'block') {
        await blockAPI.blockUser(otherUserId);
        onUserBlocked?.(otherUserId);
        
        // Emit block event to socket
        if (socket) {
          socket.emit('blockUser', { blockedUserId: otherUserId });
        }
      }
      setModalState({ ...modalState, isOpen: false });
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.menuButton}
          onPress={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          <MaterialIcons name="more-vert" size={24} color="#6b7280" />
        </Pressable>

        {isOpen && (
          <View style={styles.menuOverlay}>
            <Pressable
              style={[styles.menuItem]}
              onPress={handleClearChat}
              disabled={loading}
            >
              <Text style={styles.menuItemText}>Clear Chat</Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleBlockUser}
              disabled={loading}
            >
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Block User</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
        confirmText={modalState.isDangerous ? 'Confirm' : 'OK'}
        cancelText="Cancel"
        isDangerous={modalState.isDangerous}
        loading={loading}
      />
    </>
  );
};
