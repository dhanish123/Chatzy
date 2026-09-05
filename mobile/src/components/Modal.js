import { View, Text, Pressable, StyleSheet, Modal as RNModal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1
  },
  closeButton: {
    padding: 4
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'flex-end'
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f3f4f6'
  },
  confirmButton: {
    backgroundColor: '#3b82f6'
  },
  dangerButton: {
    backgroundColor: '#ef4444'
  },
  cancelText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  }
});

export const Modal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  loading = false
}) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={onCancel}
              disabled={loading}
            >
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, isDangerous ? styles.dangerButton : styles.confirmButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmText}>{loading ? '...' : confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </RNModal>
  );
};
