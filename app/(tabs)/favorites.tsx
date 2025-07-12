import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Play, Pause, Trash2 } from 'lucide-react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { useAudio } from '@/hooks/useAudio';
import { FavoriteTrack } from '@/types/music';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

export default function FavoritesScreen() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { audioState, togglePlaybackWithTrack } = useAudio();

  const handleTrackPress = (trackId: string) => {
    router.push({
      pathname: '/track/[id]',
      params: { id: trackId },
    });
  };

  const handlePlayPress = (track: FavoriteTrack) => {
    if (track.previewUrl) {
      togglePlaybackWithTrack(
        track.previewUrl, 
        track.id,
        {
          name: track.name,
          artist: track.artist,
          album: track.album,
          imageUrl: track.imageUrl,
        }
      );
    }
  };

  const renderFavorite = ({ item, index }: { item: FavoriteTrack; index: number }) => {
    const isCurrentlyPlaying = audioState.isPlaying && audioState.currentTrackId === item.id;
    const isLoading = audioState.isLoading && audioState.currentTrackId === item.id;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100)}
        exiting={FadeOut}
        style={styles.favoriteCard}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleTrackPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />
            ) : (
              <View style={styles.placeholderImage} />
            )}
            
            {item.previewUrl && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handlePlayPress(item)}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingIndicator} />
                ) : isCurrentlyPlaying ? (
                  <Pause size={16} color="#FFFFFF" />
                ) : (
                  <Play size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {item.artist}
            </Text>
            <Text style={styles.albumName} numberOfLines={1}>
              {item.album}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromFavorites(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#FF3B30" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtext}>
        Start adding tracks to your favorites by tapping the heart icon
      </Text>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => router.push('/search')}
      >
        <Text style={styles.searchButtonText}>Discover Music</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        {favorites.length > 0 && (
          <Text style={styles.count}>{favorites.length} track{favorites.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C121E',
  },
  count: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  favoriteCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
    color: '#0C121E',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  albumName: {
    fontSize: 12,
    color: '#999999',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0C121E',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  searchButton: {
    backgroundColor: '#0C121E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});