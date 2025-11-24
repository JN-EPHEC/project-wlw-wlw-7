// app/(app)/groups.tsx
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../lib/firebaseConfig"; // 🔗 ta config Firebase

export default function GroupsScreen() {
  const handleCreateTestGroup = async () => {
    try {
      await addDoc(collection(db, "groups"), {
        title: "Soirée test depuis l'app",
        description: "Groupe créé depuis l'écran Groups.",
        organizerId: "testUserId",              // plus tard : l'id du user connecté
        members: ["testUserId"],
        gameIds: ["actionOuVeriteId"],          // id d'un jeu existant si tu veux
        location: "Bruxelles-centre",
        date: new Date(),                       // maintenant
        createdAt: serverTimestamp(),           // timestamp serveur
      });

      Alert.alert("Succès", "Groupe de test créé dans Firestore 🎉");
    } catch (error) {
      console.error("Erreur Firestore:", error);
      Alert.alert(
        "Erreur",
        "Impossible de créer le groupe. Vérifie la console."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Groupes</Text>
            <Text style={styles.subtitle}>
              Ajoute ou retrouve tes groupes d'amis. Les données viendront se
              connecter ici.
            </Text>
          </View>

          <TouchableOpacity
            accessibilityLabel="Créer un groupe"
            activeOpacity={0.9}
            style={styles.addButton}
            onPress={handleCreateTestGroup}   // 🔥 ICI on appelle Firestore
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tes groupes</Text>
          <Text style={styles.sectionHint}>
            Cette liste sera alimentée par la base de données quand elle sera
            prête.
          </Text>

          <View style={styles.groupList}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>
                Aucun groupe pour le moment
              </Text>
              <Text style={styles.placeholderText}>
                Quand la base de données sera branchée, tes groupes
                s'afficheront automatiquement ici avec leurs événements et
                membres. Utilise le bouton + en haut à droite pour en créer un
                nouveau dès que le flux sera connecté.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050013",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#8B84A2",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#7C5BBF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHint: {
    color: "#8B84A2",
    fontSize: 13,
  },
  groupList: {
    gap: 12,
  },
  placeholderCard: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#7C5BBF",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    backgroundColor: "rgba(124, 91, 191, 0.05)",
  },
  placeholderTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  placeholderText: {
    color: "#B4ACC8",
    fontSize: 13,
    lineHeight: 20,
  },
});
