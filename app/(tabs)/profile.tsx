import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Profile() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1220",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Profil (à compléter)
      </Text>
      <Text style={{ color: "#aab4ce", textAlign: "center", marginBottom: 24 }}>
        Crée un compte pour configurer tes préférences et recevoir des recommandations
        personnalisées.
      </Text>
      <Pressable
        onPress={() => router.push("/onboarding")}
        style={{
          backgroundColor: "#5ea1ff",
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: "#0f1220", fontWeight: "700", fontSize: 16 }}>
          Créer mon compte
        </Text>
      </Pressable>
    </View>
  );
}