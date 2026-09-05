import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import { useAuthStore } from '../stores/authStore.js';
import { useNavigation } from '@react-navigation/native';
import { userAPI, getImageUrl } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { disconnectSocket } from '../services/socket.js';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12
  },
  infoBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000'
  },
  formSection: {
    marginBottom: 20
  },
  button: {
    marginTop: 16
  },
  logoutButton: {
    marginTop: 24
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500'
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6'
  },
  profileInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitialsText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000'
  }
});

export const ProfileScreen = () => {
  const { user, setUser, logout } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const navigation = useNavigation();

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile({ username });
      setUser(response.data);
      setMessage('Profile updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [1, 1]
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          const fileSize = fileInfo.size || 0;
          
          const limit = 10 * 1024 * 1024; // 10 MB for images
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

        setLoading(true);
        const response = await userAPI.uploadProfileImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });

        // Update user with new profile image
        setUser(response.data);
        setMessage('Profile image updated');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    return getImageUrl(user.profileImage);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          disconnectSocket();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
          });
        },
        style: 'destructive'
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {message && (
          <View style={{ backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#2563eb' }}>{message}</Text>
          </View>
        )}

        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {getProfileImageUrl() ? (
              <Image 
                source={{ uri: getProfileImageUrl() }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.profileInitialsText}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Pressable 
              style={styles.uploadButton}
              onPress={handleImageUpload}
              disabled={loading}
            >
              <MaterialIcons name="camera-alt" size={16} color="#ffffff" />
            </Pressable>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Your username"
            disabled={loading}
          />
          <Button
            title={loading ? 'Saving...' : 'Save Changes'}
            onPress={handleUpdateProfile}
            disabled={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddFriends')}
          >
            <Text style={styles.menuText}>Add Friends</Text>
            <Text>›</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('Blocked')}
          >
            <Text style={styles.menuText}>Blocked Users</Text>
            <Text>›</Text>
          </Pressable>
        </View>

        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
