import { SpotifySearchResponse, SpotifyAuthResponse, SpotifyTrack } from '@/types/music';

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Spotify');
      }

      const data: SpotifyAuthResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      throw new Error('Failed to authenticate with Spotify API');
    }
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const token = await this.authenticate();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data: SpotifySearchResponse = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error('Spotify search error:', error);
      throw new Error('Failed to search tracks. Please try again.');
    }
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spotify track fetch error:', error);
      throw new Error('Failed to fetch track details');
    }
  }
}

export const spotifyService = new SpotifyService();