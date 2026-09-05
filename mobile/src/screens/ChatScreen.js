import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useChatStore } from '../stores/chatStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { messageAPI, conversationAPI, uploadAPI } from '../services/api.js';
import { getSocket, joinConversation, leaveConversation } from '../services/socket.js';
import { VoiceRecorder } from '../components/VoiceRecorder.js';
import { EmojiPickerModal } from '../components/EmojiPickerModal.js';
import { MediaSelector } from '../components/MediaSelector.js';
import { MaterialIcons } from '@expo/vector-icons';

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
    gap: 8,
    backgroundColor: '#ffffff'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4
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
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8
  }
});

export const ChatScreen = () => {
  const { user } = useAuthStore();
  const { selectedConversation, selectedGroup, messages, setMessages, addMessage, updateMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
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
    if (editingMessage) {
      try {
        const response = await messageAPI.edit(editingMessage._id, message);
        updateMessage(editingMessage._id, { content: response.data.content, isEdited: true });
        setEditingMessage(null);
        setMessage('');

        if (socket) {
          socket.emit('messageUpdated', { messageId: editingMessage._id, content: response.data.content });
        }
      } catch (error) {
        console.error('Error editing message:', error);
      }
    } else if (!message.trim()) {
      return;
    } else {
      try {
        const response = await messageAPI.send({
          conversationId,
          content: message,
          replyTo: replyingTo?._id
        });
        addMessage(response.data);
        setMessage('');
        setReplyingTo(null);

        if (socket) {
          socket.emit('messageDelivered', { messageId: response.data._id, conversationId });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setMessage(msg.content);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await messageAPI.delete(messageId);
      updateMessage(messageId, response.data);

      if (socket) {
        socket.emit('messageDeleted', { messageId });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleVoiceRecordSend = async (audioUri) => {
    setIsUploading(true);
    try {
      const response = await uploadAPI.audio(audioUri);
      const msgResponse = await messageAPI.send({
        conversationId,
        content: '',
        mediaUrl: response.data.url,
        mediaType: 'audio',
        replyTo: replyingTo?._id
      });
      addMessage(msgResponse.data);
      setReplyingTo(null);

      if (socket) {
        socket.emit('messageDelivered', { messageId: msgResponse.data._id, conversationId });
      }
    } catch (error) {
      console.error('Error uploading voice:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSelect = async (media) => {
    setIsUploading(true);
    try {
      let response;
      if (media.type === 'image') {
        response = await uploadAPI.image(media.uri);
      } else if (media.type === 'video') {
        response = await uploadAPI.video(media.uri);
      } else if (media.type === 'file') {
        response = await uploadAPI.file(media.uri);
      }

      const msgResponse = await messageAPI.send({
        conversationId,
        content: '',
        mediaUrl: response.data.url,
        mediaType: media.type === 'file' ? 'file' : media.type,
        replyTo: replyingTo?._id
      });
      addMessage(msgResponse.data);
      setReplyingTo(null);

      if (socket) {
        socket.emit('messageDelivered', { messageId: msgResponse.data._id, conversationId });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId._id === user?._id;
    const canEdit = isOwn && !item.isDeleted && Date.now() - new Date(item.createdAt).getTime() < 10 * 60 * 1000;
    const canDelete = isOwn && !item.isDeleted && Date.now() - new Date(item.createdAt).getTime() < 10 * 60 * 1000;

    return (
      <Pressable
        onLongPress={() => {
          if (canEdit || canDelete) {
            // Show action menu (edit/delete/reply)
          }
        }}
      >
        {item.replyTo && (
          <View style={{ marginBottom: 4, paddingHorizontal: 8 }}>
            <View style={{ backgroundColor: isOwn ? '#1e40af' : '#d1d5db', borderLeftWidth: 2, borderLeftColor: isOwn ? '#3b82f6' : '#6b7280', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: isOwn ? '#dbeafe' : '#6b7280' }}>Reply to</Text>
              <Text style={{ fontSize: 11, color: isOwn ? '#93c5fd' : '#4b5563', marginTop: 2 }} numberOfLines={1}>{item.replyTo.content}</Text>
            </View>
          </View>
        )}

        <View style={styles.messageBubble}>
          <View style={[styles.bubbleContent, isOwn ? styles.ownBubble : styles.otherBubble]}>
            {item.isDeleted ? (
              <Text style={isOwn ? styles.ownText : styles.otherText}>Message deleted</Text>
            ) : item.mediaType === 'audio' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="play-circle-filled" size={24} color={isOwn ? '#ffffff' : '#3b82f6'} />
                <Text style={isOwn ? styles.ownText : styles.otherText}>Audio message</Text>
              </View>
            ) : item.mediaType === 'image' ? (
              <View>
                <Text style={{ width: 200, height: 150 }}>📷 Image</Text>
                {item.content && <Text style={isOwn ? styles.ownText : styles.otherText}>{item.content}</Text>}
              </View>
            ) : item.mediaType === 'video' ? (
              <View>
                <Text style={isOwn ? styles.ownText : styles.otherText}>🎥 Video</Text>
                {item.content && <Text style={isOwn ? styles.ownText : styles.otherText}>{item.content}</Text>}
              </View>
            ) : item.mediaType === 'file' ? (
              <View>
                <Text style={isOwn ? styles.ownText : styles.otherText}>📄 File</Text>
                {item.content && <Text style={isOwn ? styles.ownText : styles.otherText}>{item.content}</Text>}
              </View>
            ) : (
              <Text style={isOwn ? styles.ownText : styles.otherText}>{item.content}</Text>
            )}
            {item.isEdited && <Text style={{ fontSize: 9, color: isOwn ? '#bfdbfe' : '#9ca3af', marginTop: 2 }}>(edited)</Text>}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: isOwn ? 'flex-end' : 'flex-start', alignItems: 'center', gap: 4, paddingHorizontal: 12, marginTop: 4 }}>
            <Text style={[styles.messageTime, { textAlign: isOwn ? 'right' : 'left' }]}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
            {isOwn && (
              <>
                {item.status === 'sent' && <MaterialIcons name="done" size={12} color="#6b7280" />}
                {item.status === 'delivered' && <MaterialIcons name="done-all" size={12} color="#6b7280" />}
                {item.status === 'read' && <MaterialIcons name="done-all" size={12} color="#3b82f6" />}
              </>
            )}
          </View>

          {(canEdit || canDelete) && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, paddingHorizontal: 12, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
              {canEdit && <Pressable onPress={() => handleEditMessage(item)}><Text style={{ fontSize: 11, color: '#3b82f6' }}>Edit</Text></Pressable>}
              {canDelete && <Pressable onPress={() => handleDeleteMessage(item._id)}><Text style={{ fontSize: 11, color: '#ef4444' }}>Delete</Text></Pressable>}
              <Pressable onPress={() => setReplyingTo(item)}><Text style={{ fontSize: 11, color: '#6b7280' }}>Reply</Text></Pressable>
            </View>
          )}
        </View>
      </Pressable>
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
        {isRecording ? (
          <VoiceRecorder
            onSend={handleVoiceRecordSend}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <View style={styles.inputContainer}>
            {editingMessage && (
              <View style={{ backgroundColor: '#eff6ff', borderLeftWidth: 3, borderLeftColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#3b82f6' }}>Editing message</Text>
                  <Text style={{ fontSize: 12, color: '#374151', marginTop: 2 }} numberOfLines={1}>{editingMessage.content}</Text>
                </View>
                <Pressable onPress={() => { setEditingMessage(null); setMessage(''); }}>
                  <MaterialIcons name="close" size={18} color="#6b7280" />
                </Pressable>
              </View>
            )}

            {replyingTo && (
              <View style={{ backgroundColor: '#f3f4f6', borderLeftWidth: 3, borderLeftColor: '#6b7280', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280' }}>Replying to</Text>
                  <Text style={{ fontSize: 12, color: '#374151', marginTop: 2 }} numberOfLines={1}>{replyingTo.content}</Text>
                </View>
                <Pressable onPress={() => setReplyingTo(null)}>
                  <MaterialIcons name="close" size={18} color="#6b7280" />
                </Pressable>
              </View>
            )}

            <View style={styles.controlsRow}>
              <MediaSelector
                onMediaSelect={handleMediaSelect}
                isUploading={isUploading}
              />
              <EmojiPickerModal onEmojiSelect={handleEmojiSelect} />
              <Pressable
                onPress={() => setIsRecording(true)}
                disabled={isUploading}
                style={{ opacity: isUploading ? 0.5 : 1 }}
              >
                <MaterialIcons
                  name="mic"
                  size={20}
                  color={isUploading ? '#d1d5db' : '#6b7280'}
                />
              </Pressable>
              {isUploading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              )}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                placeholderTextColor="#d1d5db"
                editable={!isUploading}
              />
              <Pressable
                style={styles.sendButton}
                onPress={handleSend}
                disabled={(!message.trim() && !editingMessage && !isUploading) || isUploading}
                opacity={(!message.trim() && !editingMessage && !isUploading) || isUploading ? 0.5 : 1}
              >
                <Text style={styles.sendText}>›</Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
