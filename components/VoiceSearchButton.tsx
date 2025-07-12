import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Mic, MicOff, Search, Info } from 'lucide-react-native';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { shazamService } from '@/services/shazam';
import { SpotifyTrack } from '@/types/music';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceSearchButtonProps {
  onResultsFound: (tracks: SpotifyTrack[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function VoiceSearchButton({ 
  onResultsFound, 
  onError, 
  disabled = false 
}: VoiceSearchButtonProps) {
  const { recordingState, startRecording, stopRecording, resetState } = useVoiceRecording();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  const pulseAnimation = useSharedValue(1);
  const scaleAnimation = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { scale: pulseAnimation.value }
    ],
  }));

  const handleStartRecording = useCallback(async () => {
    if (disabled) return;

    try {
      const success = await startRecording();
      if (success) {
        // Start pulse animation
        pulseAnimation.value = withRepeat(
          withSequence(
            withSpring(1.1),
            withSpring(1)
          ),
          -1,
          true
        );
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError('Failed to start recording');
    }
  }, [disabled, startRecording, pulseAnimation, onError]);

  const handleStopRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Stop pulse animation
      pulseAnimation.value = 1;
      
      // Add a small scale animation for feedback
      scaleAnimation.value = withSequence(
        withSpring(0.9),
        withSpring(1)
      );

      const uri = await stopRecording();
      
      if (uri) {
        // Validate recording duration
        if (recordingState.duration < 3) {
          onError('Recording too short. Please record for at least 5 seconds.');
          return;
        }

        if (recordingState.duration > 30) {
          onError('Recording too long. Please record for 5-10 seconds.');
          return;
        }

        // Process the recording with Shazam
        const tracks = await shazamService.recognizeSong(uri, recordingState.duration);
        
        if (tracks.length > 0) {
          onResultsFound(tracks);
        } else {
          onError('No song detected. Try recording again with clearer audio.');
        }
      } else {
        onError('Failed to process recording');
      }
    } catch (error) {
      console.error('Voice search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Voice search failed';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
      resetState();
    }
  }, [stopRecording, recordingState.duration, onResultsFound, onError, resetState, pulseAnimation, scaleAnimation]);

  const handlePress = useCallback(() => {
    if (recordingState.isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [recordingState.isRecording, handleStartRecording, handleStopRecording]);

  const showRecordingTips = useCallback(() => {
    setShowTips(!showTips);
  }, []);

  const isActive = recordingState.isRecording || isProcessing;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isActive && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        {isActive ? (
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
              {isProcessing ? (
                <ActivityIndicator size={24} color="#FFFFFF" />
              ) : recordingState.isRecording ? (
                <MicOff size={24} color="#FFFFFF" />
              ) : (
                <Mic size={24} color="#FFFFFF" />
              )}
            </Animated.View>
          </LinearGradient>
        ) : (
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <Mic size={24} color="#667eea" />
          </Animated.View>
        )}
        
        <Text style={[
          styles.buttonText,
          isActive && styles.buttonTextActive,
          disabled && styles.buttonTextDisabled,
        ]}>
          {isProcessing 
            ? 'Processing...' 
            : recordingState.isRecording 
              ? 'Tap to stop' 
              : 'Voice Search'
          }
        </Text>
        
        {recordingState.isRecording && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {recordingState.duration.toFixed(1)}s
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tipsButton} 
        onPress={showRecordingTips}
        disabled={isActive}
      >
        <View style={styles.tipsIconContainer}>
          <Info size={16} color="#6B7280" />
        </View>
        <Text style={styles.tipsText}>Tips</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonActive: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  gradientBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  durationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tipsIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  tipsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
}); 