import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDCZFMplWzCgjN-VZE0htmQgXXnH1qppjE',
  authDomain: 'fitness-app-c3aab.firebaseapp.com',
  projectId: 'fitness-app-c3aab',
  storageBucket: 'fitness-app-c3aab.appspot.com', // Corrected format
  messagingSenderId: '974601936464',
  appId: '1:974601936464:web:2c8beb1b023687ea127b55',
  measurementId: 'G-STQ1QVKS8P',
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);