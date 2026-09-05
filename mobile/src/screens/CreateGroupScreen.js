import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert, TextInput, Image, FlatList, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { friendAPI, groupAPI, uploadAPI } from '../services/api.js';
import { Button } from '../components/Button.js';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#e5e7eb'
  },
  imageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  imageButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    marginBottom: 12
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
  selectedCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 12
  }
});

export const CreateGroupScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { setSelectedGroup, addGroup } = useChatStore();
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFriends, setFetchingFriends] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setFetchingFriends(true);
      const response = await friendAPI.getFriends();
      setAvailableFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setFetchingFriends(false);
    }
  };

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [1, 1]
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          const fileSize = fileInfo.size || 0;
          const limit = 10 * 1024 * 1024; // 10 MB

          if (fileSize > limit) {
            Alert.alert(
              'File Too Large',
              `Maximum image size: 10 MB\n\nYour file: ${(fileSize / 1024 / 1024).toFixed(2)} MB`
            );
            return;
          }
        } catch (err) {
          console.warn('Could not get file size:', err);
        }

        setGroupImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'group.jpg'
        });
        setImagePreview(asset.uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    try {
      if (!groupName.trim()) {
        Alert.alert('Error', 'Group name is required');
        return;
      }

      if (selectedMembers.length < 2) {
        Alert.alert('Error', 'Please select at least 2 members');
        return;
      }

      setLoading(true);

      let groupImageUrl = null;
      if (groupImage) {
        const uploadResponse = await uploadAPI.image(groupImage);
        groupImageUrl = uploadResponse.data.url;
      }

      const response = await groupAPI.create({
        name: groupName,
        image: groupImageUrl,
        memberIds: selectedMembers
      });

      // Add to store immediately so it appears in Groups list
      addGroup(response.data);
      setSelectedGroup(response.data);
      Alert.alert('Success', 'Group created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Group Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Image</Text>
          <View style={styles.imageContainer}>
            {imagePreview ? (
              <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePreview}>
                <MaterialIcons name="image" size={32} color="#9ca3af" />
              </View>
            )}
            <Pressable style={styles.imageButton} onPress={handleImageSelect}>
              <MaterialIcons name="add-a-photo" size={18} color="#ffffff" />
              <Text style={styles.imageButtonText}>Upload</Text>
            </Pressable>
          </View>
        </View>

        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            editable={!loading}
          />
        </View>

        {/* Select Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Members</Text>
          <Text style={styles.selectedCount}>
            Selected: {selectedMembers.length} members (minimum 2 required)
          </Text>

          {fetchingFriends ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : availableFriends.length === 0 ? (
            <Text style={styles.emptyText}>No friends available</Text>
          ) : (
            <FlatList
              data={availableFriends}
              renderItem={renderFriendItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
          </View>
        </Pressable>
        <Pressable
          style={{ flex: 1 }}
          onPress={handleCreateGroup}
          disabled={loading || selectedMembers.length < 2}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: selectedMembers.length < 2 ? '#d1d5db' : '#3b82f6',
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600' }}>
              {loading ? 'Creating...' : 'Create Group'}
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
