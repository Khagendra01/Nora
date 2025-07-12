import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { FavoriteTrack } from '@/types/music';
import { db } from '@/services/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface FavoritesState {
  favorites: FavoriteTrack[];
  isLoading: boolean;
  error: string | null;
}

type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: FavoriteTrack[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteTrack }
  | { type: 'REMOVE_FAVORITE'; payload: string };

interface FavoritesContextType extends FavoritesState {
  addToFavorites: (track: FavoriteTrack) => Promise<void>;
  removeFromFavorites: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  loadFavorites: () => void;
}

const initialState: FavoritesState = {
  favorites: [],
  isLoading: false,
  error: null,
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload, isLoading: false, error: null };
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [action.payload, ...state.favorites],
        error: null,
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.id !== action.payload),
        error: null,
      };
    default:
      return state;
  }
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user } = useAuth();

  // Real-time listener for user's favorites
  useEffect(() => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const favorites: FavoriteTrack[] = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Favorite doc data:', data);
        return { ...data } as FavoriteTrack; // The track ID is already in data.id
      });
      console.log('Favorites updated:', favorites.length, 'favorites for user:', user.uid);
      console.log('Favorite IDs:', favorites.map(f => f.id));
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    }, (error) => {
      console.error('Error in favorites listener:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load favorites' });
    });
    return () => unsub();
  }, [user]);

  const addToFavorites = async (track: FavoriteTrack) => {
    if (!user) return;
    try {
      console.log('Adding to favorites:', track.id, 'for user:', user.uid);
      const dataToStore = {
        ...track,
        userId: user.uid,
      };
      console.log('Data to store:', dataToStore);
      await addDoc(collection(db, 'favorites'), dataToStore);
      console.log('Successfully added to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to favorites' });
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    if (!user) return;
    try {
      console.log('Removing from favorites:', trackId, 'for user:', user.uid);
      // Find the favorite doc for this user and track
      const q = query(collection(db, 'favorites'), where('userId', '==', user.uid), where('id', '==', trackId));
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'documents to remove');
      snapshot.forEach(docSnap => {
        console.log('Removing document:', docSnap.id, 'with data:', docSnap.data());
        deleteDoc(doc(db, 'favorites', docSnap.id));
      });
      console.log('Successfully removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove from favorites' });
    }
  };

  const isFavorite = (trackId: string) => {
    const isFav = state.favorites.some(fav => fav.id === trackId);
    return isFav;
  };

  const loadFavorites = () => {};

  return (
    <FavoritesContext.Provider
      value={{
        ...state,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}