import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
        placeholder="Search for music..."
      />
    );

    expect(getByPlaceholderText('Search for music...')).toBeTruthy();
  });

  it('calls onChangeText when text input changes', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
      />
    );

    const input = getByPlaceholderText('Search for music...');
    fireEvent.changeText(input, 'test query');

    expect(mockOnChangeText).toHaveBeenCalledWith('test query');
  });

  it('calls onSearch when submit is triggered', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value="test query"
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
      />
    );

    const input = getByPlaceholderText('Search for music...');
    fireEvent(input, 'submitEditing');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('shows clear button when value is not empty', () => {
    const { getByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
      />
    );

    // The clear button should be visible when there's text
    expect(() => getByTestId('clear-button')).not.toThrow();
  });

  it('clears text when clear button is pressed', () => {
    const { getByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onSearch={mockOnSearch}
      />
    );

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });
});