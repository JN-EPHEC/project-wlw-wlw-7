// service/improvedActivityMatching.ts
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase_Config";

// Interface Activity (identique)
export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  interests: string[];
  tags?: string[];
  price: "Gratuit" | "Payant";
  location: string;
  image: string;
  isNew: boolean;
  date: string;
  city?: string;
  rating?: number;
}

// Interface ScoredActivity (identique)
export interface ScoredActivity extends Activity {
  score: number;
  matchedInterests: string[];
  explanation: string;
}

/**
 * SYSTÈME DE TAGS ENRICHI - MAPPING INTÉRÊTS → TAGS DÉTAILLÉS
 * Chaque intérêt utilisateur est lié à plusieurs tags qui représentent des activités concrètes
 */
const INTEREST_TAG_MAPPING: Record<string, string[]> = {
  // ===== CINÉMA =====
  "cinéma": [
    "film", "cinéma", "projection", "imax", "dolby", "blockbuster", 
    "avant-première", "séance", "ciné", "movie", "écran"
  ],
  
  // ===== THÉÂTRE =====
  "théâtre": [
    "théâtre", "spectacle", "pièce", "comédie", "one-man-show", 
    "marionnettes", "scène", "représentation", "humour", "stand-up"
  ],
  
  // ===== SPORT =====
  "sport": [
    "sport", "escalade", "karting", "bowling", "laser game", "trampoline",
    "running", "jogging", "fitness", "yoga", "pilates", "vélo", "cyclisme",
    "paddle", "kayak", "randonnée", "trek", "grimpe", "course", "entraînement",
    "piste", "salle de sport", "gym", "cardio", "natation"
  ],
  
  // ===== MUSÉE =====
  "musée": [
    "musée", "exposition", "art", "galerie", "magritte", "collection",
    "culture", "peinture", "sculpture", "histoire", "découverte", "visite guidée",
    "patrimoine", "beaux-arts", "contemporain"
  ],
  
  // ===== SORTIE =====
  "sortie": [
    "soirée", "bar", "club", "boîte", "danse", "dj", "concert", "festival",
    "fête", "ambiance", "nightlife", "techno", "électro", "house", "hip-hop",
    "pub", "terrasse", "apéro", "drink", "night", "nocturne"
  ],
  
  // ===== BOWLING =====
  "bowling": [
    "bowling", "piste", "strike", "boule", "jeu", "compétition", "équipe"
  ],
  
  // ===== RESTAURANT =====
  "restaurant": [
    "restaurant", "food", "cuisine", "brunch", "gastronomie", "chef",
    "dégustation", "repas", "manger", "bouffe", "culinaire", "plat",
    "atelier cuisine", "cours de cuisine", "cooking", "pâtisserie",
    "chocolat", "bière", "vin", "cocktail", "sushi", "italien", "pasta"
  ],
  
  // ===== CONCERT =====
  "concert": [
    "concert", "live", "musique", "scène", "acoustique", "jazz", "rock",
    "pop", "rap", "électro", "festival", "salle de concert", "artiste",
    "groupe", "chanteur", "show", "performance", "karaoké"
  ],
};

/**
 * NORMALISER ET ÉTENDRE LES INTÉRÊTS UTILISATEUR
 * Convertit les intérêts basiques en une liste enrichie de tags
 */
function expandUserInterests(userInterests: string[]): string[] {
  const expandedTags = new Set<string>();
  
  userInterests.forEach(interest => {
    const normalized = interest.toLowerCase().trim();
    
    // Ajouter l'intérêt lui-même
    expandedTags.add(normalized);
    
    // Ajouter tous les tags associés
    const relatedTags = INTEREST_TAG_MAPPING[normalized] || [];
    relatedTags.forEach(tag => expandedTags.add(tag));
  });
  
  return Array.from(expandedTags);
}

/**
 * EXTRAIRE TOUS LES MOTS-CLÉS D'UNE ACTIVITÉ
 * Analyse le titre, description, catégorie, intérêts et tags
 */
function extractActivityKeywords(activity: Activity): string[] {
  const keywords = new Set<string>();
  
  // Fonction helper pour nettoyer et ajouter des mots
  const addWords = (text: string) => {
    if (!text) return;
    const words = text.toLowerCase()
      .replace(/[.,!?;:()\[\]]/g, ' ') // Enlever ponctuation
      .split(/\s+/) // Séparer par espaces
      .filter(word => word.length > 2); // Garder mots > 2 lettres
    
    words.forEach(word => keywords.add(word));
  };
  
  // Extraire depuis tous les champs
  addWords(activity.title);
  addWords(activity.description);
  addWords(activity.category);
  
  // Ajouter intérêts et tags directement
  (activity.interests || []).forEach(interest => 
    keywords.add(interest.toLowerCase())
  );
  (activity.tags || []).forEach(tag => 
    keywords.add(tag.toLowerCase())
  );
  
  return Array.from(keywords);
}

/**
 * ALGORITHME DE MATCHING AMÉLIORÉ
 * Utilise la similarité textuelle et le matching de tags
 */
function calculateImprovedScore(
  activity: Activity,
  userInterests: string[],
  groupCity: string
): { score: number; matchedInterests: string[] } {
  
  let score = 0;
  const matchedInterests: string[] = [];
  
  // 1. ÉTENDRE LES INTÉRÊTS UTILISATEUR EN TAGS DÉTAILLÉS
  const userTags = expandUserInterests(userInterests);
  
  // 2. EXTRAIRE LES MOTS-CLÉS DE L'ACTIVITÉ
  const activityKeywords = extractActivityKeywords(activity);
  
  // 3. CALCULER LE SCORE DE MATCHING
  let matchCount = 0;
  
  userTags.forEach(userTag => {
    // Match exact
    if (activityKeywords.includes(userTag)) {
      score += 20;
      matchCount++;
      
      // Garder trace de l'intérêt original matché
      const originalInterest = userInterests.find(
        interest => interest.toLowerCase() === userTag || 
        INTEREST_TAG_MAPPING[interest.toLowerCase()]?.includes(userTag)
      );
      
      if (originalInterest && !matchedInterests.includes(originalInterest)) {
        matchedInterests.push(originalInterest);
      }
      return;
    }
    
    // Match partiel (contient le tag)
    const partialMatch = activityKeywords.some(keyword => 
      keyword.includes(userTag) || userTag.includes(keyword)
    );
    
    if (partialMatch) {
      score += 10;
      matchCount++;
      
      const originalInterest = userInterests.find(
        interest => interest.toLowerCase() === userTag || 
        INTEREST_TAG_MAPPING[interest.toLowerCase()]?.includes(userTag)
      );
      
      if (originalInterest && !matchedInterests.includes(originalInterest)) {
        matchedInterests.push(originalInterest);
      }
    }
  });
  
  // 4. BONUS MULTI-MATCH (si plusieurs intérêts matchent)
  if (matchCount >= 3) {
    score += 15; // Bonus si 3+ matchs
  } else if (matchCount >= 2) {
    score += 10; // Bonus si 2+ matchs
  }
  
  // 5. BONUS CATÉGORIE
  // Si la catégorie correspond à un intérêt, gros bonus
  const categoryLower = activity.category.toLowerCase();
  userInterests.forEach(interest => {
    const interestLower = interest.toLowerCase();
    if (categoryLower.includes(interestLower) || interestLower.includes(categoryLower)) {
      score += 15;
      if (!matchedInterests.includes(interest)) {
        matchedInterests.push(interest);
      }
    }
  });
  
  // 6. BONUS LOCALISATION (10 points)
  if (groupCity && activity.location?.toLowerCase().includes(groupCity.toLowerCase())) {
    score += 10;
  }
  
  // 7. BONUS PRIX GRATUIT (15 points)
  if (activity.price === "Gratuit") {
    score += 15;
  }
  
  // 8. BONUS NOUVEAUTÉ (5 points)
  if (activity.isNew) {
    score += 5;
  }
  
  // 9. BONUS POPULARITÉ (10 points)
  if (activity.rating && activity.rating > 4.0) {
    score += 10;
  }
  
  // 10. LIMITER LE SCORE À 100
  const finalScore = Math.min(100, Math.round(score));
  
  return {
    score: finalScore,
    matchedInterests: matchedInterests,
  };
}

/**
 * ALGORITHME PRINCIPAL AMÉLIORÉ
 */
export async function suggestActivitiesForGroupImproved(groupId: string): Promise<ScoredActivity[]> {
  
  try {
    // 1. Récupérer les membres du groupe
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      console.error("❌ Groupe non trouvé");
      return [];
    }

    const groupData = groupDoc.data();
    const memberIds = groupData.members || [];
    const groupCity = groupData.city || "Bruxelles";

    // 2. Récupérer les intérêts de chaque membre
    const allInterests: string[] = [];
    for (const memberId of memberIds) {
      const userDoc = await getDoc(doc(db, "users", memberId));
      if (userDoc.exists()) {
        const interests = userDoc.data().interests || [];
        allInterests.push(...interests);
      }
    }

    // 3. Normaliser et trouver les intérêts UNIQUES
    const uniqueInterests = [...new Set(allInterests)];

    // Si pas d'intérêts, utiliser des intérêts par défaut
    if (uniqueInterests.length === 0) {
      uniqueInterests.push("Sortie", "Sport", "Culture");
    }

    console.log("🎯 Intérêts du groupe:", uniqueInterests);

    // 4. Récupérer toutes les activités
    const activitiesSnapshot = await getDocs(collection(db, "activities"));

    const allActivities: Activity[] = [];
    activitiesSnapshot.forEach(doc => {
      const data = doc.data();
      allActivities.push({
        id: doc.id,
        title: data.title || "Sans titre",
        description: data.description || "",
        category: data.category || "Divers",
        interests: data.interests || [],
        tags: data.tags || [],
        price: data.price || "Payant",
        location: data.location || "",
        image: data.image || "",
        isNew: data.isNew || false,
        date: data.date || new Date().toISOString(),
        city: data.city || "",
        rating: data.rating || 0,
      });
    });

    console.log(`📊 ${allActivities.length} activités analysées`);

    // 5. Scorer chaque activité AVEC L'ALGO AMÉLIORÉ
    const scoredActivities: ScoredActivity[] = allActivities.map(activity => {
      const { score, matchedInterests } = calculateImprovedScore(
        activity, 
        uniqueInterests, 
        groupCity
      );

      return {
        ...activity,
        score,
        matchedInterests,
        explanation: getScoreExplanation(score, matchedInterests, activity),
      };
    });

    // 6. Filtrer, trier et LIMITER À 10 ACTIVITÉS MAX
    const filteredActivities = scoredActivities
      .filter(activity => activity.score > 5) // Ignorer les scores trop faibles
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // TOP 10

    console.log("✅ Top 10 activités:");
    filteredActivities.slice(0, 10).forEach((act, index) => {
      console.log(
        `${index + 1}. ${act.title} - Score: ${act.score} - Matchs: [${act.matchedInterests.join(", ")}]`
      );
    });

    // 7. Sauvegarder dans Firestore
    if (filteredActivities.length > 0) {
      await saveSuggestions(groupId, filteredActivities, uniqueInterests);
    }

    return filteredActivities;

  } catch (error: any) {
    console.error("❌ Erreur dans l'algorithme amélioré:", error);
    return [];
  }
}

/**
 * Fonction pour obtenir une explication du score
 */
function getScoreExplanation(score: number, matchedInterests: string[], activity: Activity): string {
  const explanations: string[] = [];
  
  if (matchedInterests.length > 0) {
    explanations.push(`${matchedInterests.length} intérêt(s) commun(s)`);
  }
  
  if (activity.price === "Gratuit") {
    explanations.push("Gratuit");
  }
  
  if (activity.isNew) {
    explanations.push("Nouveauté");
  }
  
  if (activity.rating && activity.rating > 4.0) {
    explanations.push(`⭐ ${activity.rating}`);
  }
  
  return explanations.join(' • ') || `Score: ${score}`;
}

/**
 * Sauvegarder les suggestions
 */
async function saveSuggestions(
  groupId: string, 
  activities: ScoredActivity[], 
  interests: string[]
) {
  try {
    const suggestionData = {
      groupId,
      commonInterests: interests,
      suggestedActivities: activities.map(a => ({
        id: a.id,
        title: a.title,
        score: a.score,
        matchedInterests: a.matchedInterests,
        category: a.category,
      })),
      totalActivities: activities.length,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(doc(db, "groupSuggestions", groupId), suggestionData, { merge: true });
    console.log("✅ Suggestions sauvegardées");

  } catch (error: any) {
    console.error("❌ Erreur sauvegarde:", error.message);
  }
}

/**
 * Récupérer les suggestions d'un groupe (identique)
 */
export async function getGroupSuggestionsImproved(groupId: string): Promise<ScoredActivity[]> {
  try {
    const suggestionsDoc = await getDoc(doc(db, "groupSuggestions", groupId));
    
    if (!suggestionsDoc.exists()) {
      return await suggestActivitiesForGroupImproved(groupId);
    }

    const activities: ScoredActivity[] = [];
    const data = suggestionsDoc.data();
    
    for (const suggestion of data.suggestedActivities || []) {
      const activityDoc = await getDoc(doc(db, "activities", suggestion.id));
      if (activityDoc.exists()) {
        const activityData = activityDoc.data();
        activities.push({
          id: activityDoc.id,
          title: activityData.title || "",
          description: activityData.description || "",
          category: activityData.category || "Divers",
          interests: activityData.interests || [],
          tags: activityData.tags || [],
          price: activityData.price || "Payant",
          location: activityData.location || "",
          image: activityData.image || "",
          isNew: activityData.isNew || false,
          date: activityData.date || new Date().toISOString(),
          city: activityData.city || "",
          rating: activityData.rating || 0,
          score: suggestion.score || 0,
          matchedInterests: suggestion.matchedInterests || [],
          explanation: `Score: ${suggestion.score} • ${suggestion.matchedInterests?.join(', ') || ''}`,
        });
      }
    }

    return activities.sort((a, b) => b.score - a.score).slice(0, 10);

  } catch (error) {
    console.error("❌ Erreur récupération suggestions:", error);
    return [];
  }
}