import { useState } from 'react';
import { View, Text, Image, Video, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  closeButton: {
    padding: 4
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12
  },
  videoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#000000'
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12
  },
  fileIcon: {
    marginRight: 12
  },
  fileDetails: {
    flex: 1
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  cancelButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  sendButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  }
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const MediaPreviewModal = ({ 
  visible, 
  media, 
  fileSize, 
  onConfirm, 
  onCancel,
  loading = false 
}) => {
  if (!media) return null;

  const isImage = media.type === 'image';
  const isVideo = media.type === 'video';
  const isFile = media.type === 'file';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <Pressable style={styles.overlay} activeOpacity={1}>
        <Pressable style={styles.container} activeOpacity={1}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Preview</Text>
            <Pressable
              style={styles.closeButton}
              onPress={onCancel}
              disabled={loading}
            >
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isImage && (
              <Image
                source={{ uri: media.uri }}
                style={styles.imagePreview}
              />
            )}
            {isVideo && (
              <Video
                source={{ uri: media.uri }}
                style={styles.videoPreview}
                useNativeControls
              />
            )}

            {/* File Info */}
            <View style={styles.fileInfo}>
              <MaterialIcons
                name={isImage ? 'image' : isVideo ? 'videocam' : 'description'}
                size={24}
                color="#3b82f6"
                style={styles.fileIcon}
              />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {media.name}
                </Text>
                <Text style={styles.fileSize}>
                  {fileSize ? formatFileSize(fileSize) : 'Unknown size'}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.sendButton, loading && { opacity: 0.5 }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
