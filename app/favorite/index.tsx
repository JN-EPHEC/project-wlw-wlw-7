// app/(app)/favorites.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../lib/firebaseConfig";
import { useAuth } from "../lib/auth-context";

const COLORS = {
  backgroundStart: "#110A1E",
  backgroundEnd: "#0A0612",
  cardBg: "#0A051C",
  cardBorder: "#1F1A2F",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  accent: "#B57BFF",
  primary: "#3A2A60",
};

const TYPO = {
  h1: { fontFamily: "Poppins-Bold" as const, fontSize: 22 },
  body: { fontFamily: "Poppins-Regular" as const, fontSize: 14 },
  button: { fontFamily: "Poppins-SemiBold" as const, fontSize: 14 },
};

type FavoriteItem = {
  id: string;
  type: "activity" | "game";
  title: string;
  subtitle: string;
  category: string;
  badge?: string; // ex: "Aujourd'hui", "Nouveau", "Jeu"
};

// 👉 Pour l’instant : mock. Plus tard tu remplacerais ça par Firestore.
const MOCK_FAVORITES: FavoriteItem[] = [
  // Exemple : tu peux laisser vide si tu préfères
  // {
  //   id: "1",
  //   type: "activity",
  //   title: "Concert",
  //   subtitle: "Ambiance live avec ton groupe",
  //   category: "Sortie",
  //   badge: "Aujourd'hui",
  // },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading] = React.useState(false);
  const [items] = React.useState<FavoriteItem[]>(MOCK_FAVORITES);

  // 👉 Quand tu brancheras Firestore, tu pourras faire un useEffect ici :
  //
  // React.useEffect(() => {
  //   if (!user) return;
  //   const loadFavorites = async () => {
  //     setLoading(true);
  //     try {
  //       const snap = await getDocs(
  //         collection(db, "users", user.uid, "favorites")
  //       );
  //       const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FavoriteItem[];
  //       setItems(data);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadFavorites();
  // }, [user]);

  // Si pas connecté, on affiche juste un message simple
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
          style={styles.gradient}
        >
          <View style={styles.centered}>
            <Text style={styles.notLoggedText}>
              Connecte-toi pour voir tes favoris.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Favoris</Text>

            {/* spacer pour équilibrer visuellement */}
            <View style={{ width: 32 }} />
          </View>

          {/* INTRO */}
          <View style={styles.introBlock}>
            <Text style={styles.title}>Tes coups de cœur 💜</Text>
            <Text style={styles.subtitle}>
              Retrouve ici toutes les activités et les jeux que tu as ajoutés en
              favoris depuis l&apos;accueil et l&apos;onglet Jeux.
            </Text>
          </View>

          {/* CONTENU */}
          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={COLORS.accent} />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="heart-outline"
                size={36}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyTitle}>Aucun favori pour l&apos;instant</Text>
              <Text style={styles.emptyText}>
                Ajoute une activité ou un jeu en appuyant sur le cœur. Ils
                apparaîtront automatiquement ici.
              </Text>
              <TouchableOpacity
                style={styles.goDiscoverButton}
                activeOpacity={0.9}
                onPress={() => router.push("/home")}
              >
                <Text style={styles.goDiscoverButtonText}>
                  Découvrir des activités
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTypeBadge}>
                      <Ionicons
                        name={item.type === "game" ? "game-controller" : "location"}
                        size={13}
                        color={COLORS.textPrimary}
                      />
                      <Text style={styles.cardTypeText}>
                        {item.type === "game" ? "Jeu" : "Activité"}
                      </Text>
                    </View>

                    {item.badge && (
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{item.category}</Text>
                    </View>

                    <TouchableOpacity
  style={styles.detailsButton}
  activeOpacity={0.9}
  onPress={() => {
    if (item.type === "game") {
      router.push("/games");
    } else {
      router.push("/home");
    }
  }}
>
  <Text style={styles.detailsButtonText}>Voir les détails</Text>
</TouchableOpacity>

                  </View>
                </View>
              ))}
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
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...TYPO.h1,
    fontSize: 20,
    color: COLORS.textPrimary,
  },

  // INTRO
  introBlock: {
    marginTop: 12,
    gap: 6,
  },
  title: {
    ...TYPO.h1,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },

  // LISTE / CARDS
  list: {
    marginTop: 16,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1C0F3A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardTypeText: {
    ...TYPO.body,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  cardBadge: {
    backgroundColor: "#312E81",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardBadgeText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryPill: {
    borderRadius: 999,
    backgroundColor: "#141329",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryPillText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  detailsButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
  },

  // EMPTY STATE
  loadingWrapper: {
    marginTop: 24,
    alignItems: "center",
  },
  emptyState: {
    marginTop: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  emptyText: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  goDiscoverButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  goDiscoverButtonText: {
    ...TYPO.button,
    color: COLORS.textPrimary,
  },

  // NOT LOGGED
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  notLoggedText: {
    ...TYPO.body,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
});
