// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBzjFcERSc6ZG1BHs_APbqX15XvNVDd6A", // From your handoff doc
  authDomain: "sehatsetu-2d761.firebaseapp.com",
  projectId: "sehatsetu-2d761",
  storageBucket: "sehatsetu-2d761.firebasestorage.app",
  messagingSenderId: "538530739997",
  appId: "1:538530739997:web:138c6fff87c1ce7ff753f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export the auth instance