import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { spotifyService } from '@/services/spotify';
import { SearchBar } from '@/components/SearchBar';
import { TrackCard } from '@/components/TrackCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SpotifyTrack, SearchState } from '@/types/music';
import { Search as SearchIcon, Mic, Music, Sparkles } from 'lucide-react-native';
import { useDebounce } from '@/hooks/useDebounce';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchScreen() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchState.query, 500);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      handleSearch(debouncedQuery);
    } else if (debouncedQuery.trim().length === 0) {
      // Clear results when query is empty
      setSearchState(prev => ({
        ...prev,
        results: [],
        hasSearched: false,
        error: null,
      }));
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      hasSearched: true,
    }));

    try {
      const results = await spotifyService.searchTracks(query);
      setSearchState(prev => ({
        ...prev,
        results,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setSearchState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        results: [],
      }));
      
      Alert.alert('Search Error', errorMessage);
    }
  }, []);

  const handleQueryChange = useCallback((text: string) => {
    setSearchState(prev => ({ ...prev, query: text }));
  }, []);

  const handleVoiceSearchResults = useCallback((tracks: SpotifyTrack[]) => {
    setSearchState(prev => ({
      ...prev,
      results: tracks,
      isLoading: false,
      hasSearched: true,
      error: null,
    }));
  }, []);

  const handleVoiceSearchError = useCallback((error: string) => {
    setSearchState(prev => ({
      ...prev,
      error: error,
      isLoading: false,
    }));
    Alert.alert('Voice Search Error', error);
  }, []);

  const renderTrack = useCallback(({ item, index }: { item: SpotifyTrack; index: number }) => (
    <TrackCard track={item} index={index} />
  ), []);

  const renderEmptyState = () => {
    if (searchState.isLoading) {
      return (
        <Animated.View entering={FadeIn} style={styles.centerContainer}>
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={40} />
            <Text style={styles.loadingText}>Searching for your music...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        </Animated.View>
      );
    }

    if (searchState.error) {
      return (
        <Animated.View entering={FadeIn} style={styles.centerContainer}>
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <Text style={styles.errorText}>Oops! Something went wrong</Text>
            <Text style={styles.errorSubtext}>{searchState.error}</Text>
          </View>
        </Animated.View>
      );
    }

    if (searchState.hasSearched && searchState.results.length === 0) {
      return (
        <Animated.View entering={FadeIn} style={styles.centerContainer}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Music size={48} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try searching with different keywords or use voice search</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInUp.delay(200)} style={styles.centerContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.welcomeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeIconContainer}>
            <SearchIcon size={32} color="#FFFFFF" />
            <Sparkles size={16} color="#FFFFFF" style={styles.sparkleIcon} />
          </View>
        </LinearGradient>
        <Text style={styles.welcomeText}>Discover Your Music</Text>
        <Text style={styles.welcomeSubtext}>
          Search for your favorite tracks, artists, and albums
        </Text>
        <View style={styles.voiceSearchHint}>
          <View style={styles.voiceSearchIconContainer}>
            <Mic size={16} color="#667eea" />
          </View>
          <Text style={styles.voiceSearchHintText}>
            Or use voice search to find songs by humming or singing
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FF']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Find your next favorite song</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchState.query}
          onChangeText={handleQueryChange}
          onSearch={() => {}} // No longer needed since we auto-search
          autoFocus={false}
          placeholder="Search for music... (min 2 characters)"
        />

        <VoiceSearchButton
          onResultsFound={handleVoiceSearchResults}
          onError={handleVoiceSearchError}
          disabled={searchState.isLoading}
        />
      </View>

      <FlatList
        data={searchState.results}
        renderItem={renderTrack}
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
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeIconContainer: {
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  voiceSearchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 280,
  },
  voiceSearchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceSearchHintText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});