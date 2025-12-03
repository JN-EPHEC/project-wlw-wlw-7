import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAVzC7t7GgwASI99ZlY8S1bjvKGmhJk79s",
  authDomain: "what2do-wlw-grp-7.firebaseapp.com",
  projectId: "what2do-wlw-grp-7",
  storageBucket: "what2do-wlw-grp-7.firebasestorage.app",
  messagingSenderId: "721821996699",
  appId: "1:721821996699:web:a7b82cc39a5bce1c91583e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth (app);
export const db = getFirestore (app);