# Firebase Setup Guide

## 🔥 Fixing the Firebase 400 Bad Request Error

The error you're seeing is caused by missing or incorrect Firebase configuration. Follow these steps to resolve it:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

### Step 2: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web app icon (</>) or create a new web app
5. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Update Your Configuration

**Option A: Direct Configuration (Recommended for development)**

Edit `services/firebase.ts` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "your_actual_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id",
};
```

**Option B: Environment Variables (Recommended for production)**

1. Create a `.env` file in your project root:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. Add `.env` to your `.gitignore` file

### Step 4: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### Step 5: Set Up Authentication (Optional)

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" and/or "Google" sign-in methods

### Step 6: Test Your Configuration

After updating the configuration:

1. Restart your development server
2. Check the browser console for any Firebase warnings
3. Try using the app - the 400 error should be resolved

### Common Issues

**"Firebase not configured" warning:**
- Make sure you've replaced all placeholder values in `services/firebase.ts`

**"Permission denied" errors:**
- Check your Firestore security rules in Firebase Console
- For development, you can use test mode

**"Network error" or "Connection failed":**
- Check your internet connection
- Verify the Firebase project is active
- Ensure you're using the correct project ID

### Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Need Help?

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Verify your configuration matches the Firebase Console
- Ensure your project is active and billing is set up (if required) 