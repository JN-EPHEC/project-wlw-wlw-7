// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase_env";

// Empêche les multiples initialisations
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log("🔥 FIREBASE CONFIG =", firebaseConfig); 

// ⭐️ Named exports (important !)
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optionnel : default export
export default app;
