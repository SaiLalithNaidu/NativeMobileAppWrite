import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2Cv2Wrp3uoEDWBA8fZWCnzzdrWNEfAPQ",
  authDomain: "rameshaqua-1fc5f.firebaseapp.com",
  projectId: "rameshaqua-1fc5f",
  storageBucket: "rameshaqua-1fc5f.appspot.com",
  messagingSenderId: "572715546695",
  appId: "1:572715546695:web:0a5fc1407715b4d78c1962",
  measurementId: "G-D1BRN3WC15"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence and better timeout handling
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  // Reduce timeout for faster offline detection
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
});