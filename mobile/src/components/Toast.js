import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 9999
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  success: {
    backgroundColor: '#10b981'
  },
  error: {
    backgroundColor: '#ef4444'
  },
  warning: {
    backgroundColor: '#f59e0b'
  },
  info: {
    backgroundColor: '#3b82f6'
  },
  text: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8
  },
  closeButton: {
    padding: 4
  }
});

let toastQueue = [];
let currentToast = null;
let toastListeners = [];

export const showToast = (message, type = 'info', duration = 3000) => {
  const id = Math.random().toString();
  const toast = { id, message, type, duration };
  
  toastQueue.push(toast);
  notifyListeners();
  
  if (!currentToast) {
    processQueue();
  }
};

const processQueue = () => {
  if (toastQueue.length === 0) {
    currentToast = null;
    return;
  }

  currentToast = toastQueue.shift();
  notifyListeners();

  setTimeout(() => {
    currentToast = null;
    processQueue();
  }, currentToast.duration);
};

const notifyListeners = () => {
  toastListeners.forEach(listener => listener());
};

const subscribeToToasts = (callback) => {
  toastListeners.push(callback);
  return () => {
    toastListeners = toastListeners.filter(l => l !== callback);
  };
};

const ToastDisplay = ({ toast }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8
    }).start();
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <MaterialIcons name="check-circle" size={20} color="#ffffff" />;
      case 'error':
        return <MaterialIcons name="error" size={20} color="#ffffff" />;
      case 'warning':
        return <MaterialIcons name="warning" size={20} color="#ffffff" />;
      case 'info':
      default:
        return <MaterialIcons name="info" size={20} color="#ffffff" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return styles.success.backgroundColor;
      case 'error':
        return styles.error.backgroundColor;
      case 'warning':
        return styles.warning.backgroundColor;
      case 'info':
      default:
        return styles.info.backgroundColor;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor() }
        ]}
      >
        {getIcon()}
        <Text style={styles.text}>{toast.message}</Text>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            currentToast = null;
            processQueue();
            notifyListeners();
          }}
        >
          <MaterialIcons name="close" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export const Toast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToToasts(() => {
      setToast(currentToast);
    });

    return unsubscribe;
  }, []);

  if (!toast) return null;

  return <ToastDisplay toast={toast} />;
};

export default Toast;
