import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase_Config";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  price: "Gratuit" | "Payant";
  location: string;
  interests: string[];
  image: string;
  isNew: boolean;
  date: string;
}

interface GroupMember {
  id: string;
  interests: string[];
}

interface ScoredActivity extends Activity {
  score: number;
  matchedInterests: string[];
}

/**
 * ALGORITHME PRINCIPAL : Suggérer des activités pour un groupe
 */
export async function suggestActivitiesForGroup(groupId: string): Promise<ScoredActivity[]> {
  console.log(`🤖 Running algorithm for group ${groupId}...`);

  // 1. Récupérer les membres du groupe
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    console.error("Group not found");
    return [];
  }

  const groupData = groupDoc.data();
  const memberIds = groupData.members || [];

  // 2. Récupérer les intérêts de chaque membre
  const membersInterests: string[][] = [];
  for (const memberId of memberIds) {
    const userDoc = await getDoc(doc(db, "users", memberId));
    if (userDoc.exists()) {
      const interests = userDoc.data().interests || [];
      membersInterests.push(interests);
    }
  }

  // 3. Calculer les intérêts communs (présents chez TOUS les membres)
  const commonInterests = findCommonInterests(membersInterests);
  console.log("🎯 Common interests:", commonInterests);

  // Si aucun intérêt commun, utiliser l'union de tous les intérêts
  const allInterests = commonInterests.length > 0 
    ? commonInterests 
    : [...new Set(membersInterests.flat())];

  // 4. Récupérer toutes les activités
  const activitiesSnapshot = await getDocs(collection(db, "activities"));
  const activities: Activity[] = activitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Activity));

  console.log(`📊 Found ${activities.length} activities`);

  // 5. Scorer chaque activité
  const scoredActivities: ScoredActivity[] = activities.map(activity => {
    const score = calculateActivityScore(activity, allInterests, groupData.city);
    const matchedInterests = activity.interests.filter(interest => 
      allInterests.includes(interest)
    );

    return {
      ...activity,
      score,
      matchedInterests,
    };
  });

  // 6. Trier par score décroissant
  const sortedActivities = scoredActivities
    .filter(activity => activity.score > 0) // Garder seulement celles qui matchent
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

  console.log(`✅ Top suggestions:`, sortedActivities.map(a => ({
    title: a.title,
    score: a.score,
    matched: a.matchedInterests
  })));

  // 7. Sauvegarder les suggestions dans Firestore
  await setDoc(doc(db, "groupActivities", groupId), {
    commonInterests: allInterests,
    suggestedActivities: sortedActivities.map(a => a.id),
    lastUpdate: new Date().toISOString(),
    scores: sortedActivities.reduce((acc, a) => {
      acc[a.id] = a.score;
      return acc;
    }, {} as { [key: string]: number })
  });

  return sortedActivities;
}

/**
 * Trouver les intérêts présents chez TOUS les membres
 */
function findCommonInterests(membersInterests: string[][]): string[] {
  if (membersInterests.length === 0) return [];
  if (membersInterests.length === 1) return membersInterests[0];

  // Intersection de tous les arrays
  return membersInterests.reduce((common, interests) => 
    common.filter(interest => interests.includes(interest))
  );
}

/**
 * Calculer le score d'une activité pour un groupe
 */
function calculateActivityScore(
  activity: Activity,
  groupInterests: string[],
  groupCity?: string
): number {
  let score = 0;

  // 1. Score basé sur les intérêts matchés (0-100 points)
  const matchedInterests = activity.interests.filter(interest =>
    groupInterests.includes(interest)
  );
  const interestScore = groupInterests.length > 0
    ? (matchedInterests.length / groupInterests.length) * 100
    : 0;
  score += interestScore;

  // 2. Bonus si activité gratuite (+15 points)
  if (activity.price === "Gratuit") {
    score += 15;
  }

  // 3. Bonus si activité proche géographiquement (+20 points)
  if (groupCity && activity.location.toLowerCase().includes(groupCity.toLowerCase())) {
    score += 20;
  }

  // 4. Bonus si activité nouvelle (+10 points)
  if (activity.isNew) {
    score += 10;
  }

  // 5. Bonus si date proche (dans les 7 prochains jours) (+15 points)
  const activityDate = new Date(activity.date);
  const today = new Date();
  const daysUntil = Math.floor((activityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 0 && daysUntil <= 7) {
    score += 15;
  }

  return Math.round(score);
}

/**
 * Récupérer les suggestions d'un groupe
 */
export async function getGroupSuggestions(groupId: string): Promise<Activity[]> {
  try {
    const suggestionsDoc = await getDoc(doc(db, "groupActivities", groupId));
    
    if (!suggestionsDoc.exists()) {
      console.log("No suggestions found, running algorithm...");
      await suggestActivitiesForGroup(groupId);
      return getGroupSuggestions(groupId); // Retry
    }

    const suggestedIds = suggestionsDoc.data().suggestedActivities || [];
    
    // Récupérer les activités complètes
    const activities: Activity[] = [];
    for (const activityId of suggestedIds) {
      const activityDoc = await getDoc(doc(db, "activities", activityId));
      if (activityDoc.exists()) {
        activities.push({
          id: activityDoc.id,
          ...activityDoc.data()
        } as Activity);
      }
    }

    return activities;
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
}

/**
 * Forcer le recalcul des suggestions (si les intérêts changent)
 */
export async function refreshGroupSuggestions(groupId: string): Promise<ScoredActivity[]> {
  console.log("🔄 Refreshing suggestions...");
  return suggestActivitiesForGroup(groupId);
}