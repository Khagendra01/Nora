import * as FileSystem from 'expo-file-system';
import { SpotifyTrack } from '@/types/music';
import { spotifyService } from './spotify';

// RapidAPI Shazam configuration
const SHAZAM_API_KEY = process.env.EXPO_PUBLIC_SHAZAM_API_KEY || '';
const SHAZAM_API_HOST = process.env.EXPO_PUBLIC_SHAZAM_API_HOST || '';
const SHAZAM_API_URL = process.env.EXPO_PUBLIC_SHAZAM_API_URL || '';

export interface ShazamResponse {
  matches?: Array<{
    id: string;
    offset: number;
    timeskew: number;
    frequencyskew: number;
  }>;
  location?: {
    accuracy: number;
  };
  timestamp: number;
  timezone: string;
  track?: {
    layout: string;
    type: string;
    key: string;
    title: string;
    subtitle: string;
    images?: {
      background?: string;
      coverart?: string;
      coverarthq?: string;
      joecolor?: string;
    };
    share?: {
      subject: string;
      text: string;
      href: string;
      image: string;
      twitter: string;
      html: string;
      avatar: string;
      snapchat: string;
    };
    hub?: {
      type: string;
      image: string;
      actions: Array<{
        name: string;
        type: string;
        id?: string;
        uri?: string;
      }>;
      explicit: boolean;
      displayname: string;
      options: Array<{
        caption: string;
        actions: Array<{
          name: string;
          type: string;
          uri: string;
        }>;
        beacondata: {
          type: string;
          providername: string;
        };
        image: string;
        type: string;
        listcaption: string;
        overflowimage: string;
        colouroverflowimage: boolean;
        providername: string;
      }>;
    };
    sections?: Array<{
      type: string;
      metapages?: Array<{
        image: string;
        caption: string;
      }>;
      tabname: string;
      metadata?: Array<{
        title: string;
        text: string;
      }>;
      url?: string;
    }>;
    url: string;
    artists?: Array<{
      alias: string;
      id: string;
      adamid: string;
    }>;
    alias: string;
    genres?: {
      primary: string;
    };
    urlparams?: {
      [key: string]: string;
    };
    highlightsurls?: object;
    relatedtracksurl?: string;
    albumadamid?: string;
    trackadamid?: string;
    releasedate?: string;
    isrc?: string;
  };
  tagid: string;
}

class ShazamService {

  async recognizeSong(audioUri: string, duration: number): Promise<SpotifyTrack[]> {
    try {
      console.log('Starting Shazam recognition for:', audioUri);
      
      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('upload_file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a'
      } as any);
      
      // Make API request to Shazam
      const response = await fetch(SHAZAM_API_URL, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': SHAZAM_API_KEY,
          'x-rapidapi-host': SHAZAM_API_HOST,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shazam API error:', response.status, errorText);
        throw new Error(`Shazam API error: ${response.status}`);
      }

      const data: ShazamResponse = await response.json();
      console.log('Shazam response:', data);

      // Convert Shazam response to Spotify tracks
      if (data.track) {
        try {
          // Search Spotify for the recognized track
          const searchQuery = `${data.track.title} ${data.track.subtitle}`;
          console.log('Searching Spotify for:', searchQuery);
          
          const spotifyTracks = await spotifyService.searchTracks(searchQuery, 5);
          
          if (spotifyTracks.length > 0) {
            console.log('Found Spotify tracks:', spotifyTracks.length);
            return spotifyTracks;
          } else {
            console.log('No Spotify tracks found, creating fallback track');
            // Create a fallback track if Spotify search fails
            const fallbackTrack: SpotifyTrack = {
              id: data.track.key || data.tagid || `shazam_${Date.now()}`,
              name: data.track.title,
              artists: data.track.artists ? data.track.artists.map(artist => ({
                name: artist.alias,
                id: artist.id,
              })) : [
                {
                  name: data.track.subtitle,
                  id: `shazam_artist_${Date.now()}`,
                }
              ],
              album: {
                id: data.track.albumadamid || `shazam_album_${Date.now()}`,
                name: data.track.subtitle,
                images: data.track.images ? [
                  {
                    url: data.track.images.coverart || data.track.images.background || '',
                    width: 300,
                    height: 300,
                  }
                ] : [],
                release_date: data.track.releasedate || new Date().toISOString().split('T')[0],
              },
              duration_ms: duration * 1000,
              explicit: data.track.hub?.explicit || false,
              external_urls: {
                spotify: data.track.url,
              },
              preview_url: data.track.hub?.actions?.find(action => action.type === 'uri')?.uri || null,
              popularity: 0,
            };
            return [fallbackTrack];
          }
        } catch (spotifyError) {
          console.error('Spotify search error:', spotifyError);
          // Return fallback track if Spotify search fails
          const fallbackTrack: SpotifyTrack = {
            id: data.track.key || data.tagid || `shazam_${Date.now()}`,
            name: data.track.title,
            artists: data.track.artists ? data.track.artists.map(artist => ({
              name: artist.alias,
              id: artist.id,
            })) : [
              {
                name: data.track.subtitle,
                id: `shazam_artist_${Date.now()}`,
              }
            ],
            album: {
              id: data.track.albumadamid || `shazam_album_${Date.now()}`,
              name: data.track.subtitle,
              images: data.track.images ? [
                {
                  url: data.track.images.coverart || data.track.images.background || '',
                  width: 300,
                  height: 300,
                }
              ] : [],
              release_date: data.track.releasedate || new Date().toISOString().split('T')[0],
            },
            duration_ms: duration * 1000,
            explicit: data.track.hub?.explicit || false,
            external_urls: {
              spotify: data.track.url,
            },
            preview_url: data.track.hub?.actions?.find(action => action.type === 'uri')?.uri || null,
            popularity: 0,
          };
          return [fallbackTrack];
        }
      }

      return [];
    } catch (error) {
      console.error('Shazam recognition error:', error);
      throw new Error('Failed to recognize song');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://shazam-api-free.p.rapidapi.com/charts/get-top-songs-in-city?country_code=US&city_name=Chicago&limit=1', {
        headers: {
          'x-rapidapi-key': SHAZAM_API_KEY,
          'x-rapidapi-host': SHAZAM_API_HOST
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Shazam connection test failed:', error);
      return false;
    }
  }
}

export const shazamService = new ShazamService(); 