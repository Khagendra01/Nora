// Example Firebase configuration
// Copy this file to firebase-config.js and replace with your actual values
// Then import it in services/firebase.ts instead of using environment variables

export const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};

// To get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project (or create a new one)
// 3. Go to Project Settings (gear icon)
// 4. Scroll down to "Your apps" section
// 5. Click on the web app (</>) or create one
// 6. Copy the config values from the provided code snippet 