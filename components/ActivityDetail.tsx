import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../components/Colors";
import ProposeActivityModal from "../components/Proposition_activity";
import { db } from "../firebase_Config";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  price: "Gratuit" | "Payant";
  location: string;
  interests: string[];
  image?: string;
  isNew: boolean;
  date: string;
  website?: string; // Lien vers le site web
  hours?: string; // Horaires
  rating?: number; // Note sur 5
}

export default function ActivityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposeModal, setShowProposeModal] = useState(false);

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      const activityDoc = await getDoc(doc(db, "activities", activityId));
      if (activityDoc.exists()) {
        setActivity({
          id: activityDoc.id,
          ...activityDoc.data(),
        } as Activity);
      }
    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWebsite = () => {
    if (activity?.website) {
      Linking.openURL(activity.website);
    }
  };

  const handleShare = () => {
    setShowProposeModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Activité introuvable</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.background}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* HEADER avec bouton retour */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>What2do</Text>
            <TouchableOpacity style={styles.heartButton}>
              <Icon name="heart-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* IMAGE DE L'ACTIVITÉ */}
          <View style={styles.imageContainer}>
            {activity.image ? (
              <ImageBackground
                source={{ uri: activity.image }}
                style={styles.mainImage}
                imageStyle={{ borderRadius: 24 }}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.imageOverlay}
                />
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={["#7C3AED", "#5B21B6"]}
                style={styles.mainImage}
              />
            )}
          </View>

          {/* TITRE ET EMOJI */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>{activity.title}</Text>
          </View>

          {/* CATÉGORIES / TAGS */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{activity.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{activity.location.split(" - ")[0]}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {activity.price === "Gratuit" ? "Gratuit" : "Payant"}
              </Text>
            </View>
          </View>

          {/* INFOS PRATIQUES */}
          <View style={styles.infoSection}>
            {/* Localisation */}
            <View style={styles.infoRow}>
              <Icon name="location" size={20} color={COLORS.error} />
              <Text style={styles.infoText}>{activity.location}</Text>
            </View>

            {/* Horaires */}
            {activity.hours && (
              <View style={styles.infoRow}>
                <Icon name="time" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>{activity.hours}</Text>
              </View>
            )}

            {/* Note */}
            {activity.rating && (
              <View style={styles.infoRow}>
                <Icon name="star" size={20} color="#FFD700" />
                <Text style={styles.infoText}>{activity.rating}/5</Text>
              </View>
            )}
          </View>

          {/* DESCRIPTION */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{activity.description}</Text>
          </View>

          {/* BOUTONS D'ACTION */}
          <View style={styles.actionsContainer}>
            {/* Bouton Site Web */}
            {activity.website && (
              <TouchableOpacity style={styles.websiteButton} onPress={handleOpenWebsite}>
                <Icon name="globe-outline" size={20} color={COLORS.textPrimary} />
                <Text style={styles.websiteButtonText}>Voir sur le site</Text>
                <Icon name="open-outline" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Bouton Partager */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <LinearGradient
                colors={[COLORS.secondary, "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shareButtonGradient}
              >
                <Text style={styles.shareButtonText}>Proposer à mes amis</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* INTÉRÊTS */}
          <View style={styles.interestsSection}>
            <Text style={styles.interestsTitle}>Intérêts</Text>
            <View style={styles.interestsList}>
              {activity.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>#{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* MODAL PROPOSER ACTIVITÉ */}
        {activity && (
          <ProposeActivityModal
            visible={showProposeModal}
            onClose={() => setShowProposeModal(false)}
            activity={{
              id: activityId,
              title: activity.title,
              description: activity.description,
              image: activity.image,
              location: activity.location,
              date: activity.date,
              category: activity.category,
            }}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundTop,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C122D",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C122D",
    alignItems: "center",
    justifyContent: "center",
  },

  // IMAGE
  imageContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainImage: {
    height: 250,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  imageOverlay: {
    height: "100%",
    width: "100%",
  },

  // TITRE
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  // TAGS
  tagsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.4)",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  // INFOS PRATIQUES
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  // DESCRIPTION
  descriptionSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // BOUTONS D'ACTION
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#1C122D",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
  },
  websiteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  shareButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // INTÉRÊTS
  interestsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6366F1",
  },
});