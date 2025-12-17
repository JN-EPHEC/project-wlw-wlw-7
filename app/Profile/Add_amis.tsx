import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

export default function AddFriendScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleAddFromContacts = () => {
    router.push("./Profile/Add_contact");
  };

  const handleAddByUsername = () => {
    router.push("./Profile/Add_username");
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un ami</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.iconGradient}
            >
              <Icon name="person-add" size={32} color={COLORS.textPrimary} />
            </LinearGradient>
            <Text style={styles.subtitle}>
              Ajoutez des amis en privé
            </Text>
          </View>

          {/* MÉTHODE 1 : CONTACTS */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleAddFromContacts}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                style={styles.methodIcon}
              >
                <Icon name="people" size={24} color={COLORS.textPrimary} />
              </LinearGradient>
            </View>
            
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Depuis vos contacts</Text>
              <Text style={styles.methodDescription}>
                Trouvez vos amis qui utilisent déjà l'application
              </Text>
            </View>
            
            <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* MÉTHODE 2 : USERNAME */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleAddByUsername}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <View style={[styles.methodIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Icon name="at" size={24} color="#6366F1" />
              </View>
            </View>
            
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Par nom d'utilisateur</Text>
              <Text style={styles.methodDescription}>
                Ajoutez un ami avec son identifiant exact
              </Text>
            </View>
            
            <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* INFO PRIVACY */}
          <View style={styles.infoSection}>
            <Icon name="lock-closed" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>
              Votre profil reste privé. Les demandes nécessitent votre approbation.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },
  card: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundTop,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  methodIconContainer: {
    marginRight: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.success,
    fontStyle: "italic",
    lineHeight: 18,
  },
});