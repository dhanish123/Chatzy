import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Alert } from 'react-native';
import { useBlockStore } from '../stores/blockStore.js';
import { blockAPI } from '../services/api.js';
import { Button } from '../components/Button.js';

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
  emptyText: {
    color: '#6b7280',
    fontSize: 16
  }
});

export const BlockedScreen = () => {
  const { blockedUsers, setBlockedUsers, removeBlockedUser } = useBlockStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        const response = await blockAPI.getBlockedUsers();
        setBlockedUsers(response.data);
      } catch (error) {
        console.error('Error loading blocked users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlocked();
  }, []);

  const handleUnblock = (user) => {
    Alert.alert('Unblock', `Unblock ${user.username}?`, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            await blockAPI.unblockUser(user._id);
            removeBlockedUser(user._id);
          } catch (error) {
            Alert.alert('Error', 'Failed to unblock user');
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
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No blocked users'}
              </Text>
            </View>
          }
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};
