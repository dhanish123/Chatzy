import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, Modal as RNModal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { groupAPI, friendAPI } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { Modal } from './Modal.js';
import { GroupMembersModal } from './GroupMembersModal.js';

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  menuButton: {
    padding: 8
  },
  menuOverlay: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 180,
    zIndex: 1000
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  menuItemLast: {
    borderBottomWidth: 0
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151'
  },
  menuItemDanger: {
    color: '#ef4444'
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    fontWeight: 'bold'
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  addMembersModalContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  addMembersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  addMembersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  addMembersFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  addMembersButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addMembersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  cancelButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  }
});

export const GroupHeaderMenu = ({ groupId, group, currentUserId, onGroupLeft, onGroupUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    isDangerous: false
  });
  const socket = getSocket();

  // Determine if current user is admin
  const isAdmin = currentGroup?.creatorId?._id === currentUserId ||
    currentGroup?.members?.some(m => m.userId._id === currentUserId && m.isAdmin);

  const handleViewMembers = () => {
    setShowMembers(true);
    setIsOpen(false);
  };

  const handleAddMembers = async () => {
    try {
      const response = await friendAPI.getFriends();
      setAvailableFriends(response.data);
      setSelectedMembers([]);
      setShowAddMembers(true);
      setIsOpen(false);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    }
  };

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConfirmAddMembers = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    try {
      setLoading(true);
      const response = await groupAPI.addMembers(groupId, selectedMembers);
      
      setCurrentGroup(response.data);
      onGroupUpdated?.(response.data);
      
      if (socket) {
        socket.emit('groupMembersAdded', { groupId, memberIds: selectedMembers });
      }
      
      Alert.alert('Success', 'Members added successfully');
      setShowAddMembers(false);
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    setModalState({
      isOpen: true,
      title: 'Leave Group',
      message: 'Are you sure you want to leave this group?',
      action: 'leave',
      isDangerous: true
    });
  };

  const handleModalConfirm = async () => {
    setLoading(true);
    try {
      if (modalState.action === 'leave') {
        await groupAPI.leave(groupId);
        
        if (socket) {
          socket.emit('leaveGroupAction', { groupId });
        }
        
        onGroupLeft?.();
      }
      setModalState({ ...modalState, isOpen: false });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const renderFriendItem = ({ item }) => (
    <Pressable
      style={styles.memberItem}
      onPress={() => handleMemberToggle(item._id)}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.username?.[0]?.toUpperCase() || 'U'}
        </Text>
      </View>
      <Text style={styles.memberName}>{item.username}</Text>
      <View
        style={[
          styles.checkbox,
          selectedMembers.includes(item._id) && styles.checkboxChecked
        ]}
      >
        {selectedMembers.includes(item._id) && (
          <MaterialIcons name="check" size={16} color="#ffffff" />
        )}
      </View>
    </Pressable>
  );

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.menuButton}
          onPress={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          <MaterialIcons name="more-vert" size={24} color="#6b7280" />
        </Pressable>

        {isOpen && (
          <View style={styles.menuOverlay}>
            <Pressable
              style={[styles.menuItem]}
              onPress={handleViewMembers}
              disabled={loading}
            >
              <Text style={styles.menuItemText}>View Members</Text>
            </Pressable>
            {isAdmin && (
              <Pressable
                style={[styles.menuItem]}
                onPress={handleAddMembers}
                disabled={loading}
              >
                <Text style={styles.menuItemText}>Add Members</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLeaveGroup}
              disabled={loading}
            >
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Leave Group</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* View Members Modal */}
      <GroupMembersModal
        visible={showMembers}
        group={currentGroup}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onClose={() => setShowMembers(false)}
        onMembersUpdate={(updatedGroup) => {
          setCurrentGroup(updatedGroup);
          onGroupUpdated?.(updatedGroup);
        }}
      />

      {/* Add Members Modal */}
      <RNModal
        visible={showAddMembers}
        animationType="slide"
        transparent
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          activeOpacity={1}
        >
          <Pressable
            style={styles.addMembersModalContent}
            activeOpacity={1}
          >
            <View style={styles.addMembersHeader}>
              <Text style={styles.addMembersTitle}>Add Members</Text>
              <Pressable
                onPress={() => setShowAddMembers(false)}
                disabled={loading}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <FlatList
              data={availableFriends}
              renderItem={renderFriendItem}
              keyExtractor={item => item._id}
            />

            <View style={styles.addMembersFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowAddMembers(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addMembersButton, loading && { opacity: 0.5 }]}
                onPress={handleConfirmAddMembers}
                disabled={loading || selectedMembers.length === 0}
              >
                <Text style={styles.addMembersButtonText}>
                  {loading ? 'Adding...' : `Add (${selectedMembers.length})`}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </RNModal>

      {/* Leave Group Modal */}
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
        confirmText={modalState.isDangerous ? 'Leave' : 'OK'}
        cancelText="Cancel"
        isDangerous={modalState.isDangerous}
        loading={loading}
      />
    </>
  );
};
