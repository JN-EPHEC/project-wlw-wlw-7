import { auth } from "@/firebase_Config.js";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "./../components/Colors";

// Cette page vérifie si l'utilisateur est connecté et redirige en conséquence
export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter l'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      
      if (currentUser) {
        // Si connecté → Home
        router.replace("/(tabs)/Home");
      } else {
        // Si non connecté → Login
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  // Afficher un loader pendant la vérification
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.backgroundTop }}>
      <ActivityIndicator size="large" color={COLORS.secondary} />
    </View>
  );
}