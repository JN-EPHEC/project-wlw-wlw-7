import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import Logo from "../../components/Logo";
import { auth, db } from "../../firebase_Config";
import { generateActivities } from "../../service/generateActivities";
import {
  checkLocationPermission,
  LocationData,
  requestLocationPermission,
  saveUserLocation
} from "../../service/Location_service";

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
}

export default function HomeScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [generating, setGenerating] = useState(false);

  // États pour la géolocalisation
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  const handleGenerateActivities = async () => {
    setGenerating(true);
    try {
      const result = await generateActivities();
      if (result.success) {
        Alert.alert("Succès", `${result.count} activités générées ! 🎉`);
        await loadActivities();
      } else {
        Alert.alert("Erreur", "Impossible de générer les activités");
      }
    } catch (error) {
      console.error("Error generating:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadActivities();
    loadFavorites();
    checkExistingLocationPermission();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, searchQuery, activeFilter, showFavorites, favorites]);

  // Vérifier si la permission de localisation existe déjà
  const checkExistingLocationPermission = async () => {
    const granted = await checkLocationPermission();
    if (granted) {
      setLocationGranted(true);
      const { location } = await requestLocationPermission();
      if (location) {
        setUserLocation(location);
      }
    }
  };

  // Gérer le filtre "Près de moi"
  const handleNearbyFilter = async () => {
    if (!locationGranted) {
      Alert.alert(
        "📍 Localisation requise",
        "Pour voir les activités près de vous, nous avons besoin d'accéder à votre localisation.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Autoriser",
            onPress: async () => {
              const { granted, location } = await requestLocationPermission();
              if (granted && location) {
                setLocationGranted(true);
                setUserLocation(location);
                await saveUserLocation(location);
                setActiveFilter("near");
                
                Alert.alert(
                  "📍 Localisation activée",
                  `Nous avons détecté que vous êtes à ${location.city || "votre ville"} !`
                );
              } else {
                Alert.alert(
                  "⚠️ Permission refusée",
                  "Pour utiliser le filtre 'Près de moi', autorisez l'accès à votre localisation dans les paramètres."
                );
              }
            },
          },
        ]
      );
    } else {
      setActiveFilter(activeFilter === "near" ? "all" : "near");
    }
  };

  const loadActivities = async () => {
    try {
      const activitiesSnapshot = await getDocs(collection(db, "activities"));
      const activitiesList: Activity[] = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));

      setActivities(activitiesList);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "userFavorites", currentUser.uid));
      if (userDoc.exists()) {
        setFavorites(userDoc.data().favorites || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (showFavorites) {
      filtered = filtered.filter(activity => favorites.includes(activity.id));
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!showFavorites) {
      if (activeFilter === "near" && userLocation) {
        const brusselsCommunes = [
          "auderghem", "berchem-sainte-agathe", "bruxelles", "etterbeek",
          "evere", "forest", "ganshoren", "ixelles", "jette", "koekelberg",
          "molenbeek", "molenbeek-saint-jean", "saint-gilles", "saint-josse",
          "saint-josse-ten-noode", "schaerbeek", "uccle", "watermael-boitsfort",
          "woluwe-saint-lambert", "woluwe-saint-pierre", "anderlecht"
        ];

        const userCity = userLocation.city?.toLowerCase() || "";
        
        const isInBrussels = brusselsCommunes.some(commune => 
          userCity.includes(commune) || commune.includes(userCity)
        );

        if (isInBrussels) {
          filtered = filtered.filter(activity => {
            const activityLocation = activity.location.toLowerCase();
            return activityLocation.includes("bruxelles") || 
                   activityLocation.includes("brussels") ||
                   brusselsCommunes.some(commune => activityLocation.includes(commune));
          });
        } else {
          filtered = filtered.filter(activity =>
            activity.location.toLowerCase().includes(userCity)
          );
        }
      } else if (activeFilter === "free") {
        filtered = filtered.filter(activity => activity.price === "Gratuit");
      } else if (activeFilter === "new") {
        filtered = filtered.filter(activity => activity.isNew);
      }
    }

    setFilteredActivities(filtered);
  };

  const toggleFavorite = async (activityId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userFavRef = doc(db, "userFavorites", currentUser.uid);
      const isFavorite = favorites.includes(activityId);

      if (isFavorite) {
        await updateDoc(userFavRef, {
          favorites: arrayRemove(activityId)
        });
        setFavorites(prev => prev.filter(id => id !== activityId));
      } else {
        const userFavDoc = await getDoc(userFavRef);
        
        if (userFavDoc.exists()) {
          await updateDoc(userFavRef, {
            favorites: arrayUnion(activityId)
          });
        } else {
          await setDoc(userFavRef, {
            favorites: [activityId]
          });
        }
        
        setFavorites(prev => [...prev, activityId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Erreur", "Impossible de gérer les favoris");
    }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.background}
      >
        {/* HEADER STICKY */}
        <View style={styles.stickyHeader}>
          {showFavorites ? (
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowFavorites(false)}
              >
                <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <View style={styles.favoritesHeader}>
                <Icon name="heart" size={28} color={COLORS.error} />
                <Text style={styles.favoritesTitle}>Mes Favoris</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>
          ) : (
            <View style={styles.header}>
              <Logo size="medium" />
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowFavorites(true)}
              >
                <Icon name="heart-outline" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* LOCATION BADGE */}
          {!showFavorites && userLocation && locationGranted && (
            <View style={styles.locationBadgeContainer}>
              <View style={styles.locationBadge}>
                <Icon name="location" size={16} color="#6366F1" />
                <Text style={styles.locationText}>{userLocation.city}</Text>
              </View>
            </View>
          )}

          {showFavorites && (
            <View style={styles.favoritesCount}>
              <Text style={styles.favoritesCountText}>
                {favorites.length} {favorites.length > 1 ? "activités" : "activité"}
              </Text>
            </View>
          )}

          {/* BARRE DE RECHERCHE */}
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              placeholder={showFavorites ? "Rechercher dans mes favoris" : "Rechercher une activité"}
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="close" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTRES */}
          {!showFavorites && (
            <View style={styles.filters}>
              <TouchableOpacity 
                style={[
                  styles.chip, 
                  activeFilter === "near" && styles.chipActive,
                  !locationGranted && styles.chipPending
                ]}
                onPress={handleNearbyFilter}
              >
                <Icon 
                  name={locationGranted ? "location" : "location-outline"} 
                  size={14} 
                  color={activeFilter === "near" ? COLORS.textPrimary : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, activeFilter === "near" && styles.chipTextActive]}>
                  Près de moi
                </Text>
                {!locationGranted && <View style={styles.permissionDot} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.chip, activeFilter === "free" && styles.chipActive]}
                onPress={() => setActiveFilter(activeFilter === "free" ? "all" : "free")}
              >
                <Text style={[styles.chipText, activeFilter === "free" && styles.chipTextActive]}>
                  Gratuit
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.chip, activeFilter === "new" && styles.chipActive]}
                onPress={() => setActiveFilter(activeFilter === "new" ? "all" : "new")}
              >
                <Text style={[styles.chipText, activeFilter === "new" && styles.chipTextActive]}>
                  Nouveau
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* CONTENU SCROLLABLE */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* BOUTON GÉNÉRER ACTIVITÉS */}
          {activities.length === 0 && !loading && !showFavorites && (
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateActivities}
              disabled={generating}
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                <Icon name="rocket" size={20} color={COLORS.textPrimary} />
                <Text style={styles.generateButtonText}>
                  {generating ? "Génération..." : "🎯 Générer 100 activités"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* LISTE DES ACTIVITÉS */}
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon 
                name={showFavorites ? "heart-dislike-outline" : "sad-outline"} 
                size={64} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.emptyText}>
                {showFavorites 
                  ? "Aucun favori pour le moment"
                  : activeFilter === "near" && userLocation
                  ? `Aucune activité près de ${userLocation.city}`
                  : "Aucune activité trouvée"}
              </Text>
              <Text style={styles.emptySubtext}>
                {showFavorites
                  ? "Ajoutez des activités à vos favoris en cliquant sur ❤️"
                  : "Essayez de modifier vos filtres"}
              </Text>
            </View>
          ) : (
            <View style={styles.cards}>
              {filteredActivities.map((activity, index) => {
                const isFavorite = favorites.includes(activity.id);
                
                return (
                  <TouchableOpacity 
                    key={activity.id} 
                    style={styles.card}
                    onPress={() => router.push(`/activity/${activity.id}` as any)}
                    activeOpacity={0.8}
                  >
                    {activity.image ? (
                      <ImageBackground
                        source={{ uri: activity.image }}
                        style={styles.cardImage}
                        imageStyle={{ borderRadius: 24 }}
                      >
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTag}>
                            <Text style={styles.cardTagText}>{activity.category}</Text>
                          </View>
                          {activity.isNew && (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>Nouveau</Text>
                            </View>
                          )}
                        </View>
                      </ImageBackground>
                    ) : (
                      <LinearGradient
                        colors={index % 2 === 0 ? ["#7C3AED", "#5B21B6"] : ["#9F7AEA", "#6B46C1"]}
                        style={styles.cardImage}
                      >
                        <View style={styles.cardHeader}>
                          <View style={styles.cardTag}>
                            <Text style={styles.cardTagText}>{activity.category}</Text>
                          </View>
                          {activity.isNew && (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>Nouveau</Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    )}

                    <TouchableOpacity 
                      style={styles.cardHeart}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(activity.id);
                      }}
                    >
                      <Icon 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFavorite ? COLORS.error : COLORS.textPrimary} 
                      />
                    </TouchableOpacity>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{activity.title}</Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {activity.description}
                      </Text>
                      <View style={styles.cardMeta}>
                        <View style={styles.cardMetaItem}>
                          <Icon name="location" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.cardMetaText}>{activity.location}</Text>
                        </View>
                        <View style={styles.cardMetaItem}>
                          <Icon 
                            name={activity.price === "Gratuit" ? "pricetag" : "cash"} 
                            size={14} 
                            color={activity.price === "Gratuit" ? COLORS.success : COLORS.warning} 
                          />
                          <Text style={[
                            styles.cardMetaText,
                            { color: activity.price === "Gratuit" ? COLORS.success : COLORS.warning }
                          ]}>
                            {activity.price}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardDate}>
                          {new Date(activity.date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
    backgroundColor: COLORS.backgroundTop,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    gap: 20,
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationBadgeContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#6366F1",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C122D",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C122D",
    alignItems: "center",
    justifyContent: "center",
  },
  favoritesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  favoritesTitle: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  favoritesCount: {
    backgroundColor: "#1C122D",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
  },
  favoritesCountText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C122D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  filters: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1B3D",
    backgroundColor: "transparent",
    position: "relative",
  },
  chipPending: {},
  chipActive: {
    backgroundColor: "#2A1B3D",
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  permissionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
    position: "absolute",
    top: 4,
    right: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: "#1A0F2A",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardImage: {
    height: 180,
    borderRadius: 24,
    margin: 12,
    padding: 14,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  cardTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardTagText: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },
  newBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.success,
  },
  newBadgeText: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Bold",
    fontSize: 11,
  },
  cardHeart: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cardDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  generateButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});