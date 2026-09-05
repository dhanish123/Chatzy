import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useChatStore } from '../stores/chatStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { conversationAPI, groupAPI } from '../services/api.js';
import { getSocket, initializeSocket, joinUserRoom } from '../services/socket.js';
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
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000'
  },
  headerButton: {
    padding: 8
  },
  list: {
    flex: 1
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemContent: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000'
  },
  itemPreview: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16
  }
});

export const ChatListScreen = ({ navigation }) => {
  const { user, token } = useAuthStore();
  const { conversations, groups, setConversations, setSelectedConversation, setGroups, setSelectedGroup } = useChatStore();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          if (!getSocket() && token) {
            initializeSocket(token);
            joinUserRoom(user?._id);
          }

          const [convRes, groupRes] = await Promise.all([
            conversationAPI.getAll(),
            groupAPI.getAll()
          ]);

          setConversations(convRes.data);
          setGroups(groupRes.data);

          // Setup socket listeners for unread count updates
          const socket = getSocket();
          if (socket) {
            const handleUnreadUpdate = (data) => {
              // Refresh conversations and groups to get updated unread counts
              conversationAPI.getAll().then(res => setConversations(res.data));
              groupAPI.getAll().then(res => setGroups(res.data));
            };

            socket.on('newMessage', handleUnreadUpdate);
            socket.on('messageRead', handleUnreadUpdate);

            return () => {
              socket.off('newMessage', handleUnreadUpdate);
              socket.off('messageRead', handleUnreadUpdate);
            };
          }
        } catch (error) {
          console.error('Error loading chats:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [token])
  );

  const handleConversationPress = (conversation) => {
    setSelectedConversation(conversation);
    navigation.navigate('Chat');
  };

  const handleGroupPress = (group) => {
    setSelectedGroup(group);
    navigation.navigate('Chat');
  };

  const allChats = [
    ...conversations.map(c => ({
      type: 'conversation',
      data: c,
      id: c._id,
      name: c.participants.find(p => p.userId._id?.toString() !== user?._id?.toString())?.userId.username,
      unreadCount: c.participants.find(p => p.userId._id?.toString() === user?._id?.toString())?.unreadCount || 0
    })),
    ...groups.map(g => ({
      type: 'group',
      data: g,
      id: g._id,
      name: g.name,
      unreadCount: g.members.find(m => m.userId === user?._id)?.unreadCount || 0
    }))
  ].sort((a, b) => new Date(b.data.lastMessageAt) - new Date(a.data.lastMessageAt));

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.item}
      onPress={() => {
        if (item.type === 'conversation') {
          handleConversationPress(item.data);
        } else {
          handleGroupPress(item.data);
        }
      }}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPreview} numberOfLines={1}>
          {item.data.lastMessage?.content || 'No messages'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Chatzy</Text>
        </View>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <MaterialIcons name="group-add" size={24} color="#3b82f6" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : allChats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={allChats}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};
