import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    borderRadius: 4
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  threadIcon: {
    fontSize: 12
  },
  senderName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6'
  },
  timestamp: {
    fontSize: 9,
    color: '#9ca3af'
  },
  messagePreview: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 14
  },
  mediaPreview: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  replyCount: {
    fontSize: 9,
    color: '#6b7280'
  }
});

export const ReplyThread = ({ message, onPress, replyCount = 0 }) => {
  if (!message) return null;

  const getPreview = () => {
    if (message.mediaType === 'audio') return '🎵 Audio message';
    if (message.mediaType === 'image') return '📷 Image';
    if (message.mediaType === 'video') return '🎥 Video';
    if (message.mediaType === 'file') return '📄 File';
    return message.content?.substring(0, 50) || '(No content)';
  };

  const isMedia = ['audio', 'image', 'video', 'file'].includes(message.mediaType);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadIcon}>↳</Text>
          <Text style={styles.senderName}>
            {message.senderId?.username || 'Unknown'}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text 
          style={isMedia ? styles.mediaPreview : styles.messagePreview}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getPreview()}
        </Text>
        {replyCount > 0 && (
          <View style={styles.footer}>
            <MaterialIcons name="reply" size={10} color="#9ca3af" />
            <Text style={styles.replyCount}>
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};
