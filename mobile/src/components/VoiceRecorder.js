import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626'
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  recordingDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  stopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 'auto'
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  waveformContainer: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 3,
    paddingHorizontal: 8
  }
});

export const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setIsRecording(false);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        // Auto-send the audio
        onSend(uri, 'audio');
        handleCancel();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleCancel = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
    }
    setIsRecording(false);
    setDuration(0);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const bars = Array.from({ length: 15 }).map((_, i) => {
      const height = Math.sin(i * 0.5) * 18 + 22;
      return (
        <View
          key={i}
          style={{
            width: 2,
            height: `${height}%`,
            backgroundColor: '#3b82f6',
            borderRadius: 1
          }}
        />
      );
    });
    return bars;
  };

  if (isRecording) {
    return (
      <View style={styles.container}>
        <View style={styles.recordingHeader}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.recordingText}>Recording...</Text>
            <Text style={styles.recordingDuration}>{formatTime(duration)}</Text>
          </View>

          <Pressable
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <Text style={styles.stopButtonText}>Send</Text>
          </Pressable>

          <Pressable
            onPress={handleCancel}
          >
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>

        <View style={styles.waveformContainer}>
          <View style={styles.waveform}>
            {renderWaveform()}
          </View>
        </View>
      </View>
    );
  }

  return null;
};
