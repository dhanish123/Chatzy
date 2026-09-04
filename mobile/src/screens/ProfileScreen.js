import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore.js';
import { useNavigation } from '@react-navigation/native';
import { userAPI } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { disconnectSocket } from '../services/socket.js';

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
  }
});

export const ProfileScreen = () => {
  const { user, setUser, logout } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
