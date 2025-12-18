import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

type SearchResult = {
  uid: string;
  displayName: string;
  username: string;
  photoURL?: string;
  requestSent?: boolean;
};

export default function SearchFriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("❌", "Entrez un nom ou email");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const query_lower = searchQuery.toLowerCase().trim();
      const usersRef = collection(db, "users");
      
      // Recherche par username OU email
      const usernameQuery = query(usersRef, where("username", "==", query_lower));
      const emailQuery = query(usersRef, where("email", "==", query_lower));

      const [usernameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(emailQuery)
      ]);

      const foundUsers: SearchResult[] = [];
      const seenUids = new Set<string>();

      // Ajouter résultats username
      usernameSnapshot.forEach(doc => {
        if (doc.id !== user.uid && !seenUids.has(doc.id)) {
          const data = doc.data();
          foundUsers.push({
            uid: doc.id,
            displayName: data.displayName || data.username || "Utilisateur",
            username: data.username || "",
            photoURL: data.photoURL,
            requestSent: false,
          });
          seenUids.add(doc.id);
        }
      });

      // Ajouter résultats email
      emailSnapshot.forEach(doc => {
        if (doc.id !== user.uid && !seenUids.has(doc.id)) {
          const data = doc.data();
          foundUsers.push({
            uid: doc.id,
            displayName: data.displayName || data.username || "Utilisateur",
            username: data.username || "",
            photoURL: data.photoURL,
            requestSent: false,
          });
          seenUids.add(doc.id);
        }
      });

      setResults(foundUsers);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("❌", "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FONCTION CORRIGÉE
  const handleSendRequest = async (targetUser: SearchResult) => {
    const user = auth.currentUser;
    if (!user) return;

    setSendingRequest(targetUser.uid);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Vérifier si demande existe déjà - ✅ CORRIGÉ
      const requestsRef = collection(db, "friendRequests");
      const existingQuery = query(
        requestsRef,
        where("fromUserId", "==", user.uid),        // ✅ fromUserId au lieu de from
        where("toUserId", "==", targetUser.uid),    // ✅ toUserId au lieu de to
        where("status", "==", "pending")
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        Alert.alert("⚠️", "Vous avez déjà envoyé une demande à cet utilisateur");
        setSendingRequest(null);
        return;
      }

      // Créer la demande - ✅ CORRIGÉ
      await addDoc(collection(db, "friendRequests"), {
        fromUserId: user.uid,                      // ✅ fromUserId au lieu de from
        toUserId: targetUser.uid,                  // ✅ toUserId au lieu de to
        fromUsername: user.displayName || "Utilisateur",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Notification
      await notifyUser(
        targetUser.uid,
        "👋 Nouvelle demande d'ami",
        `${user.displayName} veut être votre ami`,
        { type: 'friend_request', fromUserId: user.uid }
      );

      // Marquer comme envoyé
      setResults(prev =>
        prev.map(r =>
          r.uid === targetUser.uid ? { ...r, requestSent: true } : r
        )
      );

      Alert.alert("✅", `Demande envoyée à ${targetUser.displayName}`);
    } catch (error) {
      console.error("Send request error:", error);
      Alert.alert("❌", "Impossible d'envoyer la demande");
    } finally {
      setSendingRequest(null);
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultCard}>
      {/* AVATAR + INFO */}
      <View style={styles.userInfo}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.userDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.userUsername} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>
      </View>

      {/* BOUTON */}
      {item.requestSent ? (
        <View style={styles.sentBadge}>
          <Icon name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.sentText}>Envoyé</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleSendRequest(item)}
          disabled={sendingRequest === item.uid}
        >
          {sendingRequest === item.uid ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.addButtonGradient}
            >
              <Icon name="person-add" size={18} color={COLORS.textPrimary} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    // Si une recherche a été faite mais rien trouvé
    if (hasSearched && results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['rgba(255, 59, 48, 0.2)', 'rgba(255, 149, 0, 0.2)']}
            style={styles.emptyIcon}
          >
            <Icon name="sad-outline" size={40} color="#FF9500" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptySubtext}>
            On n'a trouvé personne avec "{searchQuery}"
          </Text>
          <Text style={[styles.emptySubtext, { marginTop: 8 }]}>
            Vérifie l'orthographe ou essaye avec l'email exact
          </Text>
        </View>
      );
    }
    
    // État initial (avant toute recherche)
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
          style={styles.emptyIcon}
        >
          <Icon name="search" size={40} color={COLORS.textPrimary} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>Rechercher des amis</Text>
        <Text style={styles.emptySubtext}>
          Entrez le nom d'utilisateur ou l'email exact pour trouver quelqu'un
        </Text>
        
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Exemples :</Text>
          <Text style={styles.exampleItem}>• @alice</Text>
          <Text style={styles.exampleItem}>• bob@email.com</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Ajouter un ami</Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nom d'utilisateur ou email"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
            style={styles.searchButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Icon name="search" size={20} color={COLORS.textPrimary} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* RÉSULTATS */}
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
    padding: 0,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  searchButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  addButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  sentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 16,
  },
  sentText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  examplesContainer: {
    alignSelf: "stretch",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  examplesTitle: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  exampleItem: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});