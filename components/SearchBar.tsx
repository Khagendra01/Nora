import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSearch = () => {},
  placeholder = 'Search for music...',
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  const handleSubmit = useCallback(() => {
    if (value.trim()) {
      onSearch?.(value.trim());
    }
  }, [value, onSearch]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.focused]}>
        <View style={styles.searchIconContainer}>
          <Search size={20} color={isFocused ? "#667eea" : "#9CA3AF"} />
        </View>
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {value.length > 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <View style={styles.clearButtonBackground}>
                <X size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  focused: {
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    paddingVertical: 14,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    marginRight: 4,
  },
  clearButtonBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});