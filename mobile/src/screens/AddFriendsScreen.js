import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, SafeAreaView, Alert } from 'react-native';
import { Button } from '../components/Button.js';
import { useFriendStore } from '../stores/friendStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { userAPI, friendAPI } from '../services/api.js';
import { SkeletonUserList } from '../components/Skeleton.js';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler.js';
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#2563eb'
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600'
  },
  activeTabText: {
    color: '#2563eb'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#000000'
  },
  list: {
    flex: 1
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000'
  },
  itemEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600'
  },
  friendsButton: {
    backgroundColor: '#d1d5db'
  },
  friendsButtonText: {
    color: '#4b5563'
  },
  emptyIcon: {
    marginBottom: 12
  }
});

export const AddFriendsScreen = () => {
  const [tab, setTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const { pendingRequests, sentRequests, setPendingRequests, setSentRequests } = useFriendStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setRequestsError(null);
        const [pending, sent, friendsList] = await Promise.all([
          friendAPI.getPendingRequests(),
          friendAPI.getSentRequests(),
          friendAPI.getFriends()
        ]);
        setPendingRequests(pending.data);
        setSentRequests(sent.data);
        setFriends(friendsList.data);
      } catch (error) {
        console.error('Error loading requests:', error);
        setRequestsError(error);
        showErrorToast(error, 'Failed to load friend requests');
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, []);

  const getButtonState = (userId) => {
    // Check if already friends
    if (friends.some(f => f._id === userId)) {
      return { type: 'friends', label: 'Friends', disabled: true };
    }

    // Check if pending request from this user
    if (pendingRequests.some(r => r.senderId._id === userId)) {
      const request = pendingRequests.find(r => r.senderId._id === userId);
      return { type: 'pending', label: 'Pending', disabled: true, requestId: request._id };
    }

    // Check if sent request to this user
    if (sentRequests.some(r => r.receiverId._id === userId)) {
      const request = sentRequests.find(r => r.receiverId._id === userId);
      return { type: 'sent', label: 'Cancel', disabled: false, requestId: request._id };
    }

    // Default: invite
    return { type: 'invite', label: 'Invite', disabled: false };
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const response = await userAPI.searchUsers(searchQuery);
      // Filter out current user
      const filtered = response.data.filter(u => u._id !== user?._id);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
      showErrorToast(error, 'Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId);
      // Update search results to show "Cancel" button
      setSearchResults(searchResults.map(u => u._id === userId ? u : u));
      // Add to sent requests
      const newSentRequest = {
        _id: Math.random().toString(),
        receiverId: searchResults.find(u => u._id === userId)
      };
      setSentRequests([...sentRequests, newSentRequest]);
      showSuccessToast('Friend request sent');
    } catch (error) {
      console.error('Error sending request:', error);
      showErrorToast(error, 'Failed to send friend request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await friendAPI.cancelRequest(requestId);
      setSentRequests(sentRequests.filter(r => r._id !== requestId));
      showSuccessToast('Request cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      showErrorToast(error, 'Failed to cancel request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendAPI.acceptRequest(requestId);
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
      showSuccessToast('Friend request accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      showErrorToast(error, 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendAPI.rejectRequest(requestId);
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
      showSuccessToast('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showErrorToast(error, 'Failed to reject request');
    }
  };

  const renderSearchTab = () => (
    <View style={styles.content}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1, marginBottom: 0 }]}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#d1d5db"
        />
        <Pressable
          style={{
            backgroundColor: '#2563eb',
            paddingHorizontal: 16,
            borderRadius: 8,
            justifyContent: 'center'
          }}
          onPress={handleSearch}
          disabled={searchLoading}
        >
          <Text style={{ color: '#ffffff', fontWeight: '600' }}>Search</Text>
        </Pressable>
      </View>

      {searchLoading ? (
        <SkeletonUserList count={3} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => {
            const buttonState = getButtonState(item._id);
            return (
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.username}</Text>
                  <Text style={styles.itemEmail}>{item.email}</Text>
                </View>
                {buttonState.type === 'friends' ? (
                  <Pressable
                    style={[styles.statusButton, styles.friendsButton]}
                    disabled={true}
                  >
                    <Text style={[styles.statusButtonText, styles.friendsButtonText]}>
                      {buttonState.label}
                    </Text>
                  </Pressable>
                ) : buttonState.type === 'pending' ? (
                  <Pressable
                    style={[styles.statusButton, styles.friendsButton]}
                    disabled={true}
                  >
                    <Text style={[styles.statusButtonText, styles.friendsButtonText]}>
                      {buttonState.label}
                    </Text>
                  </Pressable>
                ) : buttonState.type === 'sent' ? (
                  <Button
                    title={buttonState.label}
                    variant="secondary"
                    onPress={() => handleCancelRequest(buttonState.requestId)}
                  />
                ) : (
                  <Button
                    title={buttonState.label}
                    onPress={() => handleSendRequest(item._id)}
                  />
                )}
              </View>
            );
          }}
          keyExtractor={item => item._id}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View style={styles.empty}>
                <MaterialIcons name="person-off" size={48} color="#d1d5db" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
              </View>
            ) : null
          }
          style={styles.list}
        />
      )}
    </View>
  );

  const renderPendingTab = () => (
    <View style={styles.content}>
      {loadingRequests ? (
        <SkeletonUserList count={3} />
      ) : requestsError ? (
        <View style={styles.empty}>
          <MaterialIcons name="error-outline" size={48} color="#dc2626" style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: '#991b1b' }]}>Failed to load pending requests</Text>
        </View>
      ) : pendingRequests.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="mail-outline" size={48} color="#d1d5db" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>You have no pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.senderId.username}</Text>
                <Text style={styles.itemEmail}>{item.senderId.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  title="Accept"
                  onPress={() => handleAcceptRequest(item._id)}
                />
                <Button
                  title="Reject"
                  variant="secondary"
                  onPress={() => handleRejectRequest(item._id)}
                />
              </View>
            </View>
          )}
          keyExtractor={item => item._id}
          style={styles.list}
        />
      )}
    </View>
  );

  const renderSentTab = () => (
    <View style={styles.content}>
      {loadingRequests ? (
        <SkeletonUserList count={3} />
      ) : requestsError ? (
        <View style={styles.empty}>
          <MaterialIcons name="error-outline" size={48} color="#dc2626" style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: '#991b1b' }]}>Failed to load sent requests</Text>
        </View>
      ) : sentRequests.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="send" size={48} color="#d1d5db" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>You have no outgoing requests</Text>
        </View>
      ) : (
        <FlatList
          data={sentRequests}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.receiverId.username}</Text>
                <Text style={styles.itemEmail}>{item.receiverId.email}</Text>
              </View>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => handleCancelRequest(item._id)}
              />
            </View>
          )}
          keyExtractor={item => item._id}
          style={styles.list}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Friends</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'search' && styles.activeTab]}
          onPress={() => setTab('search')}
        >
          <Text style={[styles.tabText, tab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'pending' && styles.activeTab]}
          onPress={() => setTab('pending')}
        >
          <Text style={[styles.tabText, tab === 'pending' && styles.activeTabText]}>
            Pending ({pendingRequests.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'sent' && styles.activeTab]}
          onPress={() => setTab('sent')}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.activeTabText]}>
            Sent ({sentRequests.length})
          </Text>
        </Pressable>
      </View>

      {tab === 'search' && renderSearchTab()}
      {tab === 'pending' && renderPendingTab()}
      {tab === 'sent' && renderSentTab()}
    </SafeAreaView>
  );
};
