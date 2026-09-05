import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { blockAPI, conversationAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';

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
  const socket = getSocket();

  const handleClearChat = async () => {
    Alert.alert(
      'Clear Chat',
      'Clear all messages in this chat?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            setLoading(true);
            try {
              await conversationAPI.clear(conversationId);
              onChatCleared?.();
              setIsOpen(false);
            } catch (error) {
              console.error('Error clearing chat:', error);
              Alert.alert('Error', 'Failed to clear chat');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleBlockUser = async () => {
    Alert.alert(
      'Block User',
      'Block this user? They will not be notified.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Block',
          onPress: async () => {
            setLoading(true);
            try {
              await blockAPI.blockUser(otherUserId);
              onUserBlocked?.(otherUserId);
              
              // Emit block event to socket
              if (socket) {
                socket.emit('blockUser', { blockedUserId: otherUserId });
              }
              
              setIsOpen(false);
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', 'Failed to block user');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
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
  );
};
