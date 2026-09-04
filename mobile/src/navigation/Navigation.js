import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore.js';
import { useEffect } from 'react';
import { initializeSocket } from '../services/socket.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { RegisterScreen } from '../screens/RegisterScreen.js';
import { ChatListScreen } from '../screens/ChatListScreen.js';
import { ChatScreen } from '../screens/ChatScreen.js';
import { ProfileScreen } from '../screens/ProfileScreen.js';
import { AddFriendsScreen } from '../screens/AddFriendsScreen.js';
import { BlockedScreen } from '../screens/BlockedScreen.js';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true
    }}
  >
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#6b7280'
    }}
  >
    <Tab.Screen
      name="Chats"
      component={ChatStack}
      options={{
        tabBarLabel: 'Chats',
        tabBarAccessibilityLabel: 'Chats Tab'
      }}
    />
    <Tab.Screen
      name="Friends"
      component={AddFriendsScreen}
      options={{
        tabBarLabel: 'Friends',
        tabBarAccessibilityLabel: 'Friends Tab'
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarAccessibilityLabel: 'Profile Tab'
      }}
    />
  </Tab.Navigator>
);

export const Navigation = () => {
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      initializeSocket(token);
    }
  }, [token]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: false
        }}
      >
        {token ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
