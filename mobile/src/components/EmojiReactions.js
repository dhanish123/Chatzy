import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { messageAPI } from '../services/api.js';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😢', '😡', '🔥', '👀', '🤔'];

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  reactionBubbleActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  emoji: {
    fontSize: 14
  },
  count: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151'
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 6
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  emojiButtonHover: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6'
  },
  addReactionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export const EmojiReactions = ({ 
  reactions = [], 
  messageId, 
  currentUserId, 
  onReactionAdded,
  onReactionRemoved,
  showPicker = false,
  onPickerToggle
}) => {
  const [isLoadingReaction, setIsLoadingReaction] = useState(false);

  // Group reactions by emoji and count users
  const groupedReactions = {};
  reactions.forEach(reaction => {
    if (!groupedReactions[reaction.emoji]) {
      groupedReactions[reaction.emoji] = [];
    }
    groupedReactions[reaction.emoji].push(reaction.userId._id || reaction.userId);
  });

  const handleReactionToggle = async (emoji) => {
    try {
      setIsLoadingReaction(true);
      const hasReacted = groupedReactions[emoji]?.includes(currentUserId);

      if (hasReacted) {
        await messageAPI.removeReaction(messageId, emoji);
        if (onReactionRemoved) {
          onReactionRemoved(emoji);
        }
      } else {
        await messageAPI.addReaction(messageId, emoji);
        if (onReactionAdded) {
          onReactionAdded(emoji);
        }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      Alert.alert('Error', 'Failed to add reaction');
    } finally {
      setIsLoadingReaction(false);
    }
  };

  return (
    <View>
      {reactions.length > 0 && (
        <View style={styles.container}>
          {Object.entries(groupedReactions).map(([emoji, userIds]) => (
            <Pressable
              key={emoji}
              style={[
                styles.reactionBubble,
                userIds.includes(currentUserId) && styles.reactionBubbleActive
              ]}
              onPress={() => handleReactionToggle(emoji)}
              disabled={isLoadingReaction}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.count}>{userIds.length}</Text>
            </Pressable>
          ))}

          {!showPicker && (
            <Pressable
              style={styles.reactionBubble}
              onPress={onPickerToggle}
              disabled={isLoadingReaction}
            >
              <MaterialIcons name="add" size={14} color="#6b7280" />
            </Pressable>
          )}
        </View>
      )}

      {showPicker && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.emojiPickerContainer}
        >
          {EMOJI_REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              style={[
                styles.emojiButton,
                groupedReactions[emoji]?.includes(currentUserId) && styles.emojiButtonHover
              ]}
              onPress={() => handleReactionToggle(emoji)}
              disabled={isLoadingReaction}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.emojiButton, { marginLeft: 4 }]}
            onPress={onPickerToggle}
          >
            <MaterialIcons name="close" size={18} color="#6b7280" />
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};
