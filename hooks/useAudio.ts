import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { AudioState } from '@/types/music';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useRecentlyPlayed } from '@/context/RecentlyPlayedContext';

export function useAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    isLoading: false,
    isPlaying: false,
    currentTrackId: null,
    error: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const { addToRecentlyPlayed } = useRecentlyPlayed();

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const playPreview = useCallback(async (previewUrl: string, trackId: string) => {
    try {
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));

      // Stop current audio if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: previewUrl },
        { shouldPlay: true, isLooping: false }
      );

      soundRef.current = sound;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setAudioState(prev => ({ 
              ...prev, 
              isPlaying: false, 
              currentTrackId: null,
              isLoading: false 
            }));
          }
        }
      });

      triggerHaptic();
      setAudioState(prev => ({ 
        ...prev, 
        isPlaying: true, 
        currentTrackId: trackId,
        isLoading: false 
      }));

    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioState(prev => ({ 
        ...prev, 
        error: 'Failed to play preview',
        isLoading: false,
        isPlaying: false 
      }));
    }
  }, [triggerHaptic]);

  const stopPreview = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      triggerHaptic();
      setAudioState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTrackId: null,
        error: null 
      }));
    } catch (error) {
      console.error('Audio stop error:', error);
    }
  }, [triggerHaptic]);

  const togglePlayback = useCallback(async (previewUrl: string | null, trackId: string) => {
    if (!previewUrl) return;

    if (audioState.isPlaying && audioState.currentTrackId === trackId) {
      await stopPreview();
    } else {
      await playPreview(previewUrl, trackId);
    }
  }, [audioState.isPlaying, audioState.currentTrackId, playPreview, stopPreview]);

  const togglePlaybackWithTrack = useCallback(async (
    previewUrl: string | null, 
    trackId: string,
    trackInfo?: {
      name: string;
      artist: string;
      album: string;
      imageUrl: string;
    }
  ) => {
    if (!previewUrl) return;

    if (audioState.isPlaying && audioState.currentTrackId === trackId) {
      await stopPreview();
    } else {
      await playPreview(previewUrl, trackId);
      
      // Add to recently played if track info is provided
      if (trackInfo) {
        try {
          await addToRecentlyPlayed({
            id: trackId,
            name: trackInfo.name,
            artist: trackInfo.artist,
            album: trackInfo.album,
            imageUrl: trackInfo.imageUrl,
            previewUrl,
          });
        } catch (error) {
          console.error('Error adding to recently played:', error);
        }
      }
    }
  }, [audioState.isPlaying, audioState.currentTrackId, playPreview, stopPreview, addToRecentlyPlayed]);

  return {
    audioState,
    playPreview,
    stopPreview,
    togglePlayback,
    togglePlaybackWithTrack,
  };
}