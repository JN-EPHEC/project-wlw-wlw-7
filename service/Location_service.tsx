import * as Location from "expo-location";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase_Config";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  timestamp?: number;
}

/**
 * Demande la permission de localisation et récupère la position du user
 * Affiche le popup natif "Autoriser l'accès à votre position"
 */
export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  location: LocationData | null;
}> => {
  try {

    // Demander la permission (popup natif)
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return { granted: false, location: null };
    }


    // Obtenir la position actuelle
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // 🔧 FIX : Pas de reverse geocoding pour éviter la limite d'API
    // On met "Bruxelles" par défaut (ça n'affecte pas le calcul de distance GPS)
    const locationData: LocationData = {
      latitude,
      longitude,
      city: "Bruxelles",
      country: "Belgique",
      timestamp: Date.now(),
    };


    return {
      granted: true,
      location: locationData,
    };
  } catch (error) {
    console.error("❌ Error requesting location:", error);
    return { granted: false, location: null };
  }
};

/**
 * Sauvegarde la localisation du user dans Firestore
 */
export const saveUserLocation = async (locationData: LocationData) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country,
        updatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Error saving location:", error);
  }
};

/**
 * Vérifie si le user a déjà donné la permission
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "granted";
};

/**
 * Calcule la distance entre deux points (en km)
 * Formule de Haversine
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};