import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Rating, Comment, TrackRatingStats, CommentThread } from '@/types/rating';
import { db } from '@/services/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface RatingState {
  ratings: Rating[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

type RatingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RATINGS'; payload: Rating[] }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_RATING'; payload: Rating }
  | { type: 'UPDATE_RATING'; payload: Rating }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'LIKE_COMMENT'; payload: { commentId: string; userId: string } }
  | { type: 'UNLIKE_COMMENT'; payload: { commentId: string; userId: string } };

interface RatingContextType extends RatingState {
  addRating: (trackId: string, rating: number, comment?: string) => Promise<void>;
  updateRating: (ratingId: string, rating: number, comment?: string) => Promise<void>;
  addComment: (trackId: string, content: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  getTrackRating: (trackId: string) => Rating | undefined;
  getTrackRatingStats: (trackId: string) => TrackRatingStats;
  getTrackComments: (trackId: string) => CommentThread[];
  loadData: () => void;
}

const initialState: RatingState = {
  ratings: [],
  comments: [],
  isLoading: false,
  error: null,
};

function ratingReducer(state: RatingState, action: RatingAction): RatingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_RATINGS':
      return { ...state, ratings: action.payload, isLoading: false, error: null };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload, isLoading: false, error: null };
    case 'ADD_RATING':
      return {
        ...state,
        ratings: [action.payload, ...state.ratings.filter(r => r.trackId !== action.payload.trackId || r.userId !== action.payload.userId)],
        error: null,
      };
    case 'UPDATE_RATING':
      return {
        ...state,
        ratings: state.ratings.map(r => r.id === action.payload.id ? action.payload : r),
        error: null,
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [action.payload, ...state.comments],
        error: null,
      };
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c => c.id === action.payload.id ? action.payload : c),
        error: null,
      };
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.payload),
        error: null,
      };
    case 'LIKE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c => 
          c.id === action.payload.commentId 
            ? { 
                ...c, 
                likes: c.likes + 1, 
                likedBy: [...c.likedBy, action.payload.userId] 
              }
            : c
        ),
        error: null,
      };
    case 'UNLIKE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c => 
          c.id === action.payload.commentId 
            ? { 
                ...c, 
                likes: c.likes - 1, 
                likedBy: c.likedBy.filter(id => id !== action.payload.userId) 
              }
            : c
        ),
        error: null,
      };
    default:
      return state;
  }
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export function RatingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ratingReducer, initialState);
  const { user } = useAuth();

  // Real-time listeners for ratings and comments
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const unsubRatings = onSnapshot(collection(db, 'ratings'), (snapshot) => {
        const ratings: Rating[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Rating);
        dispatch({ type: 'SET_RATINGS', payload: ratings });
      }, (error) => {
        console.error('Firestore ratings listener error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load ratings' });
      });
      
      const unsubComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
        const comments: Comment[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Comment);
        dispatch({ type: 'SET_COMMENTS', payload: comments });
      }, (error) => {
        console.error('Firestore comments listener error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load comments' });
      });
      
      return () => {
        unsubRatings();
        unsubComments();
      };
    } catch (error) {
      console.error('Firestore initialization error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize Firestore' });
    }
  }, []);

  const addRating = async (trackId: string, rating: number, comment?: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'ratings'), {
        trackId,
        userId: user.uid,
        userName: user.email,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add rating' });
    }
  };

  const updateRating = async (ratingId: string, rating: number, comment?: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'ratings', ratingId), {
        rating,
        comment,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update rating' });
    }
  };

  const addComment = async (trackId: string, content: string, parentId?: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'comments'), {
        trackId,
        userId: user.uid,
        userName: user.email,
        content,
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add comment' });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete comment' });
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) return;
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDocs(query(collection(db, 'comments'), where('__name__', '==', commentId)));
      const comment = commentDoc.docs[0]?.data();
      
      if (comment && !comment.likedBy?.includes(user.uid)) {
        await updateDoc(commentRef, {
          likes: (comment.likes || 0) + 1,
          likedBy: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to like comment' });
    }
  };

  const unlikeComment = async (commentId: string) => {
    if (!user) return;
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDocs(query(collection(db, 'comments'), where('__name__', '==', commentId)));
      const comment = commentDoc.docs[0]?.data();
      
      if (comment && comment.likedBy?.includes(user.uid)) {
        await updateDoc(commentRef, {
          likes: Math.max((comment.likes || 0) - 1, 0),
          likedBy: arrayRemove(user.uid),
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to unlike comment' });
    }
  };

  const getTrackRating = (trackId: string): Rating | undefined => {
    if (!user) return undefined;
    return state.ratings.find(r => r.trackId === trackId && r.userId === user.uid);
  };

  const getTrackRatingStats = (trackId: string): TrackRatingStats => {
    const trackRatings = state.ratings.filter(r => r.trackId === trackId);
    const totalRatings = trackRatings.length;
    
    if (totalRatings === 0) {
      return {
        trackId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = trackRatings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = sum / totalRatings;

    const ratingDistribution = trackRatings.reduce((acc, r) => {
      acc[r.rating as keyof typeof acc]++;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      trackId,
      averageRating,
      totalRatings,
      ratingDistribution,
    };
  };

  const getTrackComments = (trackId: string): CommentThread[] => {
    const trackComments = state.comments.filter(c => c.trackId === trackId);
    const parentComments = trackComments.filter(c => !c.parentId);
    
    return parentComments.map(parent => ({
      comment: parent,
      replies: trackComments
        .filter(c => c.parentId === parent.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    })).sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
  };

  const loadData = () => {};

  return (
    <RatingContext.Provider
      value={{
        ...state,
        addRating,
        updateRating,
        addComment,
        deleteComment,
        likeComment,
        unlikeComment,
        getTrackRating,
        getTrackRatingStats,
        getTrackComments,
        loadData,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
}

export function useRating() {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
}