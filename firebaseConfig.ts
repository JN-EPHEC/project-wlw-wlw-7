// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, OAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVzC7t7GgwASI99ZlY8S1bjvKGmhJk79s",
  authDomain: "what2do-wlw-grp-7.firebaseapp.com",
  projectId: "what2do-wlw-grp-7",
  storageBucket: "what2do-wlw-grp-7.firebasestorage.app",
  messagingSenderId: "721821996699",
  appId: "1:721821996699:web:a7b82cc39a5bce1c91583e"
};


const app = getApps().length ? getApp() : initializeApp((firebaseConfig));

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
export const db = getFirestore(app);