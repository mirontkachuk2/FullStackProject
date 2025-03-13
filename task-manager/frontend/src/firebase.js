// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
// Connect to emulators in development mode
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    // Auth emulator typically runs on port 9099
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // Firestore emulator typically runs on port 8080
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Using Firebase Emulators');
}
/**
 * Sign in with Google authentication
 * @returns The authenticated user or null if authentication fails
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    }
    catch (error) {
        console.error("Google sign-in error:", error);
        return null;
    }
};
/**
 * Sign out the current user
 */
export const logout = async () => {
    await signOut(auth);
};
/**
 * Listen to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const listenToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};
export { auth, db };
