import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Play, Pause, ExternalLink } from 'lucide-react-native';
import { spotifyService } from '@/services/spotify';
import { useFavorites } from '@/context/FavoritesContext';
import { useAudio } from '@/hooks/useAudio';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SpotifyTrack } from '@/types/music';
import * as WebBrowser from 'expo-web-browser';
import { RatingSection } from '@/components/RatingSection';
import { CommentSection } from '@/components/CommentSection';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useRating } from '@/context/RatingContext';



// my custom implemented server for getting the preview url since spotify api is deprecated
const BASE_URL = 'https://randapi-vcfz.onrender.com';



export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const { audioState, togglePlaybackWithTrack } = useAudio();
  const { getTrackRatingStats } = useRating();

  const isCurrentlyPlaying = audioState.isPlaying && audioState.currentTrackId === id;
  const isAudioLoading = audioState.isLoading && audioState.currentTrackId === id;

  useEffect(() => {
    loadTrackDetails();
  }, [id]);

  const loadTrackDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const trackData = await spotifyService.getTrack(id);
      const getResponse = await axios.get(`${BASE_URL}/api/search`, {
      params: {
        song: trackData.name,
        artist: trackData.artists[0]?.name || 'Unknown Artist'
      }
    });
    if (getResponse.data.success) {
      trackData.preview_url = getResponse.data.url;
      setTrack(trackData);
    } else {
      setError('Failed to load track');
      Alert.alert('Error', 'Failed to load track');
    }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load track';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoritePress = () => {
    if (!track) return;

    if (isFavorite(track.id)) {
      removeFromFavorites(track.id);
    } else {
      addToFavorites({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        imageUrl: track.album.images[0]?.url || '',
        previewUrl: track.preview_url,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handlePlayPress = () => {
    if (!track?.preview_url) return;
    togglePlaybackWithTrack(
      track.preview_url, 
      track.id,
      {
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        imageUrl: track.album.images[0]?.url || '',
      }
    );
  };

  const handleOpenSpotify = () => {
    if (!track) return;
    WebBrowser.openBrowserAsync(track.external_urls.spotify);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0C121E" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <LoadingSpinner size={32} />
          <Text style={styles.loadingText}>Loading track...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0C121E" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Track not found</Text>
          <Text style={styles.errorSubtext}>
            {error || 'The track you\'re looking for could not be loaded'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = track.album.images[0]?.url;
  const artistNames = track.artists.map(artist => artist.name).join(', ');
  const ratingStats = getTrackRatingStats(track.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0C121E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <Heart
            size={24}
            color={isFavorite(track.id) ? '#FF3B30' : '#666666'}
            fill={isFavorite(track.id) ? '#FF3B30' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.albumArtContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.albumArt} />
          ) : (
            <View style={styles.placeholderArt} />
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.trackInfo}>
          <Text style={styles.trackName}>{track.name}</Text>
          <Text style={styles.artistName}>{artistNames}</Text>
          <Text style={styles.albumName}>{track.album.name}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.controls}>
          {track.preview_url ? (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}
              disabled={isAudioLoading}
            >
              {isAudioLoading ? (
                <LoadingSpinner size={24} color="#FFFFFF" />
              ) : isCurrentlyPlaying ? (
                <>
                  <Pause size={24} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>Pause Preview</Text>
                </>
              ) : (
                <>
                  <Play size={24} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>Play Preview</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.noPreviewContainer}>
              <Text style={styles.noPreviewText}>No preview available</Text>
            </View>
          )}

          <TouchableOpacity style={styles.spotifyButton} onPress={handleOpenSpotify}>
            <ExternalLink size={20} color="#0C121E" />
            <Text style={styles.spotifyButtonText}>Open in Spotify</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{formatDuration(track.duration_ms)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Release Date</Text>
            <Text style={styles.detailValue}>{formatReleaseDate(track.album.release_date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Popularity</Text>
            <Text style={styles.detailValue}>{track.popularity}/100</Text>
          </View>
          
          {ratingStats.totalRatings > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Community Rating</Text>
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingValue}>{ratingStats.averageRating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({ratingStats.totalRatings} ratings)</Text>
              </View>
            </View>
          )}
          
          {track.explicit && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Content</Text>
              <View style={styles.explicitBadge}>
                <Text style={styles.explicitText}>E</Text>
              </View>
            </View>
          )}
        </Animated.View>
        <RatingSection trackId={track.id} />

        <CommentSection trackId={track.id} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  albumArtContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  placeholderArt: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  trackInfo: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  trackName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C121E',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 20,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  albumName: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C121E',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  noPreviewContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noPreviewText: {
    fontSize: 16,
    color: '#999999',
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  spotifyButtonText: {
    color: '#0C121E',
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C121E',
  },
  explicitBadge: {
    backgroundColor: '#666666',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  explicitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C121E',
  },
  ratingCount: {
    fontSize: 14,
    color: '#666666',
  },
});