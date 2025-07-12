import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StarRating } from '@/components/ui/StarRating';
import { useRating } from '@/context/RatingContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface RatingSectionProps {
  trackId: string;
}

export function RatingSection({ trackId }: RatingSectionProps) {
  const { getTrackRating, getTrackRatingStats, addRating, updateRating } = useRating();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const userRating = getTrackRating(trackId);
  const stats = getTrackRatingStats(trackId);

  const handleStartEdit = () => {
    setTempRating(userRating?.rating || 0);
    setTempComment(userRating?.comment || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (tempRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before saving.');
      return;
    }

    setIsSaving(true);
    try {
      if (userRating) {
        await updateRating(userRating.id, tempRating, tempComment.trim() || undefined);
      } else {
        await addRating(trackId, tempRating, tempComment.trim() || undefined);
      }

      setIsEditing(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save rating. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempRating(userRating?.rating || 0);
    setTempComment(userRating?.comment || '');
    setIsEditing(false);
  };

  return (
    <Animated.View entering={FadeInUp.delay(600)} style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rating & Review</Text>
        {stats.totalRatings > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>{stats.totalRatings} ratings</Text>
          </View>
        )}
      </View>
      
      {/* Overall Stats */}
      <View style={styles.statsContainer}>
        {stats.totalRatings > 0 ? (
          <View style={styles.averageRating}>
            <Text style={styles.averageNumber}>{stats.averageRating.toFixed(1)}</Text>
            <StarRating rating={stats.averageRating} readonly size={16} />
            <Text style={styles.totalRatings}>({stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''})</Text>
          </View>
        ) : (
          <View style={styles.noRatingsContainer}>
            <Text style={styles.noRatingsText}>No ratings yet</Text>
            <Text style={styles.noRatingsSubtext}>Be the first to rate this track!</Text>
          </View>
        )}
      </View>

      {/* User Rating */}
      <View style={styles.userRatingContainer}>
        {!user && (
          <View style={styles.authNotice}>
            <Text style={styles.authNoticeText}>🔐 Sign in to save your ratings</Text>
          </View>
        )}
        {!isEditing ? (
          <View style={styles.displayMode}>
            {userRating ? (
              <View>
                <View style={styles.userRatingHeader}>
                  <Text style={styles.userRatingLabel}>Your Rating:</Text>
                  <TouchableOpacity onPress={handleStartEdit} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.userRatingDisplay}>
                  <StarRating rating={userRating.rating} readonly size={20} />
                  <Text style={styles.userRatingValue}>{userRating.rating}/5</Text>
                </View>
                {userRating.comment && (
                  <Text style={styles.userComment}>{userRating.comment}</Text>
                )}
                <Text style={styles.ratingDate}>
                  Rated on {new Date(userRating.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addRatingButton} 
                onPress={handleStartEdit}
                disabled={!user}
              >
                <Text style={styles.addRatingText}>
                  {user ? 'Add Your Rating' : 'Sign in to Rate'}
                </Text>
                <Text style={styles.addRatingSubtext}>
                  {user ? 'Share your thoughts about this track' : 'You need to be signed in to rate tracks'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.editMode}>
            <Text style={styles.editLabel}>Rate this track:</Text>
            <StarRating
              rating={tempRating}
              onRatingChange={setTempRating}
              size={24}
            />
            
            <TextInput
              style={styles.commentInput}
              value={tempComment}
              onChangeText={setTempComment}
              placeholder="Write a review (optional)..."
              placeholderTextColor="#999999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <View style={styles.editButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                size="small"
                onPress={handleCancel}
                style={styles.cancelButton}
              />
              <Button
                title={isSaving ? "Saving..." : "Save"}
                variant="primary"
                size="small"
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isSaving}
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Success Message */}
      {showSuccessMessage && (
        <Animated.View entering={FadeInUp.delay(100)} style={styles.successMessage}>
          <Text style={styles.successText}>✓ Rating saved successfully!</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C121E',
  },
  ratingBadge: {
    backgroundColor: '#0C121E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C121E',
  },
  totalRatings: {
    fontSize: 14,
    color: '#666666',
  },
  noRatingsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noRatingsText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  noRatingsSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  userRatingContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  displayMode: {
    minHeight: 60,
    justifyContent: 'center',
  },
  userRatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userRatingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C121E',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0C121E',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  userComment: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    lineHeight: 20,
  },
  userRatingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  userRatingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C121E',
  },
  ratingDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  addRatingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addRatingText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  addRatingSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  editMode: {
    gap: 16,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C121E',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0C121E',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  authNotice: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  authNoticeText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
});