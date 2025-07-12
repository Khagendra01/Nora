export interface Rating {
  id: string;
  trackId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string; // For threaded replies
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this comment
}

export interface TrackRatingStats {
  trackId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CommentThread {
  comment: Comment;
  replies: Comment[];
}