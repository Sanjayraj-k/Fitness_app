// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn9CisZT5m3AAxhsE0S8WAZEMs9BfWqMI",
  authDomain: "fitness-89506.firebaseapp.com",
  projectId: "fitness-89506",
  storageBucket: "fitness-89506.firebasestorage.app",
  messagingSenderId: "894385658380",
  appId: "1:894385658380:web:93e2b35fe0b3d55801ec29"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);