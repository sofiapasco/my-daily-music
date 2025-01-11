import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase-konfiguration
const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} = {
  apiKey: "AIzaSyCaS1rhmJDr1oGjFGPv8b_BQF8VG9lZQ4c",
  authDomain: "mydailymusic-bcf9e.firebaseapp.com",
  projectId: "mydailymusic-bcf9e",
  storageBucket: "mydailymusic-bcf9e.firebasestorage.app",
  messagingSenderId: "312867284485",
  appId: "1:312867284485:web:d0addc8cbd98a501c1de6c",
};

// Initiera Firebase och Firestore
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
