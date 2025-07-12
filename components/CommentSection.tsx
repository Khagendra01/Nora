import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { MessageCircle, Heart, Reply, Trash2, Send } from 'lucide-react-native';
import { useRating } from '@/context/RatingContext';
import { Comment, CommentThread } from '@/types/rating';
import { Button } from '@/components/ui/Button';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';

interface CommentSectionProps {
  trackId: string;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReply: (parentId: string) => void;
  onLike: (commentId: string) => void;
  onUnlike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId: string;
}

function CommentItem({
  comment,
  isReply = false,
  onReply,
  onLike,
  onUnlike,
  onDelete,
  currentUserId,
}: CommentItemProps) {
  const isLiked = comment.likedBy.includes(currentUserId);
  const isOwner = comment.userId === currentUserId;

  const handleLikePress = () => {
    if (isLiked) {
      onUnlike(comment.id);
    } else {
      onLike(comment.id);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(comment.id) },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(isReply ? 200 : 100)}
      style={[styles.commentItem, isReply && styles.replyItem]}
    >
      <View style={styles.commentHeader}>
        <Text style={styles.userName}>{comment.userName}</Text>
        <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
      </View>
      
      <Text style={styles.commentContent}>{comment.content}</Text>
      
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={[styles.actionButton, isLiked && styles.likedButton]}
          onPress={handleLikePress}
        >
          <Heart
            size={14}
            color={isLiked ? '#FF3B30' : '#666666'}
            fill={isLiked ? '#FF3B30' : 'transparent'}
          />
          {comment.likes > 0 && (
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {comment.likes}
            </Text>
          )}
        </TouchableOpacity>
        
        {!isReply && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReply(comment.id)}
          >
            <Reply size={14} color="#666666" />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        )}
        
        {isOwner && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeletePress}
          >
            <Trash2 size={14} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export function CommentSection({ trackId }: CommentSectionProps) {
  const { getTrackComments, addComment, likeComment, unlikeComment, deleteComment } = useRating();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const commentThreads = getTrackComments(trackId);
  const currentUserId = 'user_001'; // In a real app, this would come from authentication

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addComment(trackId, newComment.trim());
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;
    
    addComment(trackId, replyText.trim(), parentId);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setReplyText('');
  };

  const renderCommentThread = ({ item, index }: { item: CommentThread; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.threadContainer}>
      <CommentItem
        comment={item.comment}
        onReply={handleReply}
        onLike={likeComment}
        onUnlike={unlikeComment}
        onDelete={deleteComment}
        currentUserId={currentUserId}
      />
      
      {item.replies.map((reply, replyIndex) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isReply
          onReply={handleReply}
          onLike={likeComment}
          onUnlike={unlikeComment}
          onDelete={deleteComment}
          currentUserId={currentUserId}
        />
      ))}
      
      {replyingTo === item.comment.id && (
        <Animated.View entering={FadeInUp} style={styles.replyInput}>
          <TextInput
            style={styles.textInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply..."
            placeholderTextColor="#999999"
            multiline
            autoFocus
          />
          <View style={styles.replyActions}>
            <Button
              title="Cancel"
              variant="ghost"
              size="small"
              onPress={() => setReplyingTo(null)}
              style={styles.replyButton}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleAddReply(item.comment.id)}
              disabled={!replyText.trim()}
            >
              <Send size={16} color={replyText.trim() ? '#0C121E' : '#CCCCCC'} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <Animated.View entering={FadeInUp.delay(700)} style={styles.container}>
      <View style={styles.header}>
        <MessageCircle size={20} color="#0C121E" />
        <Text style={styles.sectionTitle}>Comments ({commentThreads.length})</Text>
      </View>
      
      {/* Add Comment */}
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.textInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Share your thoughts about this track..."
          placeholderTextColor="#999999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Send size={16} color={newComment.trim() ? '#0C121E' : '#CCCCCC'} />
        </TouchableOpacity>
      </View>
      
      {/* Comments List */}
      {commentThreads.length > 0 ? (
        <FlatList
          data={commentThreads}
          renderItem={renderCommentThread}
          keyExtractor={(item) => item.comment.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable scroll since it's inside a ScrollView
        />
      ) : (
        <View style={styles.emptyState}>
          <MessageCircle size={32} color="#CCCCCC" />
          <Text style={styles.emptyText}>No comments yet</Text>
          <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C121E',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0C121E',
    maxHeight: 80,
    minHeight: 40,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentsList: {
    maxHeight: 400, // Limit height to prevent infinite scroll issues
  },
  threadContainer: {
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  replyItem: {
    marginLeft: 20,
    backgroundColor: '#F8F8F8',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C121E',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  commentContent: {
    fontSize: 14,
    color: '#0C121E',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likedButton: {
    // Additional styling for liked state if needed
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
  },
  likedText: {
    color: '#FF3B30',
  },
  replyInput: {
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  replyButton: {
    flex: 0,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});