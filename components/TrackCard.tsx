import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Heart, Play, Pause, Music } from 'lucide-react-native';
import { SpotifyTrack } from '@/types/music';
import { useFavorites } from '@/context/FavoritesContext';
import { useAudio } from '@/hooks/useAudio';
import { useRating } from '@/context/RatingContext';
import { StarRating } from '@/components/ui/StarRating';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TrackCardProps {
  track: SpotifyTrack;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { audioState, togglePlaybackWithTrack } = useAudio();
  const { getTrackRatingStats } = useRating();

  const isCurrentlyPlaying = audioState.isPlaying && audioState.currentTrackId === track.id;
  const isLoading = audioState.isLoading && audioState.currentTrackId === track.id;

  const handleFavoritePress = () => {
    if (isFavorite(track.id)) {
      removeFromFavorites(track.id);
    } else {
      addToFavorites({
        id: track.id,
        name: track.name,
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        imageUrl: track.album?.images?.[0]?.url || '',
        previewUrl: track.preview_url,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleCardPress = () => {
    router.push({
      pathname: '/track/[id]',
      params: { id: track.id },
    });
  };

  const handlePlayPress = () => {
    if (track.preview_url) {
      togglePlaybackWithTrack(
        track.preview_url, 
        track.id,
        {
          name: track.name,
          artist: track.artists?.[0]?.name || 'Unknown Artist',
          album: track.album?.name || 'Unknown Album',
          imageUrl: track.album?.images?.[0]?.url || '',
        }
      );
    }
  };

  const imageUrl = track.album?.images?.[0]?.url;
  const artistNames = track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
  const ratingStats = getTrackRatingStats(track.id);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100)}
      exiting={FadeOut}
      style={styles.container}
    >
      <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.albumImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Music size={24} color="#E5E7EB" />
            </View>
          )}
          
          {track.preview_url && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingIndicator} />
              ) : isCurrentlyPlaying ? (
                <Pause size={18} color="#FFFFFF" />
              ) : (
                <Play size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
          <Text style={styles.albumName} numberOfLines={1}>
            {track.album?.name || 'Unknown Album'}
          </Text>
          {ratingStats.totalRatings > 0 && (
            <View style={styles.ratingContainer}>
              <StarRating rating={ratingStats.averageRating} readonly size={12} />
              <Text style={styles.ratingText}>
                ({ratingStats.totalRatings})
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <View style={[styles.favoriteButtonBackground, isFavorite(track.id) && styles.favoriteButtonActive]}>
            <Heart
              size={18}
              color={isFavorite(track.id) ? '#FFFFFF' : '#6B7280'}
              fill={isFavorite(track.id) ? '#FFFFFF' : 'transparent'}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  albumImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  albumName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  favoriteButton: {
    marginLeft: 12,
  },
  favoriteButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#EF4444',
  },
});