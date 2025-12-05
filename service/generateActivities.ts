import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase_Config";

// Données pour générer des activités réalistes
const ACTIVITIES_DATA = [
  // 🎵 MUSIQUE
  {
    title: "Concert de Jazz au Sounds",
    description: "Soirée jazz live avec des artistes locaux dans une ambiance cosy. Venez découvrir les talents de la scène bruxelloise !",
    category: "Musique",
    price: "Gratuit",
    location: "Bruxelles - Ixelles",
    interests: ["musique", "sortie", "culture"],
    isNew: true,
  },
  {
    title: "Festival Couleur Café",
    description: "Le plus grand festival de musiques du monde à Bruxelles. 3 jours de concerts, street food et ambiance festive.",
    category: "Musique",
    price: "Payant",
    location: "Bruxelles - Tour & Taxis",
    interests: ["musique", "festival", "sortie"],
    isNew: false,
  },
  {
    title: "Karaoké au K-Pub",
    description: "Soirée karaoké entre amis ! Box privées disponibles et large choix de chansons françaises et internationales.",
    category: "Musique",
    price: "Payant",
    location: "Bruxelles - Centre",
    interests: ["musique", "sortie", "fun"],
    isNew: false,
  },
  {
    title: "DJ Set Électro au Fuse",
    description: "Nuit électro avec les meilleurs DJs de la scène européenne. Ambiance club underground garantie !",
    category: "Musique",
    price: "Payant",
    location: "Bruxelles - Marolles",
    interests: ["musique", "sortie", "fête"],
    isNew: true,
  },

  // 🎮 GAMING
  {
    title: "Tournoi Super Smash Bros",
    description: "Tournoi amical de Smash Ultimate. Tous niveaux acceptés, prizes pour le top 3 !",
    category: "Gaming",
    price: "Gratuit",
    location: "Bruxelles - ULB",
    interests: ["gaming", "compétition", "fun"],
    isNew: true,
  },
  {
    title: "Escape Game The Room",
    description: "60 minutes pour résoudre l'énigme et vous échapper ! 5 thèmes différents disponibles.",
    category: "Gaming",
    price: "Payant",
    location: "Bruxelles - Sainte-Catherine",
    interests: ["gaming", "énigmes", "groupe"],
    isNew: false,
  },
  {
    title: "LAN Party CS:GO",
    description: "Nuit gaming entre passionnés ! Apportez votre PC, on fournit la connexion fibre et les snacks.",
    category: "Gaming",
    price: "Payant",
    location: "Bruxelles - Anderlecht",
    interests: ["gaming", "compétition", "fun"],
    isNew: false,
  },
  {
    title: "Session Bowling",
    description: "Bowling moderne avec pistes lumineuses, musique et bar. Parfait pour une soirée entre amis !",
    category: "Gaming",
    price: "Payant",
    location: "Bruxelles - Heysel",
    interests: ["sport", "fun", "groupe"],
    isNew: false,
  },

  // 🍕 CUISINE
  {
    title: "Street Food Festival",
    description: "Plus de 50 food trucks internationaux ! Découvrez des saveurs du monde entier.",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Atomium",
    interests: ["cuisine", "découverte", "sortie"],
    isNew: true,
  },
  {
    title: "Atelier Sushi Making",
    description: "Apprenez à faire vos propres sushis avec un chef japonais. Dégustation incluse !",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Ixelles",
    interests: ["cuisine", "apprentissage", "culture"],
    isNew: false,
  },
  {
    title: "Brunch Illimité",
    description: "Buffet brunch à volonté tous les dimanches. Sucré, salé, vegan options disponibles.",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Centre",
    interests: ["cuisine", "détente", "groupe"],
    isNew: false,
  },
  {
    title: "Dégustation de Bières Belges",
    description: "Découvrez 10 bières artisanales belges accompagnées de fromages locaux. Guidé par un sommelier.",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Grand Place",
    interests: ["cuisine", "découverte", "culture"],
    isNew: false,
  },

  // 🎬 CINÉMA & CULTURE
  {
    title: "Cinéma en Plein Air",
    description: "Projection gratuite de films cultes dans le parc. Apportez votre couverture !",
    category: "Cinéma",
    price: "Gratuit",
    location: "Bruxelles - Parc du Cinquantenaire",
    interests: ["cinéma", "culture", "détente"],
    isNew: true,
  },
  {
    title: "Festival du Film Fantastique",
    description: "Une semaine dédiée au cinéma de genre : horreur, SF, fantasy. Avant-premières et rencontres avec réalisateurs.",
    category: "Cinéma",
    price: "Payant",
    location: "Bruxelles - UGC Toison d'Or",
    interests: ["cinéma", "culture", "découverte"],
    isNew: false,
  },
  {
    title: "Soirée Ciné-Quiz",
    description: "Quiz musical sur les BO de films cultes ! Équipes de 4-6 personnes, lots à gagner.",
    category: "Cinéma",
    price: "Gratuit",
    location: "Bruxelles - Flagey",
    interests: ["cinéma", "fun", "groupe"],
    isNew: true,
  },

  // ⚽ SPORT
  {
    title: "Match de Foot en Salle",
    description: "Terrains indoor disponibles à l'heure. Parfait pour organiser un match entre amis !",
    category: "Sport",
    price: "Payant",
    location: "Bruxelles - Woluwe",
    interests: ["sport", "compétition", "groupe"],
    isNew: false,
  },
  {
    title: "Cours de Yoga en Plein Air",
    description: "Session de yoga gratuite tous les samedis matin au parc. Tous niveaux, tapis fournis.",
    category: "Sport",
    price: "Gratuit",
    location: "Bruxelles - Bois de la Cambre",
    interests: ["sport", "bien-être", "nature"],
    isNew: true,
  },
  {
    title: "Laser Game",
    description: "Arène de 1000m² avec différents modes de jeu. Idéal pour un anniversaire ou team building !",
    category: "Sport",
    price: "Payant",
    location: "Bruxelles - Anderlecht",
    interests: ["sport", "fun", "compétition"],
    isNew: false,
  },
  {
    title: "Escalade Indoor",
    description: "Murs d'escalade pour tous niveaux. Cours d'initiation disponibles, équipement fourni.",
    category: "Sport",
    price: "Payant",
    location: "Bruxelles - Ixelles",
    interests: ["sport", "défi", "groupe"],
    isNew: false,
  },
  {
    title: "Run Collectif",
    description: "Jogging en groupe tous les mardis soir. 5-10km selon le niveau, suivi d'un drink.",
    category: "Sport",
    price: "Gratuit",
    location: "Bruxelles - Parc Royal",
    interests: ["sport", "nature", "groupe"],
    isNew: true,
  },

  // 🎨 ART & CULTURE
  {
    title: "Exposition Magritte",
    description: "Rétrospective complète de l'œuvre du maître du surréalisme belge. Collection exceptionnelle.",
    category: "Culture",
    price: "Payant",
    location: "Bruxelles - Musée Magritte",
    interests: ["culture", "art", "découverte"],
    isNew: false,
  },
  {
    title: "Atelier Graffiti",
    description: "Initiez-vous au street art avec un artiste professionnel. Bombes et mur fournis !",
    category: "Culture",
    price: "Payant",
    location: "Bruxelles - Molenbeek",
    interests: ["art", "créativité", "fun"],
    isNew: true,
  },
  {
    title: "Visite Guidée Street Art",
    description: "Tour à pied de 2h pour découvrir les plus belles fresques murales de Bruxelles.",
    category: "Culture",
    price: "Gratuit",
    location: "Bruxelles - Centre",
    interests: ["culture", "art", "découverte"],
    isNew: false,
  },
  {
    title: "Théâtre Impro",
    description: "Spectacle d'improvisation théâtrale hilarant. Le public choisit les thèmes !",
    category: "Culture",
    price: "Payant",
    location: "Bruxelles - Ixelles",
    interests: ["culture", "humour", "sortie"],
    isNew: true,
  },

  // 🌳 NATURE
  {
    title: "Randonnée en Forêt de Soignes",
    description: "Balade guidée de 10km dans la plus grande forêt de Bruxelles. Pique-nique prévu.",
    category: "Nature",
    price: "Gratuit",
    location: "Bruxelles - Forêt de Soignes",
    interests: ["nature", "sport", "détente"],
    isNew: false,
  },
  {
    title: "Pique-nique au Parc",
    description: "Retrouvez-vous pour un pique-nique géant ! Musique, jeux de société et bonne humeur.",
    category: "Nature",
    price: "Gratuit",
    location: "Bruxelles - Parc du Cinquantenaire",
    interests: ["nature", "détente", "groupe"],
    isNew: true,
  },
  {
    title: "Balade Vélo Canal",
    description: "30km le long du canal de Bruxelles. Locations de vélos disponibles sur place.",
    category: "Nature",
    price: "Gratuit",
    location: "Bruxelles - Canal",
    interests: ["nature", "sport", "découverte"],
    isNew: false,
  },

  // 🎉 SOIRÉES & FÊTES
  {
    title: "Soirée Salsa",
    description: "Cours de salsa suivi d'une soirée dansante. Ambiance latine garantie !",
    category: "Soirée",
    price: "Payant",
    location: "Bruxelles - Ixelles",
    interests: ["danse", "musique", "sortie"],
    isNew: false,
  },
  {
    title: "Silent Disco",
    description: "Soirée casque ! 3 DJs en simultané, vous choisissez votre ambiance. Expérience unique.",
    category: "Soirée",
    price: "Payant",
    location: "Bruxelles - Centre",
    interests: ["musique", "fête", "fun"],
    isNew: true,
  },
  {
    title: "Apéro Networking",
    description: "Rencontres professionnelles et amicales autour d'un verre. Idéal pour élargir son réseau.",
    category: "Soirée",
    price: "Gratuit",
    location: "Bruxelles - Louise",
    interests: ["networking", "sortie", "rencontres"],
    isNew: false,
  },
  {
    title: "House Party",
    description: "Soirée privée dans un loft avec DJ. Dress code : stylé ! Liste d'invités limitée.",
    category: "Soirée",
    price: "Payant",
    location: "Bruxelles - Dansaert",
    interests: ["fête", "musique", "sortie"],
    isNew: true,
  },

  // 🎪 ÉVÉNEMENTS SPÉCIAUX
  {
    title: "Marché de Noël",
    description: "Chalets traditionnels, vin chaud, patinoire et grande roue. Magie de Noël garantie !",
    category: "Événement",
    price: "Gratuit",
    location: "Bruxelles - Grand Place",
    interests: ["culture", "sortie", "découverte"],
    isNew: false,
  },
  {
    title: "Fête de la Musique",
    description: "Des centaines de concerts gratuits dans toute la ville. Du midi à minuit !",
    category: "Événement",
    price: "Gratuit",
    location: "Bruxelles - Partout",
    interests: ["musique", "culture", "sortie"],
    isNew: true,
  },
  {
    title: "Brussels Beer Weekend",
    description: "Le plus grand événement bière de Belgique. Dégustations, foodtrucks et concerts.",
    category: "Événement",
    price: "Payant",
    location: "Bruxelles - Grand Place",
    interests: ["cuisine", "découverte", "sortie"],
    isNew: false,
  },
  {
    title: "Braderie de Midi",
    description: "Brocante géante avec plus de 500 stands. Vêtements, meubles, antiquités à petits prix.",
    category: "Événement",
    price: "Gratuit",
    location: "Bruxelles - Midi",
    interests: ["shopping", "découverte", "fun"],
    isNew: false,
  },

  // Activités supplémentaires pour atteindre 50
  {
    title: "Cours de Cuisine Italienne",
    description: "Apprenez à faire des pâtes fraîches et tiramisu maison avec un chef italien.",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Ixelles",
    interests: ["cuisine", "apprentissage", "culture"],
    isNew: false,
  },
  {
    title: "Open Mic Stand-Up",
    description: "Soirée humour avec scène ouverte. Venez rire ou tenter votre chance sur scène !",
    category: "Culture",
    price: "Gratuit",
    location: "Bruxelles - Flagey",
    interests: ["humour", "culture", "sortie"],
    isNew: true,
  },
  {
    title: "Atelier Poterie",
    description: "Créez votre propre céramique sur tour de potier. Session de 3h, cuisson incluse.",
    category: "Culture",
    price: "Payant",
    location: "Bruxelles - Uccle",
    interests: ["art", "créativité", "apprentissage"],
    isNew: false,
  },
  {
    title: "Trampoline Park",
    description: "Parc de trampolines géant avec parcours ninja, dodgeball et zones freestyle.",
    category: "Sport",
    price: "Payant",
    location: "Bruxelles - Zaventem",
    interests: ["sport", "fun", "groupe"],
    isNew: false,
  },
  {
    title: "Soirée Quiz Pub",
    description: "Quiz culture générale en équipes. Thèmes variés, ambiance conviviale, prix à gagner !",
    category: "Culture",
    price: "Gratuit",
    location: "Bruxelles - Centre",
    interests: ["culture", "fun", "groupe"],
    isNew: true,
  },
  {
    title: "Cours de Salsa Débutant",
    description: "Initiation à la salsa cubaine. Pas besoin de partenaire, on tourne !",
    category: "Danse",
    price: "Payant",
    location: "Bruxelles - Saint-Gilles",
    interests: ["danse", "musique", "apprentissage"],
    isNew: false,
  },
  {
    title: "Visite Brasserie Cantillon",
    description: "Découvrez les secrets de fabrication de la bière lambic traditionnelle. Dégustation incluse.",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Anderlecht",
    interests: ["cuisine", "culture", "découverte"],
    isNew: false,
  },
  {
    title: "Paddle sur le Canal",
    description: "Location de paddle boards pour explorer Bruxelles depuis l'eau. Expérience unique !",
    category: "Sport",
    price: "Payant",
    location: "Bruxelles - Canal",
    interests: ["sport", "nature", "découverte"],
    isNew: true,
  },
  {
    title: "Atelier Cocktails",
    description: "Apprenez à faire 5 cocktails classiques avec un barman professionnel. Dégustation garantie !",
    category: "Cuisine",
    price: "Payant",
    location: "Bruxelles - Louise",
    interests: ["cuisine", "apprentissage", "fun"],
    isNew: false,
  },
  {
    title: "Tournoi de Babyfoot",
    description: "Championnat amateur de babyfoot. Inscription en duo, ambiance fun garantie !",
    category: "Gaming",
    price: "Gratuit",
    location: "Bruxelles - ULB",
    interests: ["gaming", "compétition", "fun"],
    isNew: true,
  },
  {
    title: "Méditation en Groupe",
    description: "Session de méditation guidée tous les jeudis soir. Apaisez votre esprit en bonne compagnie.",
    category: "Bien-être",
    price: "Gratuit",
    location: "Bruxelles - Parc Royal",
    interests: ["bien-être", "détente", "nature"],
    isNew: false,
  },
  {
    title: "Jam Session Jazz",
    description: "Soirée impro pour musiciens et mélomanes. Scène ouverte, tous instruments acceptés.",
    category: "Musique",
    price: "Gratuit",
    location: "Bruxelles - Ixelles",
    interests: ["musique", "culture", "créativité"],
    isNew: true,
  },
  {
    title: "Atelier Photo Urbaine",
    description: "Balade photo de 3h dans Bruxelles avec un photographe pro. Conseils et techniques.",
    category: "Culture",
    price: "Payant",
    location: "Bruxelles - Centre",
    interests: ["art", "créativité", "découverte"],
    isNew: false,
  },
  {
    title: "Soirée Blind Test",
    description: "100% musique ! Blind test musical géant avec DJ. Équipes de 4-6 personnes.",
    category: "Musique",
    price: "Gratuit",
    location: "Bruxelles - Flagey",
    interests: ["musique", "fun", "groupe"],
    isNew: true,
  },
  {
    title: "Parc d'Attractions Walibi",
    description: "Journée dans le plus grand parc d'attractions de Belgique. Sensations fortes garanties !",
    category: "Sortie",
    price: "Payant",
    location: "Wavre (30min de Bruxelles)",
    interests: ["fun", "groupe", "découverte"],
    isNew: false,
  },
];

/**
 * Fonction pour générer les dates futures aléatoires
 */
function getRandomFutureDate(): string {
  const today = new Date();
  const daysToAdd = Math.floor(Math.random() * 60) + 1; // Entre 1 et 60 jours
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysToAdd);
  return futureDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
}

/**
 * FONCTION PRINCIPALE : Générer et ajouter les activités dans Firestore
 */
export async function generateActivities() {
  console.log("🚀 Starting to generate activities...");
  
  try {
    const activitiesRef = collection(db, "activities");
    let count = 0;

    for (const activity of ACTIVITIES_DATA) {
      const activityData = {
        ...activity,
        date: getRandomFutureDate(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(activitiesRef, activityData);
      count++;
      console.log(`✅ Added: ${activity.title} (${count}/${ACTIVITIES_DATA.length})`);
      
      // PAUSE DE 200MS ENTRE CHAQUE AJOUT POUR ÉVITER LE RATE LIMIT
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`🎉 Successfully generated ${count} activities!`);
    return { success: true, count };
  } catch (error) {
    console.error("❌ Error generating activities:", error);
    return { success: false, error };
  }
}

/**
 * Fonction helper pour appeler depuis un bouton
 */
export async function initializeActivitiesIfNeeded() {
  try {
    // Vérifier si des activités existent déjà
    const activitiesSnapshot = await getDocs(collection(db, "activities"));
    
    if (activitiesSnapshot.empty) {
      console.log("📊 No activities found, generating...");
      return await generateActivities();
    } else {
      console.log(`ℹ️ ${activitiesSnapshot.size} activities already exist`);
      return { success: true, alreadyExists: true, count: activitiesSnapshot.size };
    }
  } catch (error) {
    console.error("❌ Error checking activities:", error);
    return { success: false, error };
  }
}