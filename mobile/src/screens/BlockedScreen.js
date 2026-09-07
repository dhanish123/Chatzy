import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Alert, Pressable } from 'react-native';
import { useBlockStore } from '../stores/blockStore.js';
import { blockAPI } from '../services/api.js';
import { Button } from '../components/Button.js';
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
  content: {
    flex: 1,
    paddingHorizontal: 16
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
  emptyIcon: {
    marginBottom: 12
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  errorText: {
    color: '#991b1b',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  }
});

export const BlockedScreen = () => {
  const { blockedUsers, setBlockedUsers, removeBlockedUser } = useBlockStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        setError(null);
        const response = await blockAPI.getBlockedUsers();
        setBlockedUsers(response.data);
      } catch (error) {
        console.error('Error loading blocked users:', error);
        setError(error);
        showErrorToast(error, 'Failed to load blocked users');
      } finally {
        setLoading(false);
      }
    };
    loadBlocked();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await blockAPI.getBlockedUsers();
      setBlockedUsers(response.data);
      showSuccessToast('Blocked users loaded');
    } catch (error) {
      console.error('Error loading blocked users:', error);
      setError(error);
      showErrorToast(error, 'Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (user) => {
    Alert.alert('Unblock', `Unblock ${user.username}?`, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            await blockAPI.unblockUser(user._id);
            removeBlockedUser(user._id);
            showSuccessToast(`${user.username} unblocked`);
          } catch (error) {
            console.error('Error unblocking user:', error);
            showErrorToast(error, 'Failed to unblock user');
          }
        },
        style: 'destructive'
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.username}</Text>
        <Text style={styles.itemEmail}>{item.email}</Text>
      </View>
      <Button
        title="Unblock"
        variant="secondary"
        onPress={() => handleUnblock(item)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blocked Users</Text>
      </View>

      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#dc2626" style={styles.emptyIcon} />
            <Text style={styles.errorText}>Failed to load blocked users</Text>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <SkeletonUserList count={3} />
        ) : blockedUsers.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="security" size={48} color="#d1d5db" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>You haven't blocked anyone</Text>
          </View>
        ) : (
          <FlatList
            data={blockedUsers}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            style={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
