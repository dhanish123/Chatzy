import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderLeftWidth: 3,
    borderLeftColor: '#6b7280',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8
  },
  ownReply: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6'
  },
  content: {
    flex: 1
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4
  },
  ownLabel: {
    color: '#3b82f6'
  },
  senderName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2
  },
  messageText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16
  },
  mediaIndicator: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  closeButton: {
    padding: 4,
    marginTop: -4
  }
});

export const ReplyQuotePreview = ({ message, onClose, isOwnReply = false }) => {
  if (!message) return null;

  const getMessagePreview = () => {
    if (message.mediaType === 'audio') {
      return '🎵 Audio message';
    }
    if (message.mediaType === 'image') {
      return '📷 Image' + (message.content ? `: ${message.content}` : '');
    }
    if (message.mediaType === 'video') {
      return '🎥 Video' + (message.content ? `: ${message.content}` : '');
    }
    if (message.mediaType === 'file') {
      return '📄 ' + (message.content || 'File');
    }
    return message.content || '(No content)';
  };

  return (
    <View style={[styles.container, isOwnReply && styles.ownReply]}>
      <View style={styles.content}>
        <Text style={[styles.label, isOwnReply && styles.ownLabel]}>Replying to</Text>
        {message.senderId?.username && (
          <Text style={styles.senderName}>
            @{message.senderId.username}
          </Text>
        )}
        <Text 
          style={message.mediaType ? styles.mediaIndicator : styles.messageText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {getMessagePreview()}
        </Text>
      </View>
      {onClose && (
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
        >
          <MaterialIcons name="close" size={16} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
};
