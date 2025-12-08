import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ REMPLACE CES VALEURS PAR TES PROPRES CLÉS FIREBASE
// Tu les trouves dans : Console Firebase > Paramètres du projet > Vos applications
const firebaseConfig = {
  apiKey: "TA_CLE_API_ICI",
  authDomain: "TON_PROJET.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_PROJET.appspot.com",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
