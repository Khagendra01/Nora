import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { db } from '@/services/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface RecentlyPlayedTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl: string | null;
  playedAt: string;
  userId: string;
}

interface RecentlyPlayedState {
  recentlyPlayed: RecentlyPlayedTrack[];
  isLoading: boolean;
  error: string | null;
}

type RecentlyPlayedAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_RECENTLY_PLAYED'; payload: RecentlyPlayedTrack[] }
  | { type: 'ADD_RECENTLY_PLAYED'; payload: RecentlyPlayedTrack };

interface RecentlyPlayedContextType extends RecentlyPlayedState {
  addToRecentlyPlayed: (track: Omit<RecentlyPlayedTrack, 'userId' | 'playedAt'>) => Promise<void>;
  getRecentlyPlayed: () => RecentlyPlayedTrack[];
}

const initialState: RecentlyPlayedState = {
  recentlyPlayed: [],
  isLoading: false,
  error: null,
};

function recentlyPlayedReducer(state: RecentlyPlayedState, action: RecentlyPlayedAction): RecentlyPlayedState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_RECENTLY_PLAYED':
      return { ...state, recentlyPlayed: action.payload, isLoading: false, error: null };
    case 'ADD_RECENTLY_PLAYED':
      return {
        ...state,
        recentlyPlayed: [
          action.payload,
          ...state.recentlyPlayed.filter(track => track.id !== action.payload.id)
        ].slice(0, 50), // Keep only the 50 most recent tracks
        error: null,
      };
    default:
      return state;
  }
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextType | undefined>(undefined);

export function RecentlyPlayedProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(recentlyPlayedReducer, initialState);
  const { user } = useAuth();

  // Real-time listener for user's recently played tracks
  useEffect(() => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    const q = query(
      collection(db, 'recentlyPlayed'),
      where('userId', '==', user.uid),
      orderBy('playedAt', 'desc'),
      limit(50)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const recentlyPlayed: RecentlyPlayedTrack[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data } as RecentlyPlayedTrack;
      });
      dispatch({ type: 'SET_RECENTLY_PLAYED', payload: recentlyPlayed });
    }, (error) => {
      console.error('Error in recently played listener:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load recently played tracks' });
    });
    
    return () => unsub();
  }, [user]);

  const addToRecentlyPlayed = async (track: Omit<RecentlyPlayedTrack, 'userId' | 'playedAt'>) => {
    if (!user) return;
    
    try {
      const trackData = {
        ...track,
        userId: user.uid,
        playedAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'recentlyPlayed'), trackData);
      dispatch({ type: 'ADD_RECENTLY_PLAYED', payload: trackData });
    } catch (error) {
      console.error('Error adding to recently played:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to recently played' });
    }
  };

  const getRecentlyPlayed = () => {
    return state.recentlyPlayed;
  };

  return (
    <RecentlyPlayedContext.Provider
      value={{
        ...state,
        addToRecentlyPlayed,
        getRecentlyPlayed,
      }}
    >
      {children}
    </RecentlyPlayedContext.Provider>
  );
}

export function useRecentlyPlayed() {
  const context = useContext(RecentlyPlayedContext);
  if (context === undefined) {
    throw new Error('useRecentlyPlayed must be used within a RecentlyPlayedProvider');
  }
  return context;
} 