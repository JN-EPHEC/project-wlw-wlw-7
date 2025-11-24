export type Recommendation = {
    id: string;
    title: string;
    location: string;
    timing: string;
    tags: string[];
    distance: string;
    description: string;
  };
  
  export function getSampleRecommendations(): Recommendation[] {
    return [
      {
        id: "1",
        title: "Afterwork sur un rooftop",
        location: "Ixelles",
        timing: "Aujourd'hui, 18:30",
        tags: ["Cocktails", "Vue panoramique"],
        distance: "1.2 km",
        description: "Musique chill, sunset et boissons signatures à partager.",
      },
      {
        id: "2",
        title: "Soirée quiz entre amis",
        location: "Sainte-Catherine",
        timing: "Demain, 20:00",
        tags: ["Jeux", "Pub"],
        distance: "2.4 km",
        description: "Formez votre équipe et affrontez les autres tables autour de bières locales.",
      },
      {
        id: "3",
        title: "Balade street art guidée",
        location: "Molenbeek",
        timing: "Samedi, 15:00",
        tags: ["Culture", "Extérieur"],
        distance: "3.1 km",
        description: "Découvrez les fresques cachées de Bruxelles avec un guide passionné.",
      },
    ];
  }