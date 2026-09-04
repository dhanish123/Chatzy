import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../stores/authStore.js';
import { userAPI } from './api.js';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

export const registerForPushNotifications = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id'
    });

    const { user } = useAuthStore.getState();
    if (user) {
      await userAPI.updateProfile({
        pushToken: token.data
      });
    }

    return token.data;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return null;
  }
};

export const handleSocketNotifications = (socket) => {
  if (!socket) return;

  socket.on('newMessage', async (data) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Message',
        body: `From ${data.senderName}: ${data.content}`,
        data: { conversationId: data.conversationId }
      },
      trigger: { seconds: 1 }
    });
  });

  socket.on('friendRequestReceived', async (data) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Friend Request',
        body: `${data.senderId.username} sent you a friend request`,
        data: { requestId: data._id }
      },
      trigger: { seconds: 1 }
    });
  });

  socket.on('friendRequestAcceptedReceived', async (data) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Friend Request Accepted',
        body: `${data.receiverId.username} accepted your request`,
        data: { userId: data.receiverId._id }
      },
      trigger: { seconds: 1 }
    });
  });
};
