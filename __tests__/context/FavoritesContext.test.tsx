import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import { FavoriteTrack } from '@/types/music';

const mockTrack: FavoriteTrack = {
  id: '1',
  name: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  imageUrl: 'https://example.com/image.jpg',
  previewUrl: 'https://example.com/preview.mp3',
  addedAt: '2023-01-01T00:00:00Z',
};

function TestComponent() {
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  return (
    <>
      <Text testID="favorites-count">{favorites.length}</Text>
      <Text testID="is-favorite">{isFavorite('1').toString()}</Text>
      <TouchableOpacity testID="add-favorite" onPress={() => addToFavorites(mockTrack)}>
        <Text>Add Favorite</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="remove-favorite" onPress={() => removeFromFavorites('1')}>
        <Text>Remove Favorite</Text>
      </TouchableOpacity>
    </>
  );
}

describe('FavoritesContext', () => {
  it('provides initial empty favorites', () => {
    const { getByTestId } = render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    );

    expect(getByTestId('favorites-count').props.children).toBe(0);
    expect(getByTestId('is-favorite').props.children).toBe('false');
  });

  it('adds track to favorites', async () => {
    const { getByTestId } = render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    );

    fireEvent.press(getByTestId('add-favorite'));

    await waitFor(() => {
      expect(getByTestId('favorites-count').props.children).toBe(1);
      expect(getByTestId('is-favorite').props.children).toBe('true');
    });
  });

  it('removes track from favorites', async () => {
    const { getByTestId } = render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    );

    // Add then remove
    fireEvent.press(getByTestId('add-favorite'));
    
    await waitFor(() => {
      expect(getByTestId('favorites-count').props.children).toBe(1);
    });

    fireEvent.press(getByTestId('remove-favorite'));

    await waitFor(() => {
      expect(getByTestId('favorites-count').props.children).toBe(0);
      expect(getByTestId('is-favorite').props.children).toBe('false');
    });
  });
});