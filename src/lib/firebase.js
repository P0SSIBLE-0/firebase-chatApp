import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-20114.firebaseapp.com",
  projectId: "reactchat-20114",
  storageBucket: "reactchat-20114.appspot.com",
  messagingSenderId: "849425910140",
  appId: "1:849425910140:web:4f9ff9690394ca1ad67cf9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();