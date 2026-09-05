import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 100 * 1024 * 1024, // 100 MB
  audio: 50 * 1024 * 1024, // 50 MB
  file: 50 * 1024 * 1024 // 50 MB
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const showSizeLimits = () => {
  const limits = `Maximum File Sizes:\n\n📷 Images: ${formatFileSize(FILE_SIZE_LIMITS.image)}\n🎥 Videos: ${formatFileSize(FILE_SIZE_LIMITS.video)}\n🔊 Audio: ${formatFileSize(FILE_SIZE_LIMITS.audio)}\n📄 Files: ${formatFileSize(FILE_SIZE_LIMITS.file)}`;
  Alert.alert('File Size Limits', limits);
};

const styles = StyleSheet.create({
  triggerButton: {
    padding: 8,
    marginHorizontal: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  closeButton: {
    padding: 4
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff'
  },
  optionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6'
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  photoVideoIconContainer: {
    backgroundColor: '#dbeafe'
  },
  fileIconContainer: {
    backgroundColor: '#dcfce7'
  },
  optionContent: {
    flex: 1
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  optionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  }
});

export const MediaSelector = ({ onMediaSelect, isUploading }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handlePhotoVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        aspect: [4, 3]
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          const fileSize = fileInfo.size || 0;
          
          // Determine type and limit
          const mediaType = asset.type === 'video' ? 'video' : 'image';
          const limit = FILE_SIZE_LIMITS[mediaType];
          
          if (fileSize > limit) {
            Alert.alert(
              'File Too Large',
              `Maximum size for ${mediaType}s: ${formatFileSize(limit)}\n\nYour file: ${formatFileSize(fileSize)}`,
              [
                {
                  text: 'View Limits',
                  onPress: showSizeLimits
                },
                {
                  text: 'OK',
                  style: 'cancel'
                }
              ]
            );
            return;
          }
        } catch (err) {
          console.warn('Could not get file size:', err);
        }
        
        onMediaSelect({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `media_${Date.now()}`
        });
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error picking image/video:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const handleFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          const fileSize = fileInfo.size || 0;
          
          const limit = FILE_SIZE_LIMITS.file;
          if (fileSize > limit) {
            Alert.alert(
              'File Too Large',
              `Maximum file size: ${formatFileSize(limit)}\n\nYour file: ${formatFileSize(fileSize)}`,
              [
                {
                  text: 'View Limits',
                  onPress: showSizeLimits
                },
                {
                  text: 'OK',
                  style: 'cancel'
                }
              ]
            );
            return;
          }
        } catch (err) {
          console.warn('Could not get file size:', err);
        }
        
        onMediaSelect({
          uri: asset.uri,
          type: 'file',
          name: asset.name
        });
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  return (
    <>
      <Pressable
        style={styles.triggerButton}
        onPress={() => setIsVisible(true)}
        disabled={isUploading}
      >
        <MaterialIcons
          name="attach-file"
          size={20}
          color={isUploading ? '#d1d5db' : '#6b7280'}
        />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            activeOpacity={1}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Media</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <View style={styles.optionsContainer}>
              {/* Photo & Video Option */}
              <Pressable
                style={[styles.optionButton, styles.optionButtonActive]}
                onPress={handlePhotoVideo}
              >
                <View style={[styles.optionIconContainer, styles.photoVideoIconContainer]}>
                  <MaterialIcons name="image" size={24} color="#3b82f6" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Photo & Video</Text>
                  <Text style={styles.optionDescription}>Send images or videos from your gallery</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#3b82f6" />
              </Pressable>

              {/* Files Option */}
              <Pressable
                style={[styles.optionButton, styles.optionButtonActive]}
                onPress={handleFile}
              >
                <View style={[styles.optionIconContainer, styles.fileIconContainer]}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#10b981" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Files</Text>
                  <Text style={styles.optionDescription}>Send documents or other files</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#10b981" />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
