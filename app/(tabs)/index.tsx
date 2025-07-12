import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Search, TrendingUp, Clock, Heart, LogOut } from 'lucide-react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { useRecentlyPlayed } from '@/context/RecentlyPlayedContext';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { favorites } = useFavorites();
  const { recentlyPlayed } = useRecentlyPlayed();
  const { user, logOut } = useAuth();
  
  const recentFavorites = favorites.slice(0, 3);
  const recentPlayedTracks = recentlyPlayed.slice(0, 3);

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.appName}>Nora</Text>
          </View>
          {user && (
            <TouchableOpacity style={styles.logoutButton} onPress={logOut}> 
              <View style={styles.logoutContent}>
                <Text style={styles.logoutText}>Logout</Text>
                <LogOut size={20} color="#0C121E" />
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Quick Search */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <TouchableOpacity style={styles.quickSearchCard} onPress={handleSearchPress}>
            <View style={styles.quickSearchContent}>
              <Search size={20} color="#666666" />
              <Text style={styles.quickSearchText}>Search for music...</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Favorites */}
        {recentFavorites.length > 0 && (
          <Animated.View entering={FadeInLeft.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Heart size={20} color="#0C121E" />
                <Text style={styles.sectionTitle}>Recent Favorites</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/favorites')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.favoritesGrid}>
              {recentFavorites.map((favorite, index) => (
                <Animated.View
                  key={favorite.id}
                  entering={FadeInUp.delay(400 + index * 100)}
                  style={styles.favoriteCard}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/track/${favorite.id}`)}
                    activeOpacity={0.7}
                  >
                    {favorite.imageUrl ? (
                      <Image source={{ uri: favorite.imageUrl }} style={styles.favoriteImage} />
                    ) : (
                      <View style={styles.favoritePlaceholder} />
                    )}
                    <Text style={styles.favoriteTitle} numberOfLines={1}>
                      {favorite.name}
                    </Text>
                    <Text style={styles.favoriteArtist} numberOfLines={1}>
                      {favorite.artist}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Trending Section */}
        <Animated.View entering={FadeInLeft.delay(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={20} color="#0C121E" />
              <Text style={styles.sectionTitle}>Trending Now</Text>
            </View>
          </View>
          
          <View style={styles.trendingContainer}>
            <TouchableOpacity style={styles.trendingCard} onPress={handleSearchPress}>
              <Text style={styles.trendingText}>Discover trending music</Text>
              <Text style={styles.trendingSubtext}>Explore what's popular right now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recently Played */}
        <Animated.View entering={FadeInLeft.delay(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Clock size={20} color="#0C121E" />
              <Text style={styles.sectionTitle}>Recently Played</Text>
            </View>
            {recentPlayedTracks.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/recently-played')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {recentPlayedTracks.length > 0 ? (
            <View style={styles.favoritesGrid}>
              {recentPlayedTracks.map((track, index) => (
                <Animated.View
                  key={track.id}
                  entering={FadeInUp.delay(700 + index * 100)}
                  style={styles.favoriteCard}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/track/${track.id}`)}
                    activeOpacity={0.7}
                  >
                    {track.imageUrl ? (
                      <Image source={{ uri: track.imageUrl }} style={styles.favoriteImage} />
                    ) : (
                      <View style={styles.favoritePlaceholder} />
                    )}
                    <Text style={styles.favoriteTitle} numberOfLines={1}>
                      {track.name}
                    </Text>
                    <Text style={styles.favoriteArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent tracks</Text>
              <Text style={styles.emptyStateSubtext}>Start listening to see your recent tracks here</Text>
            </View>
          )}
        </Animated.View>
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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C121E',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  quickSearchCard: {
    marginHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  quickSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickSearchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C121E',
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#0C121E',
    fontWeight: '500',
  },
  favoritesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  favoriteImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  favoritePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C121E',
    marginBottom: 2,
  },
  favoriteArtist: {
    fontSize: 12,
    color: '#666666',
  },
  trendingContainer: {
    paddingHorizontal: 16,
  },
  trendingCard: {
    backgroundColor: '#0C121E',
    borderRadius: 12,
    padding: 20,
  },
  trendingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trendingSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0C121E',
  },
});