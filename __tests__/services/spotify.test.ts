import { spotifyService } from '@/services/spotify';

// Mock fetch
global.fetch = jest.fn();

describe('SpotifyService', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTracks', () => {
    it('returns empty array for empty query', async () => {
      const result = await spotifyService.searchTracks('');
      expect(result).toEqual([]);
    });

    it('returns empty array for whitespace query', async () => {
      const result = await spotifyService.searchTracks('   ');
      expect(result).toEqual([]);
    });

    it('handles successful search response', async () => {
      const mockTracks = [
        {
          id: '1',
          name: 'Test Track',
          artists: [{ id: '1', name: 'Test Artist' }],
          album: {
            id: '1',
            name: 'Test Album',
            images: [],
            release_date: '2023-01-01',
          },
          duration_ms: 180000,
          explicit: false,
          external_urls: { spotify: 'https://open.spotify.com/track/1' },
          preview_url: null,
          popularity: 80,
        },
      ];

      // Mock authentication response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'mock_token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      } as Response);

      // Mock search response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          tracks: {
            items: mockTracks,
            total: 1,
            limit: 20,
            offset: 0,
          },
        }),
      } as Response);

      const result = await spotifyService.searchTracks('test');
      expect(result).toEqual(mockTracks);
    });

    it('handles authentication failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(spotifyService.searchTracks('test')).rejects.toThrow(
        'Failed to authenticate with Spotify API'
      );
    });

    it('handles search API failure', async () => {
      // Mock successful authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'mock_token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      } as Response);

      // Mock failed search
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(spotifyService.searchTracks('test')).rejects.toThrow(
        'Failed to search tracks. Please try again.'
      );
    });
  });
});