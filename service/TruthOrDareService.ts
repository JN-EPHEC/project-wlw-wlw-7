import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase_Config";

// Types
export interface Player {
  oderId: string;
  name: string;
  isHost: boolean;
}

export type GameType = 'base' | 'spicy' | 'jury';

export interface Game {
  id: string;
  gameCode: string;
  hostId: string;
  gameType: GameType; // ✅ NOUVEAU : Type de jeu
  status: "waiting" | "playing" | "finished";
  players: Player[];
  currentPlayerIndex: number;
  currentChallenge: {
    type: "truth" | "dare" | null;
    text: string;
    assignedTo: string;
  } | null;
  createdAt: Date;
}

// Générer un code de partie aléatoire (6 caractères)
const generateGameCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ✅ FONCTION CORRIGÉE pour récupérer le nom de l'utilisateur
const getUserDisplayName = async (userId: string): Promise<string> => {
  try {
    
    const usersQuery = query(
      collection(db, "users"),
      where("uid", "==", userId)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userData = usersSnapshot.docs[0].data();
      const displayName = userData.displayName || userData.username || "Joueur";
      return displayName;
    }
    
    return "Joueur";
  } catch (error) {
    console.error("❌ Error fetching user name:", error);
    return "Joueur";
  }
};

// Créer une nouvelle partie - ✅ CORRIGÉ avec gameType
export const createGame = async (
  hostId: string,
  gameType: GameType = 'base' // ✅ NOUVEAU : Type de jeu par défaut = base
): Promise<string> => {
  try {
    const gameCode = generateGameCode();
    const hostName = await getUserDisplayName(hostId);
    

    const gameData = {
      gameCode,
      hostId,
      gameType, // ✅ NOUVEAU : Stocker le type de jeu
      status: "waiting" as const,
      players: [
        {
          oderId: hostId,
          name: hostName,
          isHost: true,
        },
      ],
      currentPlayerIndex: 0,
      currentChallenge: null,
      createdAt: new Date(),
    };


    const docRef = await addDoc(collection(db, "truthOrDareGames"), gameData);
    
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating game:", error);
    throw error;
  }
};

// Rejoindre une partie avec un code - ✅ CORRIGÉ avec await
export const joinGame = async (
  gameCode: string,
  oderId: string
): Promise<string | null> => {
  try {
    const playerName = await getUserDisplayName(oderId);
    

    // Chercher la partie avec ce code
    const gamesRef = collection(db, "truthOrDareGames");
    const q = query(
      gamesRef,
      where("gameCode", "==", gameCode.toUpperCase()),
      where("status", "==", "waiting")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null; // Partie non trouvée
    }

    const gameDoc = snapshot.docs[0];
    const gameData = gameDoc.data() as Game;

    // Vérifier si le joueur est déjà dans la partie
    const alreadyJoined = gameData.players.some((p) => p.oderId === oderId);
    if (alreadyJoined) {
      return gameDoc.id;
    }

    // Ajouter le joueur
    const updatedPlayers = [
      ...gameData.players,
      {
        oderId,
        name: playerName,
        isHost: false,
      },
    ];

    await updateDoc(doc(db, "truthOrDareGames", gameDoc.id), {
      players: updatedPlayers,
    });

    return gameDoc.id;
  } catch (error) {
    console.error("❌ Error joining game:", error);
    throw error;
  }
};

// Écouter les changements d'une partie en temps réel
export const subscribeToGame = (
  gameId: string,
  callback: (game: Game | null) => void
): (() => void) => {
  const gameRef = doc(db, "truthOrDareGames", gameId);

  const unsubscribe = onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      } as Game);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Quitter une partie
export const leaveGame = async (
  gameId: string,
  oderId: string
): Promise<void> => {
  const gameRef = doc(db, "truthOrDareGames", gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) return;

  const gameData = gameSnap.data() as Game;
  const updatedPlayers = gameData.players.filter((p) => p.oderId !== oderId);

  await updateDoc(gameRef, {
    players: updatedPlayers,
  });
};

// Lancer la partie (host uniquement)
export const startGame = async (gameId: string): Promise<void> => {
  await updateDoc(doc(db, "truthOrDareGames", gameId), {
    status: "playing",
  });
};