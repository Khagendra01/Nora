import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { RatingProvider } from '@/context/RatingContext';
import { RecentlyPlayedProvider } from '@/context/RecentlyPlayedContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AuthGate>
        <FavoritesProvider>
          <RatingProvider>
            <RecentlyPlayedProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="track/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </RecentlyPlayedProvider>
          </RatingProvider>
        </FavoritesProvider>
      </AuthGate>
    </AuthProvider>
  );
}