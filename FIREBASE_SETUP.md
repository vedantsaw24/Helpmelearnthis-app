# Firebase Authentication Setup Instructions

This project uses Firebase Authentication for user management. Follow these steps to set up authentication:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" and follow the setup wizard
3. Enable Google Analytics (optional)

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
    - **Email/Password**: Click on it and toggle "Enable"
    - **Google**: Click on it, toggle "Enable", and add your domain to authorized domains

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon) → General tab
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon (</>)
4. Register your app (give it a name)
5. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
};
```

## 4. Configure Environment Variables

1. Copy `.env.local` to `.env.local` if it doesn't exist
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Configure Google OAuth (Optional)

If you want to use Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Find your OAuth 2.0 client ID
5. Add your domain to "Authorized JavaScript origins":
    - `http://localhost:9002` (for development)
    - Your production domain

## 6. Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Try creating an account or signing in
4. Check the Firebase Console → Authentication → Users to see registered users

## Features Included

-   ✅ Email/Password authentication
-   ✅ Google OAuth sign-in
-   ✅ Password reset functionality
-   ✅ Protected routes
-   ✅ User profile management
-   ✅ Automatic redirect handling
-   ✅ Loading states and error handling

## Troubleshooting

**"Firebase: Error (auth/operation-not-allowed)"**

-   Make sure you've enabled Email/Password auth in Firebase Console

**"Firebase: Error (auth/unauthorized-domain)"**

-   Add your domain to Firebase Console → Authentication → Settings → Authorized domains

**Google Sign-In not working**

-   Verify OAuth configuration in Google Cloud Console
-   Check that your domain is in authorized origins

## Security Notes

-   Never commit your `.env.local` file to version control
-   Use different Firebase projects for development and production
-   Consider setting up Firebase Security Rules for additional protection
