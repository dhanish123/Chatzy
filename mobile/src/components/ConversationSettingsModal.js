import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { conversationAPI } from '../services/api.js';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  content: {
    flex: 1,
    paddingVertical: 12
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000'
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  toggleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  toggleInactive: {
    backgroundColor: '#ffffff'
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff'
  },
  toggleCircleActive: {
    alignSelf: 'flex-end'
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  dangerText: {
    color: '#dc2626'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000'
  },
  closeButton: {
    padding: 8
  }
});

export const ConversationSettingsModal = ({
  conversationId,
  conversation,
  onClose,
  onSettingChanged
}) => {
  const [loading, setLoading] = useState(false);

  if (!conversation) return null;

  const currentUser = conversation.participants.find(p => p.userId?._id);
  const isMuted = currentUser?.isMuted || false;
  const isPinned = currentUser?.isPinned || false;
  const isArchived = currentUser?.isArchived || false;

  const handleToggleMute = async () => {
    try {
      setLoading(true);
      await conversationAPI.mute(conversationId, !isMuted);
      if (onSettingChanged) {
        onSettingChanged('mute', !isMuted);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
      Alert.alert('Error', 'Failed to update mute setting');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      setLoading(true);
      await conversationAPI.pin(conversationId, !isPinned);
      if (onSettingChanged) {
        onSettingChanged('pin', !isPinned);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      Alert.alert('Error', 'Failed to update pin setting');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      await conversationAPI.archive(conversationId);
      Alert.alert('Success', 'Conversation archived');
      if (onSettingChanged) {
        onSettingChanged('archive', true);
      }
      onClose();
    } catch (error) {
      console.error('Error archiving:', error);
      Alert.alert('Error', 'Failed to archive conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMessages = async () => {
    Alert.alert(
      'Clear Messages',
      'This will delete all messages in this conversation for you. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              setLoading(true);
              await conversationAPI.clear(conversationId);
              Alert.alert('Success', 'Messages cleared');
              if (onSettingChanged) {
                onSettingChanged('clear', true);
              }
            } catch (error) {
              console.error('Error clearing messages:', error);
              Alert.alert('Error', 'Failed to clear messages');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleDeleteConversation = async () => {
    Alert.alert(
      'Delete Conversation',
      'This will permanently delete this conversation. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              await conversationAPI.delete(conversationId);
              Alert.alert('Success', 'Conversation deleted');
              if (onSettingChanged) {
                onSettingChanged('delete', true);
              }
              onClose();
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          disabled={loading}
        >
          <MaterialIcons name="close" size={24} color="#000000" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Pressable
            style={styles.settingItem}
            onPress={handleToggleMute}
            disabled={loading}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Mute Messages</Text>
              <Text style={styles.settingDescription}>
                {isMuted ? 'Muted' : 'You will receive notifications'}
              </Text>
            </View>
            <View style={[
              styles.toggle,
              isMuted ? styles.toggleActive : styles.toggleInactive
            ]}>
              <View style={[
                styles.toggleCircle,
                isMuted && styles.toggleCircleActive
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Organization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <Pressable
            style={styles.settingItem}
            onPress={handleTogglePin}
            disabled={loading}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Pin Conversation</Text>
              <Text style={styles.settingDescription}>
                {isPinned ? 'Pinned to top' : 'Unpin from top'}
              </Text>
            </View>
            <View style={[
              styles.toggle,
              isPinned ? styles.toggleActive : styles.toggleInactive
            ]}>
              <View style={[
                styles.toggleCircle,
                isPinned && styles.toggleCircleActive
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Pressable
            style={styles.settingItem}
            onPress={handleArchive}
            disabled={loading || isArchived}
          >
            <View style={styles.button}>
              <MaterialIcons name="archive" size={20} color="#6b7280" />
              <Text style={styles.buttonText}>
                {isArchived ? 'Archived' : 'Archive Conversation'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.settingItem}
            onPress={handleClearMessages}
            disabled={loading}
          >
            <View style={styles.button}>
              <MaterialIcons name="delete-outline" size={20} color="#f59e0b" />
              <Text style={[styles.buttonText, { color: '#f59e0b' }]}>Clear Messages</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.settingItem, styles.dangerButton]}
            onPress={handleDeleteConversation}
            disabled={loading}
          >
            <View style={styles.button}>
              <MaterialIcons name="delete" size={20} color="#dc2626" />
              <Text style={[styles.buttonText, styles.dangerText]}>Delete Conversation</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};
