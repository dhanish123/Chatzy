import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useChatStore } from '../stores/chatStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { messageAPI, conversationAPI } from '../services/api.js';
import { getSocket, joinConversation, leaveConversation } from '../services/socket.js';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 12
  },
  messageBubble: {
    marginVertical: 4,
    maxWidth: '80%'
  },
  ownBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    marginLeft: '20%'
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    marginRight: '20%'
  },
  bubbleContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  ownText: {
    color: '#ffffff'
  },
  otherText: {
    color: '#000000'
  },
  messageTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    paddingHorizontal: 12
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    color: '#000000'
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export const ChatScreen = () => {
  const { user } = useAuthStore();
  const { selectedConversation, selectedGroup, messages, setMessages, addMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const socket = getSocket();

  const isGroup = !!selectedGroup;
  const conversationId = isGroup ? selectedGroup._id : selectedConversation?._id;
  const otherUser = !isGroup ? selectedConversation?.participants?.find(p => p.userId._id !== user?._id)?.userId : null;

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await messageAPI.getMessages(conversationId);
        setMessages(response.data);

        if (!isGroup) {
          await conversationAPI.markAsRead(conversationId);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    joinConversation(conversationId);

    if (socket) {
      const handleNewMessage = (msg) => {
        addMessage(msg);
      };

      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.off('newMessage', handleNewMessage);
        leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await messageAPI.send({
        conversationId,
        content: message
      });
      addMessage(response.data);
      setMessage('');

      if (socket) {
        socket.emit('messageDelivered', { messageId: response.data._id, conversationId });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId._id === user?._id;

    return (
      <View style={styles.messageBubble}>
        <View style={[styles.bubbleContent, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={isOwn ? styles.ownText : styles.otherText}>
            {item.isDeleted ? 'Message deleted' : item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, { textAlign: isOwn ? 'right' : 'left' }]}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isGroup ? selectedGroup?.name : otherUser?.username}
        </Text>
        {!isGroup && otherUser && (
          <Text style={styles.headerSubtitle}>
            {otherUser.isOnline ? 'Online' : `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString()}`}
          </Text>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        style={styles.messagesList}
        onEndReachedThreshold={0.1}
        scrollEventThrottle={400}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            placeholderTextColor="#d1d5db"
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>›</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
