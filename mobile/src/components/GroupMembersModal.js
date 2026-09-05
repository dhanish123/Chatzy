import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, Modal as RNModal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { groupAPI } from '../services/api.js';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  membersList: {
    paddingHorizontal: 0
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  memberAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000'
  },
  memberRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  adminBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e'
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto'
  },
  actionButton: {
    padding: 6
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20
  }
});

export const GroupMembersModal = ({ visible, group, currentUserId, isAdmin, onClose, onMembersUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleMakeAdmin = async (memberId) => {
    try {
      setLoading(true);
      const response = await groupAPI.makeAdmin(group._id, memberId);
      onMembersUpdate?.(response.data);
      Alert.alert('Success', 'Member promoted to admin');
    } catch (error) {
      console.error('Error making admin:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to make admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (memberId) => {
    try {
      setLoading(true);
      const response = await groupAPI.removeAdmin(group._id, memberId);
      onMembersUpdate?.(response.data);
      Alert.alert('Success', 'Member admin status removed');
    } catch (error) {
      console.error('Error removing admin:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await groupAPI.removeMember(group._id, memberId);
              onMembersUpdate?.(response.data);
              Alert.alert('Success', 'Member removed from group');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderMemberItem = ({ item }) => {
    const isCreator = group.creatorId._id === item.userId._id;
    const memberIsAdmin = item.isAdmin;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {item.userId.username?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.memberName}>{item.userId.username}</Text>
            {isCreator && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>CREATOR</Text>
              </View>
            )}
            {memberIsAdmin && !isCreator && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
        </View>

        {/* Show actions only if current user is admin and member is not the creator */}
        {isAdmin && !isCreator && (
          <View style={styles.actionsContainer}>
            {memberIsAdmin ? (
              <Pressable
                style={styles.actionButton}
                onPress={() => handleRemoveAdmin(item.userId._id)}
                disabled={loading}
              >
                <MaterialIcons name="admin-panel-settings" size={20} color="#ef4444" />
              </Pressable>
            ) : (
              <Pressable
                style={styles.actionButton}
                onPress={() => handleMakeAdmin(item.userId._id)}
                disabled={loading}
              >
                <MaterialIcons name="person" size={20} color="#3b82f6" />
              </Pressable>
            )}

            <Pressable
              style={styles.actionButton}
              onPress={() => handleRemoveMember(item.userId._id, item.userId.username)}
              disabled={loading}
            >
              <MaterialIcons name="close" size={20} color="#ef4444" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalContent}
          activeOpacity={1}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Members ({group?.members?.length || 0})</Text>
            <Pressable onPress={onClose} disabled={loading}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {group?.members && group.members.length > 0 ? (
            <FlatList
              data={group.members}
              renderItem={renderMemberItem}
              keyExtractor={item => item.userId._id}
              scrollEnabled={true}
              style={styles.membersList}
            />
          ) : (
            <Text style={styles.emptyText}>No members</Text>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
