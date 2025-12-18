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
import { generateMoreActivities } from "../../service/generateMoreActivities";
import {
  checkLocationPermission,
  LocationData,
  requestLocationPermission,
  saveUserLocation
} from "../../service/Location_service";
import { getPersonalizedActivities, PersonalScoredActivity } from "../../service/personalScoring";

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
  distance?: number;
  personalScore?: number;
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

  // États pour les recommandations personnalisées
  const [personalizedActivities, setPersonalizedActivities] = useState<PersonalScoredActivity[]>([]);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);

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

  const handleGenerateMoreActivities = async () => {
    setGenerating(true);
    try {
      const result = await generateMoreActivities();
      if (result.success) {
        Alert.alert("Succès", `${result.count} activités ajoutées ! 🎉`);
        await loadActivities();
      } else {
        Alert.alert("Erreur", "Impossible d'ajouter les activités");
      }
    } catch (error) {
      console.error("Error generating more:", error);
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
    if (!showPersonalized) {
      applyFilters();
    }
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

  // 🎯 CHARGER LES ACTIVITÉS PERSONNALISÉES
  const loadPersonalizedActivities = async () => {
    if (showPersonalized) {
      setShowPersonalized(false);
      setActiveFilter("all");
      return;
    }

    setLoadingPersonalized(true);
    try {
      console.log("🎯 Chargement des recommandations personnalisées...");
      const personalized = await getPersonalizedActivities();
      
      if (personalized.length === 0) {
        Alert.alert(
          "Aucune recommandation",
          "Complète ton profil (intérêts, localisation) pour recevoir des recommandations personnalisées !"
        );
        return;
      }

      setPersonalizedActivities(personalized);
      setShowPersonalized(true);
      setActiveFilter("personalized");
      
      if (searchQuery.trim()) {
        const filtered = personalized.filter(activity =>
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredActivities(filtered as Activity[]);
      } else {
        setFilteredActivities(personalized as Activity[]);
      }

    } catch (error) {
      console.error("Error loading personalized activities:", error);
      Alert.alert("Erreur", "Impossible de charger les recommandations personnalisées");
    } finally {
      setLoadingPersonalized(false);
    }
  };

  // Gérer le filtre "Près de moi"
  const handleNearbyFilter = async () => {
    if (showPersonalized) {
      setShowPersonalized(false);
    }

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
      // Filtre par catégorie
      if (activeFilter.startsWith("category:")) {
        const category = activeFilter.split(":")[1];
        filtered = filtered.filter(activity =>
          activity.category.toLowerCase() === category.toLowerCase()
        );
      } else if (activeFilter === "near" && userLocation) {
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
        {/* HEADER STICKY - VERSION COMPACTE */}
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
                <Icon name="heart" size={24} color={COLORS.error} />
                <Text style={styles.favoritesTitle}>Favoris</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>
          ) : (
            <>
              {/* LIGNE 1 : LOGO + LOCALISATION + FAVORIS */}
              <View style={styles.headerRow}>
                <Logo size="small" />
                
                {userLocation && locationGranted && (
                  <View style={styles.locationBadgeCompact}>
                    <Icon name="location" size={12} color="#6366F1" />
                    <Text style={styles.locationTextCompact}>{userLocation.city}</Text>
                  </View>
                )}
                
                <View style={{ flex: 1 }} />
                
                <TouchableOpacity 
                  style={styles.iconButtonCompact}
                  onPress={() => setShowFavorites(true)}
                >
                  <Icon name="heart-outline" size={16} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              {/* LIGNE 2 : BARRE DE RECHERCHE */}
              <View style={styles.searchBarCompact}>
                <Icon name="search" size={16} color={COLORS.textSecondary} />
                <TextInput
                  placeholder="Rechercher..."
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.searchInputCompact}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Icon name="close" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* LIGNE 3 : FILTRES COMPACTS (SCROLLABLE) */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
              >
                {/* POUR TOI */}
                <TouchableOpacity 
                  style={[
                    styles.chipCompact, 
                    showPersonalized && styles.chipPersonalizedCompact
                  ]}
                  onPress={loadPersonalizedActivities}
                  disabled={loadingPersonalized}
                >
                  {loadingPersonalized ? (
                    <ActivityIndicator size="small" color="#F59E0B" />
                  ) : (
                    <>
                      <Icon 
                        name="sparkles" 
                        size={12} 
                        color={showPersonalized ? "#F59E0B" : COLORS.textSecondary}
                      />
                      <Text style={[
                        styles.chipTextCompact, 
                        showPersonalized && styles.chipTextPersonalizedCompact
                      ]}>
                        Pour toi
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* PRÈS DE MOI */}
                <TouchableOpacity 
                  style={[
                    styles.chipCompact, 
                    activeFilter === "near" && styles.chipActiveCompact
                  ]}
                  onPress={handleNearbyFilter}
                >
                  <Icon 
                    name="location" 
                    size={12} 
                    color={activeFilter === "near" ? COLORS.textPrimary : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.chipTextCompact, 
                    activeFilter === "near" && styles.chipTextActiveCompact
                  ]}>
                    Proche
                  </Text>
                </TouchableOpacity>

                {/* GRATUIT */}
                <TouchableOpacity 
                  style={[
                    styles.chipCompact, 
                    activeFilter === "free" && styles.chipActiveCompact
                  ]}
                  onPress={() => {
                    setShowPersonalized(false);
                    setActiveFilter(activeFilter === "free" ? "all" : "free");
                  }}
                >
                  <Icon 
                    name="pricetag" 
                    size={12} 
                    color={activeFilter === "free" ? COLORS.success : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.chipTextCompact, 
                    activeFilter === "free" && styles.chipTextActiveCompact
                  ]}>
                    Gratuit
                  </Text>
                </TouchableOpacity>

                {/* NOUVEAU */}
                <TouchableOpacity 
                  style={[
                    styles.chipCompact, 
                    activeFilter === "new" && styles.chipActiveCompact
                  ]}
                  onPress={() => {
                    setShowPersonalized(false);
                    setActiveFilter(activeFilter === "new" ? "all" : "new");
                  }}
                >
                  <Icon 
                    name="star" 
                    size={12} 
                    color={activeFilter === "new" ? COLORS.warning : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.chipTextCompact, 
                    activeFilter === "new" && styles.chipTextActiveCompact
                  ]}>
                    Nouveau
                  </Text>
                </TouchableOpacity>

                {/* CATÉGORIES */}
                <TouchableOpacity 
                  style={[
                    styles.chipCompact, 
                    activeFilter.startsWith("category:") && styles.chipActiveCompact
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "Catégories",
                      "Quelle catégorie ?",
                      [
                        { text: "Sport", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Sport");
                        }},
                        { text: "Gaming", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Gaming");
                        }},
                        { text: "Culture", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Culture");
                        }},
                        { text: "Cinéma", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Cinéma");
                        }},
                        { text: "Musique", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Musique");
                        }},
                        { text: "Nature", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Nature");
                        }},
                        { text: "Événement", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Événement");
                        }},
                        { text: "Soirée", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Soirée");
                        }},
                        { text: "Danse", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Danse");
                        }},
                        { text: "Food", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Food");
                        }},
                        { text: "Atelier", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Atelier");
                        }},
                        { text: "Bien-être", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Bien-être");
                        }},
                        { text: "Shopping", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Shopping");
                        }},
                        { text: "Famille", onPress: () => {
                          setShowPersonalized(false);
                          setActiveFilter("category:Famille");
                        }},
                        { text: "Tous", onPress: () => setActiveFilter("all"), style: "cancel" },
                      ]
                    );
                  }}
                >
                  <Icon 
                    name="grid" 
                    size={12} 
                    color={activeFilter.startsWith("category:") ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.chipTextCompact, 
                    activeFilter.startsWith("category:") && styles.chipTextActiveCompact
                  ]}>
                    Catégorie
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* MESSAGE PERSONNALISÉ (si actif) */}
              {showPersonalized && (
                <View style={styles.personalizedBannerCompact}>
                  <Icon name="sparkles" size={14} color="#F59E0B" />
                  <Text style={styles.personalizedTextCompact}>
                    Sélectionnées pour toi
                  </Text>
                </View>
              )}
            </>
          )}

          {showFavorites && (
            <View style={styles.favoritesCount}>
              <Text style={styles.favoritesCountText}>
                {favorites.length} {favorites.length > 1 ? "activités" : "activité"}
              </Text>
            </View>
          )}
        </View>

        {/* CONTENU SCROLLABLE */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* BOUTONS GÉNÉRATION ACTIVITÉS */}
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
                  {generating ? "Génération..." : "🎯 Générer 50 activités"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* BOUTON AJOUTER 50 ACTIVITÉS */}
          {activities.length > 0 && activities.length < 80 && !loading && !showFavorites && (
            <TouchableOpacity 
              style={[styles.generateButton, { marginBottom: 16 }]}
              onPress={handleGenerateMoreActivities}
              disabled={generating}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                <Icon name="add-circle" size={20} color={COLORS.textPrimary} />
                <Text style={styles.generateButtonText}>
                  {generating ? "Ajout..." : "➕ Ajouter 50 activités variées"}
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
                  : showPersonalized
                  ? "Complète ton profil pour des recommandations"
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
                    onPress={() => {
                      // @ts-ignore
                      router.push(`/activity/${activity.id}`);
                    }}
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

                    {/* SCORE PERSONNALISÉ */}
                    {showPersonalized && activity.personalScore && (
                      <View style={styles.scoreBadge}>
                        <Icon name="star" size={12} color="#F59E0B" />
                        <Text style={styles.scoreText}>{activity.personalScore}%</Text>
                      </View>
                    )}

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{activity.title}</Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {activity.description}
                      </Text>
                      <View style={styles.cardMeta}>
                        <View style={styles.cardMetaItem}>
                          <Icon name="location" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.cardMetaText} numberOfLines={1}>
                            {activity.distance 
                              ? `${activity.distance.toFixed(1)} km`
                              : activity.location
                            }
                          </Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBadgeCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  locationTextCompact: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: "#6366F1",
  },
  iconButtonCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  favoritesCount: {
    backgroundColor: "#1C122D",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "center",
  },
  favoritesCountText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  searchBarCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C122D",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInputCompact: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chipCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1B3D",
    backgroundColor: "transparent",
  },
  chipActiveCompact: {
    backgroundColor: "#2A1B3D",
    borderColor: COLORS.primary,
  },
  chipPersonalizedCompact: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "#F59E0B",
  },
  chipTextCompact: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
  },
  chipTextActiveCompact: {
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  chipTextPersonalizedCompact: {
    color: "#F59E0B",
    fontFamily: "Poppins-SemiBold",
  },
  personalizedBannerCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  personalizedTextCompact: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: "#F59E0B",
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
  scoreBadge: {
    position: "absolute",
    top: 18,
    right: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(245, 158, 11, 0.9)",
  },
  scoreText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
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
    flex: 1,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    flex: 1,
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