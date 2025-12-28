// service/activityMatching.ts
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase_Config";

// Interface Activity
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

// Interface ScoredActivity
export interface ScoredActivity extends Activity {
  score: number;
  matchedInterests: string[];
  explanation: string;
}

/**
 * ALGORITHME PRINCIPAL - SIMPLIFIÉ POUR PROJET SCOLAIRE
 */
export async function suggestActivitiesForGroup(groupId: string): Promise<ScoredActivity[]> {

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
        allInterests.push(...interests.map((i: string) => i.toLowerCase()));
      }
    }

    // 3. Normaliser et trouver les intérêts UNIQUES
    const uniqueInterests = [...new Set(allInterests)];

    // Si pas d'intérêts, utiliser des intérêts par défaut
    if (uniqueInterests.length === 0) {
      uniqueInterests.push("culture", "divertissement", "sport");
    }

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

    // 5. Scorer chaque activité
    const scoredActivities: ScoredActivity[] = allActivities.map(activity => {
      const { score, matchedInterests } = calculateSimpleScore(
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
      .slice(0, 5); // ⭐ TOP 5,SEULEMENT

    filteredActivities.forEach((act, index) => {
    });

    // 7. Sauvegarder dans Firestore (si activités trouvées)
    if (filteredActivities.length > 0) {
      await saveSuggestions(groupId, filteredActivities, uniqueInterests);
    } else {
    }

    return filteredActivities;

  } catch (error: any) {
    console.error("❌ Erreur dans l'algorithme:", error);
    return [];
  }
}

/**
 * CALCUL DE SCORE SIMPLIFIÉ - SPECIAL BOWLING DÉTECTION
 */
function calculateSimpleScore(
  activity: Activity,
  groupInterests: string[],
  groupCity: string
): { score: number; matchedInterests: string[] } {
  let score = 0;
  const matchedInterests: string[] = [];

  const activityInterests = (activity.interests || []).map(i => i.toLowerCase());
  const activityTitle = activity.title.toLowerCase();
  
  // ⭐⭐ DÉTECTION SPÉCIALE BOWLING ! ⭐⭐
  const isBowlingActivity = activityTitle.includes("bowling");
  
  // Vérifier chaque intérêt du groupe
  groupInterests.forEach(interest => {
    const interestLower = interest.toLowerCase();
    
    // 🎳 CAS BOWLING : Si l'activité est bowling ET l'user aime bowling
    if (isBowlingActivity && interestLower === "bowling") {
      score += 60; // ⭐ BONUS ÉNORME POUR BOWLING
      matchedInterests.push("bowling");
      return;
    }
    
    // Match normal avec les intérêts
    if (activityInterests.some((actInterest: string) => 
      actInterest.includes(interestLower) || interestLower.includes(actInterest)
    )) {
      score += 30;
      if (!matchedInterests.includes(interest)) {
        matchedInterests.push(interest);
      }
      return;
    }
    
    // Match avec le titre
    if (activityTitle.includes(interestLower)) {
      score += 25;
      if (!matchedInterests.includes(interest)) {
        matchedInterests.push(interest);
      }
    }
  });

  // Bonus localisation (10 points)
  if (groupCity && activity.location?.toLowerCase().includes(groupCity.toLowerCase())) {
    score += 10;
  }

  // Bonus prix gratuit (15 points)
  if (activity.price === "Gratuit") {
    score += 15;
  }

  // Bonus nouveauté (5 points)
  if (activity.isNew) {
    score += 5;
  }

  // Bonus si activité populaire (rating > 4)
  if (activity.rating && activity.rating > 4.0) {
    score += 10;
  }

  // Limiter le score à 100
  const finalScore = Math.min(100, Math.round(score));
  
  return {
    score: finalScore,
    matchedInterests: matchedInterests,
  };
}

/**
 * Fonction pour obtenir une explication du score
 */
function getScoreExplanation(score: number, matchedInterests: string[], activity: Activity): string {
  const explanations: string[] = [];
  
  if (matchedInterests.length > 0) {
    explanations.push(`Match avec ${matchedInterests.length} intérêt(s)`);
  }
  
  if (activity.price === "Gratuit") {
    explanations.push("Gratuit");
  }
  
  if (activity.isNew) {
    explanations.push("Nouveauté");
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

  } catch (error: any) {
    console.error("❌ Erreur sauvegarde:", error.message);
  }
}

/**
 * Récupérer les suggestions d'un groupe
 */
export async function getGroupSuggestions(groupId: string): Promise<ScoredActivity[]> {
  try {
    const suggestionsDoc = await getDoc(doc(db, "groupSuggestions", groupId));
    
    // Si pas de suggestions, les calculer
    if (!suggestionsDoc.exists()) {
      return await suggestActivitiesForGroup(groupId);
    }

    // Récupérer les activités complètes
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

    // Trier par score et limiter à 10
    return activities
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  } catch (error) {
    console.error("❌ Erreur récupération suggestions:", error);
    return [];
  }
}