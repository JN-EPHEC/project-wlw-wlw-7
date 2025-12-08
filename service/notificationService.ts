import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase_Config';

// TYPES
type NotificationType = "friend_request" | "friend_accept" | "group_invite" | "activity_proposed";

/**
 * Créer une notification dans Firestore
 * (Une Cloud Function l'enverra automatiquement via Expo Push)
 */
export async function createNotification(
  toUserId: string,
  type: NotificationType,
  data: {
    fromUserId?: string;
    fromUsername?: string;
    groupId?: string;
    groupName?: string;
    message: string;
  }
) {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    await addDoc(notificationsRef, {
      toUserId,
      type,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    console.log('✅ Notification créée pour', toUserId);
  } catch (error) {
    console.error('❌ Erreur création notification:', error);
  }
}

/**
 * Envoyer une notification de demande d'ami
 */
export async function sendFriendRequestNotification(
  toUserId: string,
  fromUserId: string,
  fromUsername: string
) {
  await createNotification(toUserId, 'friend_request', {
    fromUserId,
    fromUsername,
    message: `${fromUsername} vous a envoyé une demande d'ami`,
  });
}

/**
 * Envoyer une notification d'acceptation d'ami
 */
export async function sendFriendAcceptNotification(
  toUserId: string,
  fromUserId: string,
  fromUsername: string
) {
  await createNotification(toUserId, 'friend_accept', {
    fromUserId,
    fromUsername,
    message: `${fromUsername} a accepté votre demande d'ami`,
  });
}

/**
 * Envoyer une notification d'invitation à un groupe
 */
export async function sendGroupInviteNotification(
  toUserId: string,
  fromUserId: string,
  fromUsername: string,
  groupId: string,
  groupName: string
) {
  await createNotification(toUserId, 'group_invite', {
    fromUserId,
    fromUsername,
    groupId,
    groupName,
    message: `${fromUsername} vous a ajouté au groupe "${groupName}"`,
  });
}

/**
 * Récupérer le token Expo Push d'un user
 */
export async function getUserPushToken(userId: string): Promise<string | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().expoPushToken || null;
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération token:', error);
    return null;
  }
}

/**
 * FONCTION SIMPLIFIÉE : Envoyer directement une push notification
 * (Sans Cloud Functions pour la démo)
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('✅ Push notification envoyée:', result);
  } catch (error) {
    console.error('❌ Erreur envoi push:', error);
  }
}

/**
 * FONCTION COMPLÈTE : Notifier un user (crée la notif + envoie la push)
 */
export async function notifyUser(
  toUserId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: any
) {
  // 1. Créer la notification dans Firestore
  await createNotification(toUserId, type, {
    message: body,
    ...data,
  });

  // 2. Récupérer le token push du destinataire
  const pushToken = await getUserPushToken(toUserId);
  
  // 3. Envoyer la push notification
  if (pushToken) {
    await sendPushNotification(pushToken, title, body, data);
  }
}