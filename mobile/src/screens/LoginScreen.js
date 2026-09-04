import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setErrors({});
    if (!email || !password) {
      setErrors({ form: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ form: 'Invalid email or password' });
      } else {
        setErrors({ form: 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chatzy</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

      {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
        style={styles.button}
      />

      <View style={styles.linkContainer}>
        <Text>Don't have an account?</Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Register')}
        >
          Create one
        </Text>
      </View>
    </ScrollView>
  );
};
