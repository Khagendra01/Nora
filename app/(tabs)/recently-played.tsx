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
import { Play, Pause, Clock } from 'lucide-react-native';
import { useRecentlyPlayed } from '@/context/RecentlyPlayedContext';
import { useAudio } from '@/hooks/useAudio';
import { RecentlyPlayedTrack } from '@/context/RecentlyPlayedContext';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

export default function RecentlyPlayedScreen() {
  const { recentlyPlayed } = useRecentlyPlayed();
  const { audioState, togglePlaybackWithTrack } = useAudio();

  const handleTrackPress = (trackId: string) => {
    router.push({
      pathname: '/track/[id]',
      params: { id: trackId },
    });
  };

  const handlePlayPress = (track: RecentlyPlayedTrack) => {
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

  const renderTrack = ({ item, index }: { item: RecentlyPlayedTrack; index: number }) => {
    const isCurrentlyPlaying = audioState.isPlaying && audioState.currentTrackId === item.id;
    const isLoading = audioState.isLoading && audioState.currentTrackId === item.id;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100)}
        exiting={FadeOut}
        style={styles.trackCard}
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
            <Text style={styles.playedAt}>
              {new Date(item.playedAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Played</Text>
      </View>

      {recentlyPlayed.length > 0 ? (
        <FlatList
          data={recentlyPlayed}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Clock size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No recently played tracks</Text>
          <Text style={styles.emptyStateSubtext}>
            Start listening to music to see your recently played tracks here
          </Text>
        </View>
      )}
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
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C121E',
  },
  listContainer: {
    paddingBottom: 20,
  },
  trackCard: {
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
    marginBottom: 2,
  },
  playedAt: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 