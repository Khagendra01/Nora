# Voice Search Setup Guide

This app now includes voice search functionality that allows users to record audio and identify songs using the Shazam API.

## Features

- **Voice Recording**: Record audio clips using the device microphone
- **Song Recognition**: Identify songs using Shazam's music recognition API
- **Integration**: Voice search results integrate seamlessly with the existing search functionality
- **Real-time Feedback**: Visual feedback during recording and processing

## Setup

### 1. Shazam API Configuration

The app uses RapidAPI's Shazam service. To set up your own API key:

1. Go to [RapidAPI Shazam](https://rapidapi.com/apidojo/api/shazam/)
2. Subscribe to the free plan
3. Get your API key
4. Update the API key in `services/shazam.ts`:

```typescript
const SHAZAM_API_KEY = 'your_api_key_here';
```

### 2. Permissions

The app automatically requests microphone permissions when needed. The permissions are configured in `app.json`:

```json
{
  "plugins": [
    [
      "expo-av",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice search."
      }
    ]
  ]
}
```

## Usage

### Voice Search Button

The voice search button appears on the search screen and provides:

- **Tap to Start**: Begin recording audio
- **Tap to Stop**: Stop recording and process the audio
- **Visual Feedback**: Button changes color and shows recording duration
- **Processing State**: Shows loading indicator while processing

### How It Works

1. **Recording**: Uses `expo-av` to record high-quality audio
2. **Processing**: Converts audio to base64 format
3. **API Call**: Sends audio data to Shazam API
4. **Results**: Converts Shazam response to Spotify track format
5. **Integration**: Displays results in the search interface

### Audio Format

The app records audio in the following format:
- **Quality**: High quality (44.1kHz, 16-bit)
- **Channels**: Mono
- **Format**: M4A (iOS) / MP4 (Android)

## Components

### VoiceSearchButton
- Handles recording start/stop
- Provides visual feedback
- Integrates with Shazam service

### useVoiceRecording Hook
- Manages recording state
- Handles permissions
- Provides recording controls

### ShazamService
- Converts audio to base64
- Makes API calls to Shazam
- Converts responses to Spotify track format

## Error Handling

The app handles various error scenarios:

- **Permission Denied**: Shows alert and guides user to settings
- **Recording Failed**: Displays error message
- **API Errors**: Shows specific error messages
- **No Results**: Informs user to try again with clearer audio

## Testing

Use the `VoiceSearchDebug` component to test:

- Voice recording functionality
- Shazam API connection
- Audio processing
- Result conversion

## Troubleshooting

### Common Issues

1. **"Microphone permission not granted"**
   - Go to device settings and enable microphone access
   - Restart the app

2. **"No song detected"**
   - Try recording in a quieter environment
   - Ensure the song is clearly audible
   - Try recording for 5-10 seconds

3. **"API Error"**
   - Check your internet connection
   - Verify your Shazam API key is valid
   - Check RapidAPI subscription status

### Debug Information

The debug component shows:
- Recording state
- API connection status
- Error messages
- Test results

## API Limits

The free RapidAPI Shazam plan includes:
- 100 requests per month
- Basic song recognition
- Standard response format

For production use, consider upgrading to a paid plan for higher limits and better reliability.

## Security Notes

- API keys are stored in the client code (not recommended for production)
- Audio data is sent to Shazam servers for processing
- No audio data is stored locally after processing
- Consider implementing server-side API calls for production apps 