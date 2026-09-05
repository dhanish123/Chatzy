import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  recordingContainer: {
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
  recordedContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  recordedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  recordedInfo: {
    flex: 1
  },
  recordedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
  },
  recordedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4
  },
  recordedDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  waveformContainer: {
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 8,
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
    gap: 4,
    paddingHorizontal: 8
  }
});

export const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
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
        setRecordedUri(uri);
        setIsRecording(false);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!soundRef.current) {
          const sound = new Audio.Sound();
          await sound.loadAsync({ uri: recordedUri });
          soundRef.current = sound;
        }
        await soundRef.current.playAsync();
        setIsPlaying(true);

        // Auto-stop when finished
        soundRef.current.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  };

  const handleSend = async () => {
    if (recordedUri) {
      onSend(recordedUri, 'audio');
      setRecordedUri(null);
      setDuration(0);
      setIsPlaying(false);
    }
  };

  const handleCancel = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setRecordedUri(null);
    setDuration(0);
    setIsPlaying(false);
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const bars = Array.from({ length: 20 }).map((_, i) => {
      const height = Math.sin(i * 0.5) * 20 + 25;
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

  if (recordedUri) {
    return (
      <View style={styles.recordedContainer}>
        <View style={styles.recordedHeader}>
          <View style={styles.recordedInfo}>
            <Text style={styles.recordedLabel}>Voice Message</Text>
            <Text style={styles.recordedTitle}>Audio Recording</Text>
            <Text style={styles.recordedDuration}>{formatTime(duration)}</Text>
          </View>

          <Pressable
            style={styles.playButton}
            onPress={togglePlayback}
          >
            <MaterialIcons
              name={isPlaying ? 'stop' : 'play-arrow'}
              size={20}
              color="#ffffff"
            />
          </Pressable>

          <Pressable
            style={styles.sendButton}
            onPress={handleSend}
          >
            <MaterialIcons name="send" size={20} color="#ffffff" />
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={handleCancel}
          >
            <MaterialIcons name="close" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    );
  }

  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
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
            <Text style={styles.stopButtonText}>Stop</Text>
          </Pressable>

          <Pressable
            style={{ marginLeft: 8 }}
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
