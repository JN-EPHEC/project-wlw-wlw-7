// components/RecommandationModal.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../firebase_Config";
import { suggestActivitiesForGroup } from "../service/activityMatching";
import { COLORS } from "./Colors";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  price: "Gratuit" | "Payant";
  location: string;
  interests?: string[];
  tags?: string[];
  image?: string;
  isNew: boolean;
  date: string;
  score: number;
  matchedInterests: string[];
  city?: string;
  rating?: number;
}

interface RecommendationsModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupMembers: string[];
}

export default function RecommendationsModal({
  visible,
  onClose,
  groupId,
  groupMembers,
}: RecommendationsModalProps) {
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadRecommendations();
    }
  }, [visible]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const results = await suggestActivitiesForGroup(groupId);
      setRecommendations(results);
      
      if (results.length === 0) {
      }
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
    } finally {
      setLoading(false);
    }
  };

  const proposeActivity = async (activity: Activity) => {
    if (!currentUser) return;

    setProposing(true);
    setSelectedActivity(activity.id);

    try {
      const activityDate = new Date(activity.date);
      const deadline = new Date(activityDate.getTime() - 60 * 60 * 1000);

      const participants: any = {};
      groupMembers.forEach((memberId: string) => {
        participants[memberId] = {
          vote: memberId === currentUser.uid ? "coming" : "pending",
          reaction: null,
          updatedAt: new Date().toISOString(),
        };
      });

      await addDoc(collection(db, "groupActivities"), {
        groupId,
        activityId: activity.id,
        activityTitle: activity.title,
        activityDescription: activity.description,
        activityImage: activity.image || "",
        activityLocation: activity.location,
        activityDate: activity.date,
        activityCategory: activity.category,
        deadline: deadline.toISOString(),
        proposedBy: currentUser.uid,
        proposedAt: new Date().toISOString(),
        participants,
        recommendationScore: activity.score,
        matchedInterests: activity.matchedInterests || [],
      });

      onClose();
    } catch (error) {
      console.error("Erreur proposition activité:", error);
    } finally {
      setProposing(false);
      setSelectedActivity(null);
    }
  };

  const getMatchPercentage = (score: number) => {
    return Math.min(Math.round(score), 100);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#6366F1";
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Icon name="sparkles" size={24} color="#FFD700" />
            <Text style={styles.headerTitle}>Recommandations IA</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Analyse des intérêts du groupe...</Text>
            <Text style={styles.loadingSubtext}>
              L'IA trouve les meilleures activités pour vous 🤖
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoBanner}>
              <Icon name="information-circle" size={20} color="#6366F1" />
              <Text style={styles.infoBannerText}>
                Basé sur les intérêts communs • {recommendations.length}/5 activités
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {recommendations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="sad-outline" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>Aucune recommandation</Text>
                  <Text style={styles.emptyText}>
                    Ajoutez plus d'intérêts à vos profils pour améliorer les suggestions
                  </Text>
                </View>
              ) : (
                <View style={styles.recommendationsList}>
                  {recommendations.map((activity, index) => {
                    const matchPercentage = getMatchPercentage(activity.score);
                    const matchColor = getMatchColor(matchPercentage);
                    const isProposing = proposing && selectedActivity === activity.id;

                    return (
                      <View key={activity.id} style={styles.activityCard}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>

                        {activity.image ? (
                          <ImageBackground
                            source={{ uri: activity.image }}
                            style={styles.activityImage}
                            imageStyle={{ borderRadius: 16 }}
                          >
                            <LinearGradient
                              colors={["transparent", "rgba(0,0,0,0.8)"]}
                              style={styles.activityImageOverlay}
                            />
                          </ImageBackground>
                        ) : (
                          <LinearGradient
                            colors={["#7C3AED", "#5B21B6"]}
                            style={styles.activityImage}
                          />
                        )}

                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle} numberOfLines={2}>
                            {activity.title}
                          </Text>

                          <View style={styles.matchContainer}>
                            <View
                              style={[
                                styles.matchBadge,
                                { backgroundColor: `${matchColor}20`, borderColor: `${matchColor}40` },
                              ]}
                            >
                              <Icon name="checkmark-circle" size={16} color={matchColor} />
                              <Text style={[styles.matchText, { color: matchColor }]}>
                                Match: {matchPercentage}%
                              </Text>
                            </View>

                            {activity.isNew && (
                              <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>Nouveau</Text>
                              </View>
                            )}
                          </View>

                          {activity.matchedInterests && activity.matchedInterests.length > 0 && (
                            <View style={styles.interestsContainer}>
                              {activity.matchedInterests.slice(0, 3).map((interest, idx) => (
                                <View key={idx} style={styles.interestTag}>
                                  <Text style={styles.interestTagText}>#{interest}</Text>
                                </View>
                              ))}
                              {activity.matchedInterests.length > 3 && (
                                <Text style={styles.moreInterests}>
                                  +{activity.matchedInterests.length - 3}
                                </Text>
                              )}
                            </View>
                          )}

                          <View style={styles.metaContainer}>
                            <View style={styles.metaItem}>
                              <Icon name="location" size={14} color={COLORS.textSecondary} />
                              <Text style={styles.metaText} numberOfLines={1}>
                                {activity.location.split(" - ")[0]}
                              </Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Icon
                                name={activity.price === "Gratuit" ? "gift" : "card"}
                                size={14}
                                color={COLORS.textSecondary}
                              />
                              <Text style={styles.metaText}>{activity.price}</Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.proposeButtonWrapper}
                            onPress={() => proposeActivity(activity)}
                            disabled={isProposing}
                          >
                            <LinearGradient
                              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.proposeButton}
                            >
                              {isProposing ? (
                                <ActivityIndicator size="small" color={COLORS.textPrimary} />
                              ) : (
                                <>
                                  <Icon name="send" size={16} color={COLORS.textPrimary} />
                                  <Text style={styles.proposeButtonText}>Proposer au groupe</Text>
                                </>
                              )}
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  recommendationsList: {
    gap: 20,
  },
  activityCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFD700",
  },
  activityImage: {
    height: 160,
    justifyContent: "flex-end",
  },
  activityImageOverlay: {
    height: "100%",
  },
  activityContent: {
    padding: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  matchText: {
    fontSize: 13,
    fontWeight: "700",
  },
  newBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  interestTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6366F1",
  },
  moreInterests: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    alignSelf: "center",
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  proposeButtonWrapper: {
    borderRadius: 999,
    overflow: "hidden",
  },
  proposeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  proposeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});