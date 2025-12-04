import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;

if (typeof window !== "undefined") {
    // Check if all required config values are present
    const hasValidConfig = Object.values(firebaseConfig).every(
        (value) => value && value !== "undefined"
    );

    if (hasValidConfig) {
        console.log("Initializing Firebase with config:", {
            apiKey: firebaseConfig.apiKey ? "✓ Set" : "✗ Missing",
            authDomain: firebaseConfig.authDomain ? "✓ Set" : "✗ Missing",
            projectId: firebaseConfig.projectId ? "✓ Set" : "✗ Missing",
        });

        app =
            getApps().length === 0
                ? initializeApp(firebaseConfig)
                : getApps()[0];
        auth = getAuth(app);
        db = getFirestore(app);

        // Set authentication persistence to LOCAL (survives browser restarts)
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                console.log("Firebase Auth persistence set to LOCAL");
            })
            .catch((error) => {
                console.error("Failed to set auth persistence:", error);
            });
    } else {
        console.error("Firebase config is incomplete:", firebaseConfig);
    }
}

export { auth, db };
export default app;
