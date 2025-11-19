export type Group = {
  id: string;
  name: string;
  members: number;
  lastPollLabel: string;
  lastPollValue: string;
  icon: string;
  badge: string;
  accent: string;
};

export const GROUPS: Group[] = [
  {
    id: "bowling",
    name: "Bowling",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Sortie de ce soir?",
    icon: "🎳",
    badge: "BW",
    accent: "#8bc6ff",
  },
  {
    id: "girls-night",
    name: "Girls Night",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Sortie de ce soir?",
    icon: "💃",
    badge: "GN",
    accent: "#d292ff",
  },
  {
    id: "escalade",
    name: "Escalade",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Escalade ?",
    icon: "🧗",
    badge: "ES",
    accent: "#f6b56b",
  },
  {
    id: "afterwork",
    name: "Afterwork",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Escape Game",
    icon: "🍸",
    badge: "AW",
    accent: "#a1b7ff",
  },
  {
    id: "family",
    name: "Dimanche en famille",
    members: 6,
    lastPollLabel: "Dernier sondage",
    lastPollValue: "Brunch chez mamie",
    icon: "👨‍👩‍👧‍👦",
    badge: "DF",
    accent: "#ff9ea6",
  },
];

export const getGroupById = (id: string): Group | undefined => GROUPS.find((g) => g.id === id);