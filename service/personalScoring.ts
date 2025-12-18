// service/personalScoring.ts
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase_Config";

// Interface pour les activités scorées personnellement
export interface PersonalScoredActivity {
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
  latitude?: number;
  longitude?: number;
  // Scoring personnel
  personalScore: number;
  distance?: number; // en km
  matchedInterests: string[];
  scoreBreakdown: {
    interestScore: number;
    distanceScore: number;
    priceScore: number;
    popularityScore: number;
    newScore: number;
  };
}

/**
 * Calculer la distance entre 2 points GPS (formule Haversine)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
}

/**
 * Convertir une adresse en coordonnées GPS (approximation pour Bruxelles)
 * TODO: Utiliser une vraie API de géocodage (Google Maps, Mapbox) en prod
 */
function estimateLocationCoordinates(location: string): { lat: number; lng: number } | null {
  const loc = location.toLowerCase();
  
  // Base de données simplifiée des quartiers de Bruxelles
  const brusselsLocations: { [key: string]: { lat: number; lng: number } } = {
    // Centre
    "bruxelles": { lat: 50.8503, lng: 4.3517 },
    "centre": { lat: 50.8503, lng: 4.3517 },
    "grand place": { lat: 50.8467, lng: 4.3525 },
    
    // Communes
    "ixelles": { lat: 50.8224, lng: 4.3661 },
    "etterbeek": { lat: 50.8372, lng: 4.3883 },
    "schaerbeek": { lat: 50.8676, lng: 4.3731 },
    "anderlecht": { lat: 50.8364, lng: 4.3148 },
    "molenbeek": { lat: 50.8581, lng: 4.3272 },
    "saint-gilles": { lat: 50.8276, lng: 4.3425 },
    "forest": { lat: 50.8106, lng: 4.3198 },
    "uccle": { lat: 50.7989, lng: 4.3347 },
    "woluwe": { lat: 50.8448, lng: 4.4267 },
    "watermael": { lat: 50.8058, lng: 4.4089 },
    "auderghem": { lat: 50.8171, lng: 4.4292 },
    "evere": { lat: 50.8708, lng: 4.4009 },
    "koekelberg": { lat: 50.8606, lng: 4.3272 },
    "jette": { lat: 50.8786, lng: 4.3264 },
    "ganshoren": { lat: 50.8708, lng: 4.3097 },
    "berchem": { lat: 50.8656, lng: 4.2978 },
  };
  
  // Chercher une correspondance
  for (const [key, coords] of Object.entries(brusselsLocations)) {
    if (loc.includes(key)) {
      return coords;
    }
  }
  
  // Par défaut, centre de Bruxelles
  return { lat: 50.8503, lng: 4.3517 };
}

/**
 * ALGORITHME PRINCIPAL - SCORING PERSONNEL
 */
export async function getPersonalizedActivities(): Promise<PersonalScoredActivity[]> {
  console.log("🎯 [ALGO PERSONNEL] Démarrage");
  
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ Pas d'utilisateur connecté");
      return [];
    }
    
    // 1. Récupérer les préférences de l'utilisateur
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      console.log("❌ Utilisateur non trouvé dans Firestore");
      return [];
    }
    
    const userData = userDoc.data();
    const userInterests = (userData.interests || []).map((i: string) => i.toLowerCase());
    const userLocation = userData.location; // { latitude, longitude }
    const userCity = userData.city || "Bruxelles";
    
    console.log(`👤 User: ${user.email}`);
    console.log(`🎯 Intérêts: ${userInterests.join(", ")}`);
    console.log(`📍 Position: ${userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : userCity}`);
    
    // 2. Récupérer toutes les activités
    const activitiesSnapshot = await getDocs(collection(db, "activities"));
    console.log(`📊 ${activitiesSnapshot.size} activités trouvées`);
    
    // 3. Scorer chaque activité
    const scoredActivities: PersonalScoredActivity[] = [];
    
    activitiesSnapshot.forEach((activityDoc) => {
      const data = activityDoc.data();
      
      // Utiliser les coordonnées GPS de l'activité
      const activityLat = data.latitude;
      const activityLng = data.longitude;
      
      // Calculer le score
      const scoring = calculatePersonalScore(
        data,
        userInterests,
        userLocation,
        activityLat,
        activityLng
      );
      
      scoredActivities.push({
        id: activityDoc.id,
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
        latitude: activityLat,
        longitude: activityLng,
        personalScore: scoring.totalScore,
        distance: scoring.distance,
        matchedInterests: scoring.matchedInterests,
        scoreBreakdown: scoring.breakdown,
      });
    });
    
    // 4. Trier par score et limiter aux 20 meilleures
    const topActivities = scoredActivities
      .sort((a, b) => b.personalScore - a.personalScore)
      .slice(0, 20);
    
    console.log(`✅ Top ${topActivities.length} activités personnalisées:`);
    topActivities.slice(0, 5).forEach((act, index) => {
      console.log(`${index + 1}. ${act.title} - ${act.personalScore}pts (${act.distance?.toFixed(1)}km)`);
    });
    
    return topActivities;
    
  } catch (error) {
    console.error("❌ Erreur algo personnel:", error);
    return [];
  }
}

/**
 * CALCUL DU SCORE PERSONNEL
 */
function calculatePersonalScore(
  activity: any,
  userInterests: string[],
  userLocation: { latitude: number; longitude: number } | undefined,
  activityLat: number | undefined,
  activityLng: number | undefined
): {
  totalScore: number;
  distance?: number;
  matchedInterests: string[];
  breakdown: {
    interestScore: number;
    distanceScore: number;
    priceScore: number;
    popularityScore: number;
    newScore: number;
  };
} {
  let interestScore = 0;
  let distanceScore = 0;
  let priceScore = 0;
  let popularityScore = 0;
  let newScore = 0;
  let distance: number | undefined;
  const matchedInterests: string[] = [];
  
  const activityInterests = (activity.interests || []).map((i: string) => i.toLowerCase());
  const activityTitle = (activity.title || "").toLowerCase();
  
  // ========== 1. SCORE D'INTÉRÊTS (50 points max) ==========
  userInterests.forEach((userInt) => {
    // Match exact dans les intérêts
    if (activityInterests.includes(userInt)) {
      interestScore += 15;
      matchedInterests.push(userInt);
      return;
    }
    
    // Match partiel dans les intérêts
    if (activityInterests.some((actInt: string) => 
      actInt.includes(userInt) || userInt.includes(actInt)
    )) {
      interestScore += 10;
      if (!matchedInterests.includes(userInt)) {
        matchedInterests.push(userInt);
      }
      return;
    }
    
    // Match dans le titre
    if (activityTitle.includes(userInt)) {
      interestScore += 8;
      if (!matchedInterests.includes(userInt)) {
        matchedInterests.push(userInt);
      }
    }
  });
  
  // Limiter à 50 points
  interestScore = Math.min(50, interestScore);
  
  // ========== 2. SCORE DE DISTANCE (30 points max) ==========
  if (userLocation && activityLat && activityLng) {
    distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      activityLat,
      activityLng
    );
    
    // Plus c'est proche, plus le score est élevé
    if (distance <= 1) {
      distanceScore = 30; // 0-1 km
    } else if (distance <= 3) {
      distanceScore = 25; // 1-3 km
    } else if (distance <= 5) {
      distanceScore = 20; // 3-5 km
    } else if (distance <= 10) {
      distanceScore = 15; // 5-10 km
    } else if (distance <= 20) {
      distanceScore = 10; // 10-20 km
    } else {
      distanceScore = 5; // 20+ km
    }
  } else {
    // Si pas de géoloc, score moyen
    distanceScore = 15;
  }
  
  // ========== 3. SCORE DE PRIX (10 points max) ==========
  if (activity.price === "Gratuit") {
    priceScore = 10;
  }
  
  // ========== 4. SCORE DE POPULARITÉ (5 points max) ==========
  if (activity.rating && activity.rating >= 4.5) {
    popularityScore = 5;
  } else if (activity.rating && activity.rating >= 4.0) {
    popularityScore = 3;
  }
  
  // ========== 5. SCORE NOUVEAUTÉ (5 points max) ==========
  if (activity.isNew) {
    newScore = 5;
  }
  
  // ========== SCORE TOTAL ==========
  const totalScore = Math.round(
    interestScore + distanceScore + priceScore + popularityScore + newScore
  );
  
  return {
    totalScore,
    distance,
    matchedInterests,
    breakdown: {
      interestScore,
      distanceScore,
      priceScore,
      popularityScore,
      newScore,
    },
  };
}