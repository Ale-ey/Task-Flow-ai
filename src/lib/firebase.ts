import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as required by instructions
async function testConnection() {
  try {
    // Attempt to read a dummy document to verify connection
    await getDocFromServer(doc(db, 'system', 'connection-test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // We don't necessarily want to crash the app if this fails, 
    // as it might just be the document doesn't exist (which is fine during setup).
  }
}

testConnection();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => auth.signOut();
