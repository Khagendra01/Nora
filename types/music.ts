export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  };
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
  popularity: number;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FavoriteTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl: string | null;
  addedAt: string;
}

export interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  currentTrackId: string | null;
  error: string | null;
}

export interface SearchState {
  query: string;
  results: SpotifyTrack[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}