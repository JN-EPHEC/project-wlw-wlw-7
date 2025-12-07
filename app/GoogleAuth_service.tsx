import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase_Config";

// Méthode super simple : Popup Google géré par Firebase
// Fonctionne parfaitement pour un MVP/projet scolaire
// Pas besoin de configurer Google Cloud Console !

export const signInWithGooglePopup = async () => {
  try {
    console.log("▶ Starting Google Sign-In with popup...");
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Firebase gère tout le flow OAuth automatiquement
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("✅ Google Sign-In successful:", user.email);
    
    // Vérifier si c'est un nouvel utilisateur
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Nouvel utilisateur - créer le document Firestore
      console.log("▶ Creating new user document...");
      
      const userData = {
        uid: user.uid,
        email: user.email?.toLowerCase() || "",
        username: user.email?.split("@")[0].toLowerCase() || "",
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        createdAt: new Date().toISOString(),
        surveyCompleted: false,
        accountType: null,
        interests: [],
        city: null,
        friends: [],
        blockedUsers: [],
        expoPushToken: null,
        photoURL: user.photoURL || null,
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ User document created");
      
      return { needsSurvey: true };
    }
    
    // Utilisateur existant
    const userData = userDoc.data();
    return { needsSurvey: !userData.surveyCompleted };
    
  } catch (error: any) {
    console.error("❌ Google Sign-In error:", error);
    
    // Gérer les erreurs courantes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Connexion annulée");
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup bloquée par le navigateur");
    }
    
    throw error;
  }
};