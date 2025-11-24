import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RegisterNextScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Écran à venir</Text>
        <Text style={styles.subtitle}>
          Tu as créé ton compte. Cette page sera bientôt remplie avec les étapes
          suivantes.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#BDB8D9",
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#7C5BBF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});