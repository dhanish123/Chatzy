import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { useAuthStore } from '../stores/authStore.js';
import { authAPI } from '../services/api.js';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6b7280'
  },
  form: {
    marginBottom: 24
  },
  button: {
    marginBottom: 16
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  link: {
    color: '#2563eb',
    fontWeight: '600'
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8
  }
});

export const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigation = useNavigation();

  const handleRegister = async () => {
    setErrors({});

    if (!username || !email || !password || !confirmPassword) {
      setErrors({ form: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ form: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setErrors({ form: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        username,
        email,
        password,
        confirmPassword
      });
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ form: 'User already exists' });
      } else if (error.response?.status === 422) {
        setErrors({ form: error.response.data.message });
      } else {
        setErrors({ form: 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chatzy</Text>
      <Text style={styles.subtitle}>Create Account</Text>

      {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

      <View style={styles.form}>
        <Input
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
        />

        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <Button
        title={loading ? 'Creating...' : 'Create Account'}
        onPress={handleRegister}
        disabled={loading}
        style={styles.button}
      />

      <View style={styles.linkContainer}>
        <Text>Already have an account?</Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </View>
    </ScrollView>
  );
};
