export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/chatzy-icon.png',
      badge: '/chatzy-badge.png',
      ...options
    });
  }
};

export const handleSocketNotifications = (socket) => {
  if (!socket) return;

  socket.on('newMessage', (data) => {
    if (document.hidden) {
      sendNotification(`New message from ${data.senderName}`, {
        body: data.content,
        tag: 'message-notification'
      });
    }
  });

  socket.on('friendRequestReceived', (data) => {
    sendNotification('New friend request', {
      body: `${data.senderId.username} sent you a friend request`,
      tag: 'friend-request'
    });
  });

  socket.on('friendRequestAcceptedReceived', (data) => {
    sendNotification('Friend request accepted', {
      body: `${data.receiverId.username} accepted your friend request`,
      tag: 'friend-accept'
    });
  });
};
