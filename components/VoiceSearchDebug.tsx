import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { shazamService } from '@/services/shazam';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { SpotifyTrack } from '@/types/music';

export function VoiceSearchDebug() {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testResults, setTestResults] = useState<SpotifyTrack[]>([]);

  const handleVoiceSearchResults = (tracks: SpotifyTrack[]) => {
    setTestResults(tracks);
    setDebugInfo(`Voice search successful! Found ${tracks.length} tracks.`);
  };

  const handleVoiceSearchError = (error: string) => {
    setDebugInfo(`Voice search error: ${error}`);
  };

  const testShazamAPI = async () => {
    try {
      setDebugInfo('Testing Shazam API connection...');
      
      const isConnected = await shazamService.testConnection();
      setDebugInfo(`API Connection: ${isConnected ? 'Success' : 'Failed'}`);
    } catch (error) {
      setDebugInfo(`API Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Search Debug</Text>
      
      <VoiceSearchButton
        onResultsFound={handleVoiceSearchResults}
        onError={handleVoiceSearchError}
      />
      
      <TouchableOpacity style={styles.button} onPress={testShazamAPI}>
        <Text style={styles.buttonText}>Test Shazam API Connection</Text>
      </TouchableOpacity>
      
      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((track, index) => (
            <Text key={track.id} style={styles.resultText}>
              {index + 1}. {track.name} - {track.artists[0]?.name}
            </Text>
          ))}
        </View>
      )}
      
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>{debugInfo || 'No debug info yet'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  debugContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  resultsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0C121E',
  },
  resultText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
}); 