import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

export default function AddByUsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'utilisateur");
      return;
    }

    setLoading(true);
    setFoundUser(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Rechercher l'utilisateur exact
      const usersQuery = query(
        collection(db, "users"),
        where("username", "==", username.trim().toLowerCase())
      );

      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        Alert.alert("Non trouvé", "Aucun utilisateur avec ce nom d'utilisateur.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Vérifier que ce n'est pas soi-même
      if (userDoc.id === currentUser.uid) {
        Alert.alert("Attention", "Vous ne pouvez pas vous ajouter vous-même.");
        return;
      }

      // Vérifier si déjà ami
      const currentUserDoc = await getDocs(query(
        collection(db, "users"),
        where("uid", "==", currentUser.uid)
      ));
      
      if (!currentUserDoc.empty) {
        const currentUserData = currentUserDoc.docs[0].data();
        const currentFriends = currentUserData.friends || [];
        
        if (currentFriends.includes(userDoc.id)) {
          Alert.alert("Déjà ami", "Cet utilisateur est déjà votre ami.");
          return;
        }
      }

      // Vérifier si demande déjà envoyée
      const existingRequestQuery = query(
        collection(db, "friend_requests"),
        where("fromUserId", "==", currentUser.uid),
        where("toUserId", "==", userDoc.id),
        where("status", "==", "pending")
      );

      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingRequestSnapshot.empty) {
        Alert.alert("Déjà envoyée", "Vous avez déjà envoyé une demande à cet utilisateur.");
        return;
      }

      setFoundUser({
        uid: userDoc.id,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        email: userData.email,
      });

    } catch (error) {
      console.error("Error searching user:", error);
      Alert.alert("Erreur", "Impossible de rechercher l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundUser) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Créer la demande
      const requestId = `${currentUser.uid}_${foundUser.uid}_${Date.now()}`;
      await setDoc(doc(db, "friend_requests", requestId), {
        id: requestId,
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || currentUser.email,
        toUserId: foundUser.uid,
        toUserName: foundUser.displayName,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        "Demande envoyée",
        `Une demande d'ami a été envoyée à ${foundUser.displayName}.`,
        [{ text: "OK", onPress: () => {
          setUsername("");
          setFoundUser(null);
        }}]
      );

    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la demande.");
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechercher par username</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* RECHERCHE */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Entrez un nom d'utilisateur"
            placeholderTextColor={COLORS.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading || !username.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Icon name="search" size={20} color={COLORS.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* RÉSULTAT */}
        {foundUser && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.resultAvatar}
            >
              <Text style={styles.resultAvatarText}>
                {foundUser.displayName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{foundUser.displayName}</Text>
              <Text style={styles.resultUsername}>@{foundUser.username}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendRequest}
            >
              <Icon name="person-add" size={20} color={COLORS.textPrimary} />
              <Text style={styles.sendButtonText}>Envoyer demande</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INSTRUCTIONS */}
        <View style={styles.instructions}>
          <Icon name="information-circle" size={20} color={COLORS.textSecondary} />
          <Text style={styles.instructionsText}>
            Entrez le nom d'utilisateur exact d'une personne pour lui envoyer une demande d'ami.
            Votre profil reste privé.
          </Text>
        </View>
      </View>
    </LinearGradient>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
  content: {
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  resultAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resultAvatarText: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  resultInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resultUsername: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  instructions: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});