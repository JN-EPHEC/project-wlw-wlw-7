import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase_Config";

// Coordonnées GPS des lieux principaux de Bruxelles
const BRUSSELS_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  // Centre
  "bruxelles - centre": { lat: 50.8503, lng: 4.3517 },
  "grand place": { lat: 50.8467, lng: 4.3525 },
  "gare centrale": { lat: 50.8456, lng: 4.3571 },
  
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
  "woluwe-saint-pierre": { lat: 50.8262, lng: 4.4483 },
  "woluwe-saint-lambert": { lat: 50.8496, lng: 4.4158 },
  "watermael-boitsfort": { lat: 50.8058, lng: 4.4089 },
  "watermael": { lat: 50.8058, lng: 4.4089 },
  "auderghem": { lat: 50.8171, lng: 4.4292 },
  "evere": { lat: 50.8708, lng: 4.4009 },
  "koekelberg": { lat: 50.8606, lng: 4.3272 },
  "jette": { lat: 50.8786, lng: 4.3264 },
  "ganshoren": { lat: 50.8708, lng: 4.3097 },
  "berchem-sainte-agathe": { lat: 50.8656, lng: 4.2978 },
  
  // Quartiers populaires
  "flagey": { lat: 50.8271, lng: 4.3717 },
  "louise": { lat: 50.8364, lng: 4.3517 },
  "sablon": { lat: 50.8408, lng: 4.3561 },
  "marolles": { lat: 50.8392, lng: 4.3492 },
  "midi": { lat: 50.8356, lng: 4.3364 },
  "botanique": { lat: 50.8539, lng: 4.3656 },
  "heysel": { lat: 50.8953, lng: 4.3411 },
  "laeken": { lat: 50.8833, lng: 4.3500 },
  "tour & taxis": { lat: 50.8731, lng: 4.3469 },
  
  // Parcs
  "parc du cinquantenaire": { lat: 50.8405, lng: 4.3911 },
  "bois de la cambre": { lat: 50.8125, lng: 4.3742 },
  "parc léopold": { lat: 50.8397, lng: 4.3794 },
  "parc royal": { lat: 50.8442, lng: 4.3628 },
  "parc josaphat": { lat: 50.8553, lng: 4.3869 },
  
  // Lieux spécifiques
  "atomium": { lat: 50.8950, lng: 4.3417 },
  "mini-europe": { lat: 50.8944, lng: 4.3406 },
  "toison d'or": { lat: 50.8261, lng: 4.3575 },
  
  // Par défaut pour Bruxelles
  "bruxelles": { lat: 50.8503, lng: 4.3517 },
  "brussels": { lat: 50.8503, lng: 4.3517 },
  
  // Hors Bruxelles
  "wemmel": { lat: 50.9097, lng: 4.3053 },
  "liège": { lat: 50.6326, lng: 5.5797 },
  "anvers": { lat: 51.2194, lng: 4.4025 },
  "gand": { lat: 51.0543, lng: 3.7174 },
};

/**
 * Trouve les coordonnées GPS d'une activité basée sur sa location
 */
function findCoordinates(location: string): { latitude: number; longitude: number } {
  const loc = location.toLowerCase();
  
  // Chercher une correspondance exacte ou partielle
  for (const [key, coords] of Object.entries(BRUSSELS_LOCATIONS)) {
    if (loc.includes(key)) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
  }
  
  // Par défaut : centre de Bruxelles
  return { latitude: 50.8503, longitude: 4.3517 };
}

/**
 * FONCTION PRINCIPALE : Ajouter les coordonnées GPS à toutes les activités
 */
export async function addGPSToActivities() {
  
  try {
    const activitiesRef = collection(db, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const activityDoc of activitiesSnapshot.docs) {
      const data = activityDoc.data();
      
      // Si l'activité a déjà des coordonnées, skip
      if (data.latitude && data.longitude) {
        skippedCount++;
        continue;
      }
      
      // Trouver les coordonnées basées sur la location
      const coords = findCoordinates(data.location || "");
      
      // Mettre à jour l'activité dans Firestore
      await updateDoc(doc(db, "activities", activityDoc.id), {
        latitude: coords.latitude,
        longitude: coords.longitude,
        gpsUpdatedAt: new Date().toISOString(),
      });
      
      updatedCount++;
      
      // Petit délai pour ne pas surcharger Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { success: true, updated: updatedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des coordonnées GPS:", error);
    return { success: false, error };
  }
}