import { calculateDistance } from "./Location_service";

export interface Activity {
  id: string;
  title: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  // ... autres champs
}

/**
 * Filtre les activités selon la distance par rapport au user
 * @param activities - Liste des activités
 * @param userLat - Latitude du user
 * @param userLon - Longitude du user
 * @param maxDistance - Distance maximale en km (par défaut 50km)
 * @returns Activités triées par distance
 */
export const filterActivitiesByDistance = (
  activities: Activity[],
  userLat: number,
  userLon: number,
  maxDistance: number = 10
): Array<Activity & { distance: number }> => {
  // Calculer la distance pour chaque activité
  const activitiesWithDistance = activities.map((activity) => {
    const distance = calculateDistance(
      userLat,
      userLon,
      activity.location.latitude,
      activity.location.longitude
    );

    return {
      ...activity,
      distance,
    };
  });

  // Filtrer par distance maximale
  const filteredActivities = activitiesWithDistance.filter(
    (activity) => activity.distance <= maxDistance
  );

  // Trier par distance (les plus proches en premier)
  const sortedActivities = filteredActivities.sort(
    (a, b) => a.distance - b.distance
  );

  return sortedActivities;
};

/**
 * Formatte la distance pour l'affichage
 * @param distance - Distance en km
 * @returns Texte formaté (ex: "2.5 km" ou "500 m")
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance} km`;
};