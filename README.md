# Nora - Music Discovery App

A modern React Native music discovery app built with Expo that allows users to search, identify, and manage their favorite music tracks. Nora combines the power of Spotify's music library with Shazam's song recognition technology to create a seamless music discovery experience.

## 🎵 Features

### Core Functionality
- **Music Search**: Search for tracks using Spotify's extensive music library
- **Voice Recognition**: Identify songs by recording audio using Shazam API
- **Favorites Management**: Save and organize your favorite tracks
- **Recently Played**: Track your listening history
- **Audio Preview**: Play 30-second previews of tracks
- **User Authentication**: Secure login with Firebase authentication

### Advanced Features
- **Voice Search**: Record audio to identify unknown songs
- **Rating System**: Rate and review your favorite tracks
- **Comments**: Add comments to tracks and engage with the community
- **Responsive Design**: Beautiful UI that works across iOS, Android, and Web
- **Offline Support**: Access your favorites and recently played tracks offline

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.79.1) - Cross-platform mobile development
- **Expo** (53.0.0) - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation between screens
- **React Native Reanimated** - Smooth animations

### APIs & Services
- **Spotify Web API** - Music search and track information
- **Shazam API** - Song recognition and identification
- **Firebase** - Authentication and data storage
- **RapidAPI** - API gateway for Shazam integration

### State Management
- **React Context** - Global state management
- **AsyncStorage** - Local data persistence
- **React Query** - Server state management

### UI/UX
- **Lucide React Native** - Icon library
- **Expo Linear Gradient** - Beautiful gradients
- **Expo Blur** - Modern blur effects
- **Expo Haptics** - Tactile feedback

## 📱 Screenshots

The app features a modern, intuitive interface with:
- Clean home screen with quick access to search and favorites
- Voice search functionality with real-time recording feedback
- Detailed track pages with ratings and comments
- Favorites and recently played sections
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. **Firebase Configuration**
   
   Copy `firebase-config.example.js` to `firebase-config.js` and add your Firebase configuration:
   ```javascript
   export const firebaseConfig = {
     apiKey: "your_api_key",
     authDomain: "your_auth_domain",
     projectId: "your_project_id",
     storageBucket: "your_storage_bucket",
     messagingSenderId: "your_messaging_sender_id",
     appId: "your_app_id"
   };
   ```

5. **API Keys Setup**
   
   - **Spotify**: Get your client ID and secret from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - **Shazam**: The app uses a free RapidAPI key for Shazam integration
   - **Firebase**: Set up a Firebase project and add your configuration

### Running the App

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Run on different platforms**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Building for Production

1. **Build for web**
   ```bash
   npm run build:web
   ```

2. **Build for mobile**
   ```bash
   expo build:android
   expo build:ios
   ```

## 📁 Project Structure

```
project/
├── app/                    # Expo Router app directory
│   ├── (tabs)/           # Tab navigation screens
│   ├── track/            # Track detail screens
│   └── _layout.tsx       # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   └── VoiceSearchButton.tsx
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── services/             # API services
├── types/                # TypeScript type definitions
├── __tests__/            # Test files
└── assets/               # Static assets
```

## 🧪 Testing

The project includes comprehensive testing setup with Jest and React Native Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Configuration

### Spotify API
The app uses Spotify's Web API for music search and track information. Configure your Spotify app in the Spotify Developer Dashboard and add the credentials to your environment variables.

### Shazam API
Song recognition is powered by Shazam through RapidAPI. The app includes a free API key, but you can replace it with your own for production use.

### Firebase
Firebase is used for user authentication and data storage. Set up a Firebase project and configure the authentication methods you want to support.

## 📱 Features in Detail

### Voice Search
- Record audio for 5-10 seconds to identify songs
- Real-time recording feedback with animations
- Integration with Shazam API for song recognition
- Fallback to Spotify search if Shazam doesn't find a match

### Music Search
- Search Spotify's extensive music library
- Real-time search results with debouncing
- Track previews and detailed information
- Add tracks to favorites directly from search

### Favorites Management
- Save tracks to your personal favorites list
- Organize and browse your favorite music
- Persistent storage with AsyncStorage
- Quick access from the home screen

### Recently Played
- Automatic tracking of played tracks
- Browse your listening history
- Quick access to recently played tracks
- Persistent storage across app sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify](https://developer.spotify.com/) for the music API
- [Shazam](https://www.shazam.com/) for song recognition
- [Expo](https://expo.dev/) for the development platform
- [React Native](https://reactnative.dev/) for the framework
- [Lucide](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you encounter any issues or have questions about the project, please:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

---

**Nora** - Discover music like never before! 🎵 