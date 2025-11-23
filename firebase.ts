// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  // etc.
};

// Empêche les multiples initialisations
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ⭐️ Named exports (important !)
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optionnel : default export
export default app;
