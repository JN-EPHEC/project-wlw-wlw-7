import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

type AppUser = {
  uid: string;
  email: string;
  username: string;
  displayName: string;
};

export default function AddFromContactsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPotentialFriends();
  }, []);

  const loadPotentialFriends = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Récupérer tous les utilisateurs SAUF soi-même et ses amis actuels
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", currentUser.uid)));
      
      if (!userDoc.empty) {
        const currentUserData = userDoc.docs[0].data();
        const currentFriends = currentUserData.friends || [];
        
        const allUsers: AppUser[] = [];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          // Exclure soi-même et amis existants
          if (doc.id !== currentUser.uid && !currentFriends.includes(doc.id)) {
            allUsers.push({
              uid: doc.id,
              email: data.email || "",
              username: data.username || data.email?.split('@')[0] || "user",
              displayName: data.displayName || data.username || "Utilisateur",
            });
          }
        });

        setContacts(allUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Erreur", "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = async (user: AppUser) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Erreur", "Vous devez être connecté.");
        return;
      }

      // Vérifier si une demande existe déjà
      const existingRequestQuery = query(
        collection(db, "friend_requests"),
        where("fromUserId", "==", currentUser.uid),
        where("toUserId", "==", user.uid),
        where("status", "==", "pending")
      );

      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingRequestSnapshot.empty) {
        Alert.alert("Déjà envoyée", "Vous avez déjà envoyé une demande à cette personne.");
        return;
      }

      // Créer la demande
      const requestId = `${currentUser.uid}_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, "friend_requests", requestId), {
        id: requestId,
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || currentUser.email,
        toUserId: user.uid,
        toUserName: user.displayName,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        "Demande envoyée",
        `Une demande d'ami a été envoyée à ${user.displayName}.`,
        [{ text: "OK", onPress: () => {
          // Retirer de la liste
          setContacts(prev => prev.filter(u => u.uid !== user.uid));
        }}]
      );

    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la demande.");
    }
  };

  const renderContact = ({ item }: { item: AppUser }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <LinearGradient
          colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.displayName}</Text>
          <Text style={styles.contactUsername}>@{item.username}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSendRequest(item)}
      >
        <Icon name="person-add" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <Text style={styles.searchInput}>
          {filteredContacts.length} utilisateur{filteredContacts.length !== 1 ? 's' : ''} disponible{filteredContacts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* LISTE */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucun utilisateur disponible</Text>
            <Text style={styles.emptySubtext}>
              Tous les utilisateurs sont déjà vos amis ou ont une demande en attente
            </Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
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
  headerPlaceholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contactUsername: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});