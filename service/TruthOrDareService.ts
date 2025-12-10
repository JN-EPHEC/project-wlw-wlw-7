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

export interface Game {
  id: string;
  gameCode: string;
  hostId: string;
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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Évite les caractères ambigus (0,O,1,I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Créer une nouvelle partie
export const createGame = async (
  hostId: string,
  hostName: string
): Promise<string> => {
  const gameCode = generateGameCode();

  const gameData = {
    gameCode,
    hostId,
    status: "waiting",
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
};

// Rejoindre une partie avec un code
export const joinGame = async (
  gameCode: string,
  oderId: string,
  playerName: string
): Promise<string | null> => {
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
};

// Importer getDocs (j'ai oublié en haut)

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