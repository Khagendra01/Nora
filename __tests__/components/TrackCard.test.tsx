import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrackCard } from '@/components/TrackCard';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { SpotifyTrack } from '@/types/music';

// Mock router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock audio hook
jest.mock('@/hooks/useAudio', () => ({
  useAudio: () => ({
    audioState: {
      isLoading: false,
      isPlaying: false,
      currentTrackId: null,
      error: null,
    },
    togglePlayback: jest.fn(),
    togglePlaybackWithTrack: jest.fn(),
  }),
}));

const mockTrack: SpotifyTrack = {
  id: '1',
  name: 'Test Track',
  artists: [{ id: '1', name: 'Test Artist' }],
  album: {
    id: '1',
    name: 'Test Album',
    images: [{ url: 'https://example.com/image.jpg', height: 300, width: 300 }],
    release_date: '2023-01-01',
  },
  duration_ms: 180000,
  explicit: false,
  external_urls: { spotify: 'https://open.spotify.com/track/1' },
  preview_url: 'https://example.com/preview.mp3',
  popularity: 80,
};

function TrackCardWithProvider({ track, index }: { track: SpotifyTrack; index: number }) {
  return (
    <FavoritesProvider>
      <TrackCard track={track} index={index} />
    </FavoritesProvider>
  );
}

describe('TrackCard', () => {
  it('renders track information correctly', () => {
    const { getByText } = render(
      <TrackCardWithProvider track={mockTrack} index={0} />
    );

    expect(getByText('Test Track')).toBeTruthy();
    expect(getByText('Test Artist')).toBeTruthy();
    expect(getByText('Test Album')).toBeTruthy();
  });

  it('shows play button when preview is available', () => {
    const { getByTestId } = render(
      <TrackCardWithProvider track={mockTrack} index={0} />
    );

    expect(() => getByTestId('play-button')).not.toThrow();
  });

  it('does not show play button when preview is not available', () => {
    const trackWithoutPreview = { ...mockTrack, preview_url: null };
    const { queryByTestId } = render(
      <TrackCardWithProvider track={trackWithoutPreview} index={0} />
    );

    expect(queryByTestId('play-button')).toBeNull();
  });

  it('handles favorite button press', () => {
    const { getByTestId } = render(
      <TrackCardWithProvider track={mockTrack} index={0} />
    );

    const favoriteButton = getByTestId('favorite-button');
    fireEvent.press(favoriteButton);

    // The button should be pressable without errors
    expect(favoriteButton).toBeTruthy();
  });
});