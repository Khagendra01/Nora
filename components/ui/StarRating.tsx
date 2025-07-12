import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  showHalfStars?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  showHalfStars = true,
}: StarRatingProps) {
  const handleStarPress = (starIndex: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starIndex + 1);
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = rating >= starRating;
    const isHalfFilled = showHalfStars && rating >= starRating - 0.5 && rating < starRating;

    return (
      <TouchableOpacity
        key={index}
        style={styles.starContainer}
        onPress={() => handleStarPress(index)}
        disabled={readonly}
        activeOpacity={readonly ? 1 : 0.7}
      >
        <Star
          size={size}
          color={isFilled || isHalfFilled ? '#FFD700' : '#CCCCCC'}
          fill={isFilled ? '#FFD700' : isHalfFilled ? '#FFD700' : 'transparent'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((_, index) => renderStar(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
});