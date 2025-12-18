import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";
import { notifyUser } from "../../service/notificationService";

export default function SearchFriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Erreur", "Entrez un email ou nom d'utilisateur");
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      
      // Rechercher par email OU username
      const emailQuery = query(usersRef, where("email", "==", searchQuery.toLowerCase()));
      const usernameQuery = query(usersRef, where("username", "==", searchQuery.trim()));
      
      const [emailResults, usernameResults] = await Promise.all([
        getDocs(emailQuery),
        getDocs(usernameQuery)
      ]);

      const results: any[] = [];
      
      emailResults.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });
      
      usernameResults.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid && !results.find(r => r.id === doc.id)) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      setSearchResults(results);
      
      if (results.length === 0) {
        Alert.alert("Aucun résultat", "Aucun utilisateur trouvé");
      }
    } catch (error: any) {
      console.error("Error searching users:", error);
      Alert.alert("Erreur", "Impossible de rechercher des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toUserId: string, toUsername: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Vérifier si une demande existe déjà
      const requestsRef = collection(db, "friendRequests");
      const existingQuery = query(
        requestsRef,
        where("from", "==", currentUser.uid),
        where("to", "==", toUserId)
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        Alert.alert("Info", "Vous avez déjà envoyé une demande à cet utilisateur");
        return;
      }

      // Créer la demande d'ami
      await addDoc(requestsRef, {
        from: currentUser.uid,
        fromUsername: currentUser.displayName || "Utilisateur",
        to: toUserId,
        toUsername: toUsername,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Envoyer la notification - CORRIGÉ ICI
      await notifyUser(
        toUserId,
        "friend_request",
        "Nouvelle demande d'ami",
        `${currentUser.displayName || "Utilisateur"} vous a envoyé une demande d'ami`
        // Le 5ème argument a été supprimé car notifyUser n'accepte que 4 arguments
      );

      Alert.alert("Succès", "Demande d'ami envoyée !");
      
      // Retirer le user des résultats
      setSearchResults(prev => prev.filter(u => u.id !== toUserId));
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la demande");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rechercher des amis</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Email ou nom d'utilisateur"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH BUTTON */}
        <TouchableOpacity
          style={styles.searchButtonWrapper}
          onPress={handleSearch}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>
              {loading ? "Recherche..." : "Rechercher"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* RESULTS */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Résultats ({searchResults.length})</Text>
            
            {searchResults.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.username}>{user.username || "Utilisateur"}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => sendFriendRequest(user.id, user.username || "Utilisateur")}
                >
                  <Icon name="person-add" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  searchButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 32,
  },
  searchButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  resultsContainer: {
    gap: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});