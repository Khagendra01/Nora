import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  error: string | null;
  recordingUri: string | null;
}

export function useVoiceRecording() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    error: null,
    recordingUri: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isProcessing: true,
        error: null,
        duration: 0,
      }));

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;

      // Start duration timer
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRecordingState(prev => ({
          ...prev,
          duration: elapsed,
        }));
      }, 100);

      setRecordingState(prev => ({
        ...prev,
        isProcessing: false,
      }));

      return true;
    } catch (error) {
      console.error('Recording start error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));

      Alert.alert('Recording Error', errorMessage);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) {
        throw new Error('No active recording');
      }

      setRecordingState(prev => ({
        ...prev,
        isProcessing: true,
      }));

      // Stop the recording
      await recordingRef.current.stopAndUnloadAsync();
      
      // Get the recording URI
      const uri = recordingRef.current.getURI();
      
      // Clear the interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Reset recording ref
      recordingRef.current = null;

      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        recordingUri: uri,
      }));

      return uri;
    } catch (error) {
      console.error('Recording stop error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));

      Alert.alert('Recording Error', errorMessage);
      return null;
    }
  }, []);

  const resetState = useCallback(() => {
    // Stop any active recording
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(console.error);
      recordingRef.current = null;
    }

    // Clear interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setRecordingState({
      isRecording: false,
      isProcessing: false,
      duration: 0,
      error: null,
      recordingUri: null,
    });
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    resetState,
  };
} 