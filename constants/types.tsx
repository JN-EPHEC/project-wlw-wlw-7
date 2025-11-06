export type Activity = {
  id: string;
  title: string;
  dateLabel: string; // ex: "Today"
  image: any;        // require(...)
  isFavorite?: boolean;
  tags: string[];    // ex: ["Gratuit", "Nouveau"]
};