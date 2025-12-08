import { Activity } from "./types";


export const ACTIVITIES: Activity[] = [
  {
    id: "concert-001",
    title: "Concert",
    dateLabel: "Today",
    image: require("../assets/images/concert.jpg"), // remplace par ton visuel violet
    isFavorite: false,
    tags: ["Près de moi", "Nouveau"],
  },
  {
    id: "escape-002",
    title: "Escape Game",
    dateLabel: "Tomorrow",
    image: require("../assets/images/escape.jpg"),
    isFavorite: true,
    tags: ["Gratuit"],
  },
  // … ajoute-en d’autres
];